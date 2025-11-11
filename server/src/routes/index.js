import Elysia from "elysia"
import { D, ok } from "../common"
import apiCtrl from "./apiCtrl"
import adminCtrl from "./adminCtrl"
import logger from "../common/logger"

/**
 *
 * @param {Elysia} app
 */
export const setupRoutes = app=>{
    app.get("/common/time", ctx=> {
        if(global.isDebug){
            logger.debug(`REQ_URL\t${ctx.request.url}`)
            logger.debug(`PATH\t${ctx.path}`)
            logger.debug(`ROUTE\t${ctx.route}`)
            logger.debug(`SERVER\t${ctx.server.url}`)
        }
        return ok(D.datetime())
    })
    app.get("/common/empty", ()=>{})

    apiCtrl(app)
    adminCtrl(app)
}