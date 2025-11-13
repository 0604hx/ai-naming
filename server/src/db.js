import { Database } from 'bun:sqlite'
import config from './config'
import logger from './common/logger'

/**@type {Database} */
let db = undefined

export const setupDB = ()=>{
    if(db == undefined){
        db = new Database(config.db.file)
        logger.info(`✓ 连接数据文件 ${config.db.file}`)
    }
}

/**
 * 遍历 tables 的定义语句进行建表
 * @param {Array<String>} tables - 建表语句合集
 * @param {Array<String>} others 其他语句
 */
export const initDB = (tables, others=[]) =>{
    setupDB()

    const regex = /CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\(/i
    for(let table of tables){
        let m = table.match(regex)
        if(m && m[1]){
            db.run(table)
            logger.info(`尝试创建表⌈${m[1]}⌋...`)
        }
    }

    for(let sql of others){
        db.run(sql)
        logger.info(sql)
    }
}

/**
 * 数据库执行方法枚举
 * @typedef {'run' | 'all' | 'get'} DBMethod
 *
 *
 * @param {DBMethod} method
 * @param {String} sql
 * @param  {...any} ps
 * @returns
 */
const withDB = (method, sql, ...ps)=>{
    let stmt = db.prepare(sql)
    global.showSQL && logger.info(`[SQL] ${sql}${ps.length>0?` (参数：${ps[0]})`:""}`)

    return stmt[method](...ps)
}

/**
 * 执行语句
 * @param {String} sql
 * @param  {...any} ps
 * @returns {import('bun:sqlite').Changes}
 */
export const exec = (sql, ...ps)=> withDB('run', sql, ...ps)

/**
 *
 * @param {String} sql
 * @param  {...any} ps
 * @returns {Array<Object>}
 */
export const query = (sql, ...ps)=> withDB('all', sql, ...ps)

/**
 *
 * @param {String} table
 * @param {*} id
 * @param {String} idField
 * @returns {Object}
 */
export const findByID = (table, id, idField='id')=> {
    return withDB('get', `SELECT * FROM ${table} WHERE ${idField}=?`, id)
}

export const delByID = (table, id, idField='id')=> withDB('run', `DELETE FROM ${table} WHERE ${idField}=?`, id)

/**
 *
 * @param {String} sql
 * @param  {...any} ps
 * @returns {Object}
 */
export const findFirst = (sql, ...ps)=> withDB('get', sql, ...ps)

/**
 * 获取指定条件的数据行数
 * @param {String} table
 * @param {String} condition
 * @param  {...any} ps
 * @returns {Number}
 */
export const count = (table, condition, ...ps)=> {
    let obj = withDB('get', `SELECT count(*) FROM ${table}${condition?` WHERE ${condition}`:""}`, ...ps)
    return obj['count(*)']
}

/**
 *
 * @param {String} table
 * @param {Object} bean
 * @param {Array<String>} ignores
 */
export const insertNew = (table, bean, ignores=[])=>{
    let fields = Object.keys(bean)
    if(ignores && ignores.length)
        fields = fields.filter(f=>!ignores.includes(f))

    return exec(`INSERT INTO ${table} (${fields.map(f=>f).join(",")}) VALUES (${fields.map(()=>"?").join(",")});`, fields.map(f=>bean[f]))
}