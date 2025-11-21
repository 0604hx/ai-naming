import { customAlphabet } from 'nanoid'
import { readdirSync, unlinkSync, statSync, rmdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { datetime } from './date'
import os from 'node:os'
import config from '../config'
import { spawnSync } from 'node:child_process'

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 16)

/**
 *
 * @param {String} dir
 */
const emptyDir = dir=>{
    let files = readdirSync(dir)
    files.forEach(f=>{
        let p = resolve(dir, f)
        if(statSync(p).isDirectory()){
            emptyDir(p)
            rmdirSync(p)
        }
        else
            unlinkSync(p)
    })
}

/**
 * 随机生成ID
 * @param {Number} len
 * @returns
 */
export const uuid = (len=16)=> nanoid(len)

export { emptyDir }

/**
 * @typedef {Object} AppStats - 应用运行状态
 * @property {String} arch - 架构
 * @property {String} os - 操作系统
 * @property {String} runtime - 运行时版本
 * @property {String} cpu - 处理器描述信息
 * @property {Number} memTotal - 总内存
 * @property {Number} memUse - 已用内存
 * @property {String} started - 启动日期
 *
 *
 * @returns {AppStats}
 */
export const osAndAppStats = async () => {
    let cpus = os.cpus()
    let speed = cpus.length>0?cpus[0].speed:0
    speed = speed<1000?`${speed}MHz`:`${speed/1000}GHz`

    return {
        platform: os.platform(),
        arch: os.arch(),
        os: os.release(),
        runtime: process.version,
        cpu: `${cpus.length}核心 ${speed}`,
        memTotal: os.totalmem(),
        memUse: process.memoryUsage.rss(),
        started: datetime(new Date(Date.now() - process.uptime()*1000)),
        dbSize: statSync(config.db.file).size,
        dbType: config.db.type
    }
}

/**
 * 执行系统命令行
 * @param {String} cmd
 * @returns {Boolean}
 */
export const runOSCmd = (cmd, args=[])=>{
    let re = spawnSync(cmd, args, {timeout: 1000})
    if(re.status == 0)
        return re.stdout.toString().trim()
    throw re.error? re.error.message : re.stderr.toString().trim()
}

/**
 * 格式化字节数为易读的文件大小
 * @param {Number} bytes - 字节数（需为数字，若为字符串需先转换）
 * @param {Number} decimals - 保留的小数位数（默认 2）
 * @param {String} splitor - 连接符
 * @returns {String} 格式化后的大小字符串（如 "1.23 MB"）
 */
export const formatFileSize = (bytes, decimals = 1, splitor="")=>{
    if (bytes <= 0) return `0${splitor}B`;

    const k = 1024; // 二进制单位（1KB = 1024B），若需十进制（1KB=1000B）可改为 1000
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    // 计算最合适的单位（取对数后向下取整）
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // 格式化数值并拼接单位
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${splitor}${sizes[i]}`;
}

/**
 * 删除字符串结尾的特定字符（如果存在）
 * @param {String} text
 * @param {String} target
 */
export const removeTrailingChar = (text, target="/")=>{
    if(!text || !target)    return text
    console.debug(text, target)
    return text.endsWith(target)?text.slice(0, -target.length):text
}