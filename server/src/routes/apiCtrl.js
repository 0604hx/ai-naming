import Elysia from "elysia";
import { getModule, listModule, runModule } from "../service/ModuleService";
import { ok } from "../common";
import logger from "../common/logger";
import { createCoupon, getCoupon } from "../service/CouponService";
import config from "../config";
import { removeTrailingChar, uuid as createUUID } from "../common/tool";
import { count, insertNew } from "../db";
import { TRIAL } from "../fields";
import { Trial } from "../beans";
import { getIp, ipToRegion } from "../common/web";
import { onPageView } from "../service/SystemService";

const moduleAll     = async ctx => {
    let ip = getIp(ctx)
    onPageView(ip)

    return ok(await listModule())
}
const moduleById    = async ({ params:{ id }})=>ok(await getModule(id))

/**
 * 判断是否具备试用资格
 * @param {String} uuid
 * @returns {Number} 试用积分数，-1=未开启，0=无可用，-2=免费额度已用完
 */
const checkTril = uuid=>{
    let { trialSize, trialPreDay } = config.app
    if(trialSize<=0)
        return -1

    // 如果已经存在过，则不能再试用
    if(count(TRIAL, "id=?", uuid)>0)
        return 0

    // 判断是否超过试用每日限额
    if(trialPreDay > 0){
        let now = new Date()
        now.setHours(0, 0, 0, 0)

        if(count(TRIAL, "addOn>=?", now.getTime())>=trialPreDay)
            throw -2
    }
    return trialSize
}

/**
 * @param {Elysia} app
 */
export default app=>{
    app.post("", ctx=>{ Code })
    app.post("/module/all", moduleAll),
    app.get("/module/all", moduleAll),

    app.get("/module/:id", moduleById)
    app.post("/module/:id", moduleById)

    /**
     * 调用取名
     */
    app.post("/run", async ctx => {
        let { id, coupon, params } = ctx.body
        let ip = getIp(ctx)

        onPageView(ip)
        return ok(await runModule(id, coupon, params, ip))
    })

    /**
     * 短链接形式访问积分券
     * 通常用于分享
     */
    app.get("/s/:id", ({redirect, server, path, params:{ id }})=>{
        let host = removeTrailingChar(config.server || server.url.toString())
        let url = `${host}${config.wwwPrefix}/index.html/#/pages-sub/coupon?code=${id}`

        logger.info(`分享 ${path} 跳转到 ${url}`)
        return redirect(url)
    })

    app.post("/coupon/:id", ({ params:{id}})=> ok(getCoupon(id)) )

    /**
     * 领取积分券
     */
    app.post("/coupon/claim", async ctx=>{
        let { id } = ctx.body
        let ip = getIp(ctx)

        logger.info(`客户端 ${ip} 请求领取积分券 ${id}`)

        let coupon = getCoupon(id.trim())
        if(coupon.quota<=0)
            throw `该积分券余额不足`

        return ok(coupon)
    })

    app.post("/trial/check", ({ body:{ uuid }})=> ok(checkTril(uuid)) )
    app.post("/trial/:uuid", async ctx =>{
        let { headers, params:{ uuid } } = ctx

        const trialSign = checkTril(uuid)

        if(trialSign == -1)     throw `未开放试用`
        if(trialSign == -2)     throw `今日试用名额已用完`
        if(trialSign <= 0)      throw `客户端已试用`

        let ip = getIp(ctx)
        let platform = headers['platform']
        let sys = headers['system']

        logger.info(`客户端 ${ip}(${platform}/${sys}) 尝试生产试用积分券 coupon=${trialSign}`)

        let cid = createUUID(config.app.couponLen)
        //创建积分券
        createCoupon({ id: cid, quota: trialSign })

        logger.info(`试用积分券 ${cid} 已生成...`)

        let region = await ipToRegion(ip)

        insertNew(TRIAL, Trial.parse({ id: uuid, cid, region, platform, sys, ip, addOn: Date.now() }))
        logger.info(`保存试用信息 ${uuid} (region=${region} platform=${platform}) sys=${sys}`)

        return ok(cid)
    })
}