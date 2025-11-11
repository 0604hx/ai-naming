const cmdArgs = process.argv.splice(2)

//定义全局变量
global.isPro = Bun.env.NODE_ENV === 'production'
global.isDebug = global.isDebug ??= !global.isPro
global.showSQL = cmdArgs.includes("--sql")

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import Elysia from "elysia";
import config from "./config";
import { setupRoutes } from "./routes";
import logger from "./common/logger";
import { err, ok } from "./common";
import { exec, initDB, setupDB } from "./db";
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors'
import { AuthBean, tableSchemas } from './beans'
import { cloneDeep } from 'lodash-es'
import { createSm4Key, sm4Encrypt, verifyJwtToken } from './common/secret'
import { CONFIG_FILE } from './fields'
import { uuid } from './common/tool'

const initApp = ()=>{
    const app = new Elysia()

    // 注册静态资源插件
    if(config.wwwDir){
        //自动创建目录
        if(!existsSync(config.wwwDir)){
            logger.info(`检测到${config.wwwDir}目录不存在，自动创建...`)
            mkdirSync(config.wwwDir)
        }

        app.use(staticPlugin({ assets: config.wwwDir, prefix: config.wwwPrefix, alwaysStatic: true }))
        // 在 windows 下设置 indexHTML 还是不能自动跳转，固手动跳转
        app.get(config.wwwPrefix, ({ redirect })=> redirect(`${config.wwwPrefix}index.html`))

        logger.info(`开启静态资源 ${config.wwwPrefix}* -> 目录 ${config.wwwDir} 的映射...`)
    }
    // 开发模式下启用 CORS，方便 H5 程序调用
    if(!global.isPro){
        app.use(cors())
    }

    // 统一异常处理
    app.onError(({ error, code, path })=>{
        if(code == 'NOT_FOUND'){
            logger.debug(`[404] ${path}`)
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

            logger.debug(`[${request.method}] ${route}`)

            if(!ua) return
        }
        return
    })

    return app
}

/**
 * 创建配置文件：server.js --config {特权密码}
 */
if(cmdArgs[0] == "--config"){
    //创建 config.json 文件
    let cfg = cloneDeep(config)
    cfg.secret.sm4Key = createSm4Key(uuid())
    cfg.secret.jwtKey = createSm4Key(uuid())

    //生成特权信息
    let presPwd = cmdArgs[1] || uuid()
    cfg.secret.presKey = createSm4Key(uuid())
    cfg.secret.presPwd = sm4Encrypt(presPwd, cfg.secret.presKey)
    logger.info(`特权密码 ${presPwd}，请妥善保管，如需关闭该功能，请清空 presKey/presPwd 任意一项...`)

    writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 4), { encoding: 'utf-8' })
    logger.info(`写入配置内容到配置文件 ${CONFIG_FILE}，如需调整请自行修改 :)`)
    process.exit(0)
}

/**
 * 执行特定的 SQL 语句
 */
if(cmdArgs[0] == '--db'){
    cmdArgs.shift()
    if(!cmdArgs.length){
        logger.error(`请输入 SQL 语句，跟在 --db 后面`)
        process.exit(0)
    }
    setupDB()

    for(let sql of cmdArgs){
        logger.info(`执行 SQL 语句 >> ${sql}`)
        let result = exec(sql)
        logger.info(result)
    }
    process.exit(0)
}

if(cmdArgs.includes("--init")){
    // 初始化数据库
    logger.info(`即将初始化数据库...`)
    initDB(tableSchemas)

    process.exit(0)
}
else{
    const app = initApp()
    setupRoutes(app)

    setupDB()
    app.listen(config.port)

    if(global.showSQL)  logger.info(`SHOW-SQL = true`)

    const v = global.isPro ? process.env.APP_VERSION || APP_VERSION : ""
    logger.info(`APP STARTED ON PORT ${config.port}${v?` (build version ${v})`:""} ^.^`)
}
