import { resolve } from "node:path"
import fastify from "fastify"
import logger from "./logger.js"
import { error, success } from './index.js'
import { verifyJwtToken } from "./secret.js"
// import { AuthBean } from "../beans.js"
// import { loadAuthBean } from "../service/CacheService"
import fastifyStatic from '@fastify/static'
// import { Roles } from "../fields.js"
import jwt from "jsonwebtoken"

/**
 *
 * @param {ServerConfig} config
 */
export const setupApp = config=>{
    const app = fastify({logger: false, disableRequestLogging: true, trustProxy: true })
    app.register(fastifyStatic, {
        root: resolve(process.cwd(), config.wwwDir),
        prefix: config.wwwPrefix
    })

    /*
     * ==================== 添加统一异常处理 ====================
     */
    app.setNotFoundHandler((req, res)=> res.status(404).send(error(`${req.url} NOT FOUND`)))
    app.setErrorHandler((e, req, res)=>{
        let msg = typeof(e) === 'string'?e:e.message
        if(e instanceof jwt.TokenExpiredError){
            return res.status(403).send(error(`403|`+msg))
        }
        global.isDebug && console.error(e)
        logger.error(`[${req.routeOptions.url}]`, msg)
        res.status(200).send(error(msg))
    })

    app.addHook('preHandler', async (req, res)=>{
        const route = req.routeOptions.url
        if(route?.startsWith && !route.startsWith("/common/")){
            let ua = req.headers[config.secret.header] || ""
            if(!ua) return

            /**@type {AuthBean} */
            const auth = verifyJwtToken(ua, config.secret.jwtKey)

            /**@type {AuthBean} */
            let user = await loadAuthBean(auth.id, 120*60, req.ip, auth.aid)
            if(route.startsWith("/system/") && !user.hasRole(Roles.ADMIN)){
                logger.error(`用户#${user?.id}（IP=${req.ip}， ROLES=${user?.roles}）非法访问 ${route}`)
                return res.send(error(`非法访问`))
            }
            else if(route.startsWith("/company/") && !user.hasRole(Roles.ADMIN, Roles.COMPANY_ADMIN)){
                logger.error(`用户#${user?.id}（IP=${req.ip}， ROLES=${user?.roles}）非法访问企业接口 ${route}`)
                return res.send(error(`非法访问（此功能需要 ${Roles.COMPANY_ADMIN} 权限）`))
            }

            req.user = user
        }
    })
    app.addHook('onSend', async (req, res, payload)=>{
        const route = req.routeOptions.url
        if(route?.startsWith && route.startsWith("/common/") && config.http.commonExpire>0){
            res.header('Cache-Control', 'public, max-age='+config.http.commonExpire)
        }

        //对于没有调用 Response.send 方法的路由函数，自动返回空结果
        if(payload === undefined){
            global.isDebug && logger.debug(`检测到 ${route} 处理函数返回空，自动填充 Result 对象...`)
            return JSON.stringify(success())
        }

        return payload
    })

    return app
}
