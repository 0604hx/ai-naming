import { z } from 'zod'

export class AuthBean {
    id      = 0
    name    = ""
    ip      = undefined //IP地址
    boss    = false   //是否管理员

    constructor(id=0,name="",ip=undefined, boss=false){
        this.id     = id
        this.name   = name
        this.ip     = ip
        this.boss   = boss == true
    }

    /**
     *
     * @param {Number} id
     * @param {String} ip
     * @returns
     */
    static simple = (id, ip, boss)=>({id, ip, boss})

    get fullName(){
        return `${this.name}(${this.id})`
    }

    hasRole (...role){
        return role.some(r=>this.roles.includes(r))
    }
}

const FormTypes = ["TEXT", "NUMBER", "SWITCH", "DATE", "TIME", "SELECT", "RADIO"]

/**
 * 建表语句，请以 CREATE TABLE IF NOT EXISTS 开头
 */
export const tableSchemas = [
    `CREATE TABLE IF NOT EXISTS coupon (
        id TEXT PRIMARY KEY NOT NULL,
        uid TEXT DEFAULT NULL,
        quota INTEGER NOT NULL,
        addOn INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS llm_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT DEFAULT NULL,
        mid TEXT DEFAULT NULL,
        price INTEGER NOT NULL,
        token INTEGER DEFAULT NULL,
        used INTEGER,
        ip TEXT DEFAULT NULL,
        addOn INTEGER
    );`,
    `CREATE TABLE IF NOT EXISTS name (
        name TEXT NOT NULL,
        mod TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        hot INTEGER DEFAULT 0,
        addOn INTEGER,
        PRIMARY KEY (name, mod)
    );`,
    `CREATE TABLE IF NOT EXISTS trial (
        id TEXT PRIMARY KEY NOT NULL,
        cid TEXT DEFAULT NULL,
        ip TEXT DEFAULT NULL,
        region TEXT DEFAULT NULL,
        platform TEXT DEFAULT NULL,
        sys TEXT DEFAULT NULL,
        addOn INTEGER
    );`
]
export const otherSqls = [
    //为 mod 字段建立单独索引（便于按 mod 查询）
    `CREATE INDEX IF NOT EXISTS idx_name_mod ON name (mod);`
]

export const Coupon = z.object({
    /**券编号 */
    id: z.string().default(null),
    uid: z.string().default(null),
    quota: z.number().default(10),
    addOn: z.number().default(null)
})
export const LLMLog = z.object({
    id: z.number().default(null),
    /**用户ID（8位）或者券码（10位） */
    uid: z.string().default(null),
    /**模块ID */
    mid: z.string().default(null),
    /**消耗积分 */
    price: z.number().default(0),
    token: z.number().default(null),
    /**耗时，单位 ms */
    used: z.number().default(0),
    /**IP地址 */
    ip: z.string().default(null),
    addOn: z.number().default(null)
})
export const Name = z.object({
    name: z.string().default(null),
    mod: z.string().default(null),
    score: z.number().nullable().default(null),
    hot: z.number().default(0),
    addOn : z.number().default(null)
})
export const Trial = z.object({
    id: z.string().default(null),
    /**积分券ID */
    cid: z.string().default(null),
    ip: z.string().default(null),
    region: z.string().default(null),
    /**客户端平台 */
    platform: z.string().default(null),
    /**客户端操作系统 */
    sys: z.string().default(null),
    addOn: z.number().default(null)
})


/**
 * 模块对象
 */
export const ModuleBean = z.object({
    /**模块编号，通常使用全拼 */
    id: z.string(),
    /**模块名称 */
    name: z.string(),
    /**模块描述信息，通常不超过15个字为佳 */
    desc: z.string().default(null),
    icon: z.object({
        color: z.string().default(null),
        svg: z.string().default(null),
        fill: z.string().default(null)
    }).default(null),
    col: z.number().default(1),
    /**模块调用一次消耗的积分/能量，默认1 */
    price: z.number().default(1),
    /**模块排序值，越大越靠前，默认 0 */
    sort: z.number().default(0),
    /**模块调用一次生成的名字个数，默认 1 */
    limit: z.number().default(1),
    params: z.array(z.object({
        label: z.string(),
        required: z.boolean().default(false),
        max: z.number().default(null),
        desc: z.string().default(null),
        type: z.enum(FormTypes).default(FormTypes[0]),
        defVal: z.any().default(null),
        items: z.array(z.string()).default(null),
        multiple: z.boolean().default(null)
    })).default([]),
    /**系统角色提示词 */
    message: z.string().default(null),
    /**用户提示词模板 */
    prompt: z.string().default(null)
})

export const ModuleBeans = z.array(ModuleBean)

/**
 * @typedef {Object} NameBean
 * @property {String} text - 名称
 * @property {String} desc - 描述信息
 * @property {Number} score - 价值得分
 *
 * @typedef {Object} LLMResult
 * @property {String} content 大模型返回结果
 * @property {Number} used 耗时
 * @property {Number} token token消耗
 *
 * @typedef {z.infer<typeof ModuleBean>} ModuleBeanType
 * @typedef {z.infer<typeof Coupon>} CouponType
 * @typedef {z.infer<typeof LLMLog>} LLMLogType
 * @typedef {z.infer<typeof Name>} NameType
 * @typedef {z.infer<typeof Trial>} TrialType
 */