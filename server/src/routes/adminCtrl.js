import Elysia from "elysia";
import { assert, ok } from "../common";
import { delByID, exec, query } from "../db";
import { CONFIG_FILE, COUPON, LLM_LOG, NAME } from "../fields";
import { createCoupon } from "../service/CouponService";
import { removeTrailingChar, uuid } from "../common/tool";
import logger from "../common/logger";
import config from "../config";
import { createJwtToken, sm4Encrypt } from "../common/secret";
import { AuthBean } from "../beans";
import { dashboard, pageViewStats } from "../service/SystemService";
import { writeFileSync } from "node:fs";
import { refreshModule } from "../service/ModuleService";
import { has, get, set } from '../common/cache'

/**
 * @param {Elysia} app
 */
export default app=>{
    app.post('/master/verify', ({ request:{ ip }, body:{ code }})=>{
        let { presKey, presPwd } = config.secret
        if(!(presKey && presPwd))
            throw `未启用管理员功能`

        let cacheKey = `pres@${ip}`
        if(has(cacheKey) && get(cacheKey)>= config.secret.pwdRetryMax){
            logger.error(`客户端 ${ip} 验证失败 ${get(cacheKey)} 次，已被锁定...`)
            throw `管理权限校验次数过多，请稍后再试`
        }

        global.isDebug && logger.debug(`客户端 ${ip} 请求特权验证 CODE=${code}`)
        if(sm4Encrypt(code, presKey) != presPwd){
            // 写入缓存
            if(has(cacheKey))
                set(cacheKey, get(cacheKey)+1)
            else
                set(cacheKey, 1, 7200)

            throw `验证失败`
        }


        let auth = AuthBean.simple(1, ip, true)
        let expiresIn = config.secret.jwtExpire

        logger.info(`生成 ${ip} 的授权 TOKEN，有效期 ${expiresIn}`)
        // 返回 token
        return ok(createJwtToken(auth, config.secret.jwtKey, { expiresIn }))
    })

    //刷新模块数据
    app.post('/master/module-refresh', ()=> {
        refreshModule()
        logger.info(`刷新模块列表...`)
    })

    app.post('/master/overview', async ()=>ok(await dashboard()))

    app.post('/master/overview-pv', async()=> ok(await pageViewStats()))

    app.post('/master/coupon-list', ({ body:{ id, active=false, pageSize=20 }})=>{
        let sql = `SELECT * FROM ${COUPON} WHERE 1=1`
        let ps = []
        if(id){
            sql += ` AND id=?`
            ps.push(id)
        }
        if(active == true)
            sql +=` AND quota>0`

        ps.push(pageSize)

        return ok(query(`${sql} ORDER BY addOn desc LIMIT ?`, ps))
    })

    app.post('/master/coupon-create', ({ server, body:{ quota=10 } })=>{
        let id = uuid(config.app.couponLen)

        logger.info(`创建积分券 id=${id} quota=${quota}`)
        createCoupon({ id, quota })

        let host = removeTrailingChar(config.server || (server?server.url.toString():""))
        return ok(id, `${host}/s/${id}`)
    })

    app.post('/master/coupon-quota', ({ body:{id, quota}})=>{
        assert.isTrue(!isNaN(quota), `余额值无效`)

        logger.info(`修改 ${id} 的余额为 ${quota}`)
        exec(`UPDATE ${COUPON} SET quota=? WHERE id=?`, quota, id)
    })

    app.post('/master/coupon-del', ({ body:{ id }})=>{
        logger.info(`删除积分券 ${id}`)
        delByID(COUPON, id)
    })

    app.post("/master/coupon-share", ({ server, body:{id}})=>{
        let host = removeTrailingChar(config.server || server.url.toString())
        return ok(`${host}/s/${id}`)
    })

    app.post("/master/log-list", ({ body:{pageSize=20,page=1}})=>{
        return ok(query(`SELECT * FROM ${LLM_LOG} ORDER BY id DESC LIMIT ?,?`, (page-1)*pageSize, pageSize))
    })

    app.post("/master/name-list", ({ body:{ name, mod, pageSize=20 }})=>{
        let sql = `SELECT * FROM ${NAME} WHERE 1=1`
        let ps = []
        if(!!name){
            sql += ` AND name like ?`
            ps.push(`%${name}%`)
        }
        if(!!mod){
            sql += ` AND mod=?`
            ps.push(mod)
        }

        ps.push(pageSize)

        return ok(query(`${sql} LIMIT ?`, ps))
    })

    app.post("/master/name-del", ({ body:{name, mod}})=>{
        exec(`DELETE FROM ${NAME} WHERE name=? AND mod=?`, name, mod)
        logger.info(`删除名字 ${mod}/${name}`)
    })

    app.post(
        '/master/sys-llm',
        /**
         * @param {{ body: { id: string, url: string, key: string, maxToken:Number } }} ctx
         */
        async ({ body:{id, url, key, maxToken } })=>{
            logger.info(`尝试更新LLM参数：${id} ${url}`)

            //更新配置
            if(!(id && url && url.startsWith("http")))
                throw `ID、URL 不合规范`

            config.app.llmApiKey = key
            config.app.llmBaseUrl = url
            config.app.llmModelId = id
            if(maxToken > 0)
                config.app.llmMaxToken = maxToken

            //保存到文件
            writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4), { encoding: 'utf-8' })
            logger.info(`配置文件更新成功...`)
        }
    )
}