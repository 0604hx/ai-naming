const cmdArgs = process.argv.splice(2)

//定义全局变量
global.isPro = Bun.env.NODE_ENV === 'production'
global.isDebug = global.isDebug ??= !global.isPro
global.showSQL = cmdArgs.includes("--sql")

import { writeFileSync } from 'node:fs'
import config from "./config";
import { setupRoutes } from "./routes";
import logger from "./common/logger";
import { exec, initDB, query, setupDB } from "./db";
import { tableSchemas } from './beans'
import { cloneDeep } from 'lodash-es'
import { createSm4Key, sm4Encrypt } from './common/secret'
import { CONFIG_FILE } from './fields'
import { uuid } from './common/tool'
import { initWebApp } from './common/web'

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
    cfg.secret.presPwd = sm4Encrypt(btoa(presPwd), cfg.secret.presKey)
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
        let result = /^select /i.test(sql.trim()) ? query(sql) : exec(sql)
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
    const app = initWebApp()
    setupRoutes(app)

    setupDB()
    app.listen(config.port)

    if(global.showSQL)  logger.info(`SHOW-SQL = true`)

    const v = global.isPro ? process.env.APP_VERSION || APP_VERSION : ""
    logger.info(`✓ APP STARTED ON PORT ${config.port}${v?` (build version ${v})`:""} ^.^`)
}
