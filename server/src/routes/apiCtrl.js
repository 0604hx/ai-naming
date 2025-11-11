import Elysia from "elysia";
import { getModule, listModule, runModule } from "../service/ModuleService";
import { ok } from "../common";
import logger from "../common/logger";
import { getCoupon } from "../service/CouponService";
import config from "../config";
import { removeTrailingChar } from "../common/tool";

const moduleAll     = async ()=> ok(await listModule())
const moduleById    = async ({ params:{ id }})=>ok(await getModule(id))
/**
 * @param {Elysia} app
 */
export default app=>{
    app.post("/module/all", moduleAll),
    app.get("/module/all", moduleAll),

    app.get("/module/:id", moduleById)
    app.post("/module/:id", moduleById)

    /**
     * 调用取名
     */
    app.post("/run", async ({ server, request, body:{ id, coupon, params } })=> {
        let ip = server?.requestIP(request)
        return ok(await runModule(id, coupon, params, ip.address))
    })

    /**
     * 短链接形式访问积分券
     * 通常用于分享
     */
    app.get("/s/:id", ({redirect, server, path, params:{ id }})=>{
        let host = removeTrailingChar(config.server || server.url.toString())
        let url = `${host}${config.wwwPrefix}index.html/#/pages-sub/coupon?code=${id}`

        logger.info(`分享 ${path} 跳转到 ${url}`)
        return redirect(url)
    })

    app.post("/coupon/:id", ({ params:{id}})=> ok(getCoupon(id)) )

    /**
     * 领取积分券
     */
    app.post("/coupon/claim", async ({ server, request, body:{ id }})=>{
        let ip = server?.requestIP(request)
        logger.info(`客户端 ${ip.address} 请求领取积分券 ${id}`)

        let coupon = getCoupon(id)
        if(coupon.quota<=0)
            throw `该积分券余额不足`

        return ok(coupon)
    })
}