import { existsSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'
import Elysia from "elysia";
import config from "../config";
import logger from "./logger";
import { err, ok } from ".";
import { cors } from '@elysiajs/cors'
import { AuthBean } from '../beans'
import { verifyJwtToken } from './secret';

const INDEX = "index.html"

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.json': 'application/json; charset=utf-8'
}

/**
 * @returns {Elysia}
 */
export const initWebApp = ()=>{
    const app = new Elysia()

    // 注册静态资源插件
    if(config.wwwEnable == true && config.wwwDir){
        //自动创建目录
        if(!existsSync(config.wwwDir)){
            logger.info(`检测到${config.wwwDir}目录不存在，自动创建...`)
            mkdirSync(config.wwwDir)
        }

        // 使用官方的静态插件有问题，无法正常返回内容😔
        // app.use(staticPlugin({ assets: config.wwwDir, prefix: config.wwwPrefix, alwaysStatic: true, indexHTML: true }))
        // // 在 windows 下设置 indexHTML 还是不能自动跳转，固手动跳转
        app.get(config.wwwPrefix, ({ redirect })=> redirect(`${config.wwwPrefix}/${INDEX}`))

        // 自定义静态资源处理
        app.get(`${config.wwwPrefix}/*`, async ({ path, headers }) => {
            // 去掉 prefix，得到相对路径
            const relPath = path.replace(new RegExp(`^${config.wwwPrefix}`), '') || INDEX
            const filePath = join(config.wwwDir, relPath)

            let file = Bun.file(filePath)

            // 如果文件不存在 → 尝试 fallback index.html（SPA）
            if (!(await file.exists())) {
                // file = Bun.file(join(config.wwwDir, INDEX))
                // if (!(await file.exists()))
                //     return new Response('404 Not Found', { status: 404 })
                return err(`${relPath} NOT FOUND`)
            }

            const ext = extname(filePath)
            const mime = MIME_TYPES[ext] || 'application/octet-stream'

            let ETag

            if(config.wwwEtag){
                const stat = await file.stat()

                // 使用弱验证器
                ETag = `W/${stat.size.toString(16)}${stat.mtime.getTime().toString(16)}`
                let ifNoneMatch = headers['if-none-match']

                // 判断是否过期
                if(ifNoneMatch && ifNoneMatch == ETag){
                    return new Response(null, { status: 304, headers:{ ETag, 'Cache-Control': `public, max-age=${config.wwwCache}` } })
                }
            }

            return new Response(file, {
                headers: {
                    ETag,
                    'Content-Type': mime,
                    'Cache-Control': `public, max-age=${config.wwwCache}`
                }
            })
        })

        logger.info(`✓ 开启 ${config.wwwPrefix}/* -> 目录 ${config.wwwDir} 的映射（ETag=${config.wwwEtag} Age=${config.wwwCache}）`)
    }
    // 开发模式下启用 CORS，方便 H5 程序调用
    if(!global.isPro){
        app.use(cors())
    }

    // 统一异常处理
    app.onError(({ error, code, path })=>{
        if(code == 'NOT_FOUND'){
            global.isDebug && logger.debug(`[404] ${path}`)
            return err(`${path} NOT FOUND`)
        }

        logger.error(`${path} 出错：`, error)
        return err(error.message??error)
    })
    // 空返回值统一处理
    app.onAfterHandle(({ route, responseValue })=>{
        //对于没有调用 Response.send 方法的路由函数，自动返回空结果
        if(responseValue === undefined){
            global.isDebug && logger.debug(`检测到 ${route} 处理函数返回空，自动填充 Result 对象...`)
            return ok()
        }
    })
    // 统一鉴权
    app.onBeforeHandle(({ route, headers, request, server })=>{
        if(route?.startsWith && !route.startsWith("/common/") && !route.startsWith(config.wwwPrefix)){
            let ua = headers[config.secret.header] || ""

            if(route.startsWith("/master/")){
                if(route!='/master/verify'){
                    try{
                        /**@type {AuthBean} */
                        let auth = verifyJwtToken(ua, config.secret.jwtKey)

                        if(auth.boss != true)
                            throw `未特殊授权`
                    }catch(e){
                        logger.error(`授权解析失败：${e.message??e}`)
                        return err(`非法访问`, "NO_PRES")
                    }
                }

                request.ip = server?.requestIP(request).address
                return
            }

            global.isDebug && logger.debug(`[${request.method}] ${route}`)

            if(!ua) return
        }
        return
    })

    return app
}