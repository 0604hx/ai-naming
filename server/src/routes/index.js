import { D, success } from "../common"

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
export const setupRoutes = app=>{
    app.get("/time", req=> success(D.datetime()))
}