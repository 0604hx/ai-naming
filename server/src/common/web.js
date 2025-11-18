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
    app.onBeforeHandle( ctx =>{
        let route = ctx.route

        if(route?.startsWith && !route.startsWith("/common/") && !route.startsWith(config.wwwPrefix)){
            let ua = ctx.headers[config.secret.header] || ""

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

                ctx.request.ip = getIp(ctx)
                return
            }

            global.isDebug && logger.debug(`[${ctx.request.method}] ${route}`)

            if(!ua) return
        }
        return
    })

    return app
}

/**
 * 根据IP地址查询归属地（国家/省份），基于ip9服务
 * @param {string} ip - 待查询的IP地址字符串（支持IPv4/IPv6，空字符串则查询当前服务器IP）
 * @returns {Promise<string|null>} 归属地结果或null
 *   - 若IP归属中国：返回省份（如"北京"、"江苏省"）
 *   - 若IP归属其他国家：返回"国家-省份"（如"美国-加利福尼亚州"，省份不存在时仅返回国家）
 *   - 失败情况（网络错误、超时、接口异常等）：返回null
 */
export const ipToRegion = async ip=>{
    try {
        // 构造请求 URL，处理空 IP 情况
        const url = `https://ip9.com.cn/get?ip=${encodeURIComponent(ip || '')}`

        // 发起请求，设置超时时间（5秒）
        const response = await fetch(url, { timeout: 5000 })

        // 状态码非 2xx 视为失败
        if (!response.ok)
            return null

        const result = await response.json()

        // 接口返回状态非成功或数据缺失时视为失败
        if (result.ret !== 200 || !result.data || !result.data.country)
            return null

        const { country, prov } = result.data

        // 按规则返回结果
        return country === '中国' ? prov : `${country}${prov ? '-' + prov : ''}`
    } catch (error) {
        // 所有异常（网络错误、超时、JSON解析失败等）均返回 null
        return null
    }
}

/**
 * 获取真实的IP地址
 * @param {import('elysia').Context} ctx
 */
export const getIp = ctx=>{
    let { headers={} } = ctx
    let xff = headers['x-forwarded-for']

    let ip = (xff && xff.split(',')[0].trim()) || headers['x-real-ip']
    if(!ip){
        ip = ctx.server?.requestIP(ctx.request).address
    }

    // Bun 可能会带 ::ffff: （兼容 IPv6）
    return ip?.replace(/^::ffff:/, '')
}