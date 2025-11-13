/*
 * @Author: 集成显卡
 * @Date: 2022-12-02 10:05:37
 * @Last Modified by: 集成显卡
 * @Last Modified time: 2025-11-11 18:50:14
 */

import { existsSync, mkdirSync } from "fs"
import { dailyfile, colorConsole } from "tracer"

const dateformat = global.isPro? "yyyy-mm-dd HH:MM:ss.L":"HH:MM:ss.L"

const buildLogger = (withFile=true)=>{
    //创建 logs 目录
    const _dir = global.logDir||"logs"
    if(withFile)
        existsSync(_dir) || mkdirSync(_dir, {recursive: true})
    const format = [
        "{{timestamp}} {{title}} : {{message}}", //default format
    ]
    if(global.isDebug){
        format.push({
                error: "{{timestamp}} {{title}} : {{message}}\n{{stack}}" // error format
        })
    }
    var logger = withFile?
        dailyfile({
            root:_dir,
            logPathFormat: global.logPath ?? "{{root}}/{{date}}.log",//默认日志保存到logs/{日期}.log，如需配置单文件："log.txt"
            format,
            level: !global.isPro || global.isDebug? "debug":"info",
            dateformat: dateformat,
            transport: d=>console.log(d.output)
        })
        :
        colorConsole({
            format,
            dateformat: dateformat,
            preprocess: function (data) {
                data.title = data.title.toUpperCase();
            }
        })
    return logger
}

// 测试环境下只使用 控制台Logger
export default buildLogger(global.isPro == true || process.env.NODE_ENV=='production')
