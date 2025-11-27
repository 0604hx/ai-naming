import { withCache, clear } from "../common/cache";
import { existsSync, readFileSync } from 'node:fs'
import logger from "../common/logger";
import { LLMLog, ModuleBeans, Name } from "../beans";
import { parse } from "yaml";
import { COUPON, LLM_LOG, NAME } from "../fields";
import Mustache from 'mustache'
import { callLLM } from "../service/AIService";
import { count, exec, insertNew } from "../db";
import config from "../config";
import { consumeCoupon } from "./CouponService";
import { Faker, ro, zh_CN } from '@faker-js/faker'
import { TinyColor } from '@ctrl/tinycolor'

const CACHE_MODULE = "modules.all"
const CACHE_MODULE_SIMPLE = "module.simple"

export const MODULE_FILE = "module.yaml"
export const MODULE_EXTEND_FILE = "module-extend.yaml"

const readModuleFile = file=>{
    if(!existsSync(file)){
        return []
    }

    let text = readFileSync(file, { encoding:'utf-8' })
    let result = ModuleBeans.safeParse(parse(text))
    if(!result.success)
        throw `模块文件 ${file} 解析失败：${result.error}`

    logger.info(`从 ${file} 读取到 ${result.data.length} 个模块...`)

    return result.data
}

/**
 *
 * @returns {Array<import("../beans").ModuleBeanType>}
 */
export const readModules = ()=>{
    let mods = [...readModuleFile(MODULE_FILE), ...readModuleFile(MODULE_EXTEND_FILE)]

    let { modColors } = config.app
    if(Array.isArray(modColors) && modColors.length){
        let colIndex = 0
        for(let m of mods){
            if(m.icon == null)
                m.icon = {}
            if(m.icon.color == null){
                m.icon.color = modColors[colIndex%modColors.length]
                colIndex ++
            }
        }
    }

    //配置fill色
    for(let m of mods){
        if(m.icon && m.icon.fill == null)
            m.icon.fill = new TinyColor(m.icon.color).darken(30).toHexString()
    }

    return mods
}

/**
 * 获取配置好的全部模块
 * @param {Boolean} simple - 是否只获取简单的属性，默认 true
 * @returns {Promise<Array<import("../beans").ModuleBeanType>>}
 */
export const listModule = (simple=true)=> !simple ? withCache(CACHE_MODULE, ()=> readModules()) : withCache(CACHE_MODULE_SIMPLE, async ()=>{
    let items = await listModule(false)

    return items.map(m=>({ id: m.id, name: m.name, desc:m.desc, icon: m.icon, col: m.col }))
})

export const refreshModule = ()=> {
    clear(CACHE_MODULE)
    clear(CACHE_MODULE_SIMPLE)
}

export const getModule = async id=> {
    let modules = await listModule(false)

    return modules.find(m=>m.id==id)
}

/**
 * 自动识别并解析姓名文本
 * 支持两种格式（带序号/不带序号）
 * @param {String} input - 文本内容
 * @param {Number} expectSize - 期望的名称数量
 * @returns {import("../beans").NameBean[]}
 */
const parseNamesOld = (input, expectSize=-1)=>{
    const lines = input.trim().split(/\r?\n/).filter(Boolean)
    if(lines.length %2 == 1)
        lines.pop()

    /** @type {import("../beans").NameBean[]} */
    const results = []

    /**
     * 一次取两行：标题 + 描述，兼容两种格式
     *  格式1（豆包）: 1. 章德谦 96分
     *  格式2（DeepSeek）: 章德谦 95分
     */
    for (let i = 0; i < lines.length; i += 2) {
        // 支持 #、编号、空格前缀
        const match = lines[i].match(/^(?:[#\s]*\d+\.\s*|[#\s]*)?(\S+)\s*(\d+)分/);
        if (!match){
            logger.error('未识别的内容：', lines[i])
            continue
        }

        results.push({ text:match[1], score: Number(match[2]), desc: lines[i+1] })
    }

    return results
}

/**
 * 一行一条数据
 * @param {String} input - 文本内容
 * @returns {import("../beans").NameBean[]}
 */
export const parseNames = input=>{
    return input.split(/\r?\n/)
        .map(v=>v.trim())   //去除收尾空格
        .filter(Boolean)    //忽略空行
        .map(v=>{
            const match = v.match(/^(\S+?)\s*(\d+)(?:分)?\s*(.*)$/)
            if(!match){
                logger.error(`[无法识别] ${v}`)
                return null
            }

            return {
                text: match[1].trim(),
                score: config.app.showScore ? Number(match[2]) : null,
                desc: match[3]
            }
        })
        .filter(Boolean)
}

/**
 * 生成随机姓名
 * @param {Number} size
 * @returns {import("../beans").NameBean[]}
 */
export const createRandomNames = size=>{
    let names = []

    const f = new Faker({ locale: zh_CN})
    for(let i=0;i<size;i++){
        names.push({
            text:f.person.fullName(),
            score: config.app.showScore? Math.floor(Math.random()*100):0,
            desc: `${f.location.city()}${f.location.streetAddress()}`
        })
    }
    return names
}

/**
 *
 * @param {String} id
 * @param {String} coupon
 * @param {Object} params
 * @param {String} ip
 * @returns
 */
export const runModule = async (id, coupon, params={}, ip=null)=>{
    logger.info(`调用 ${id} 取名...`)
    global.isDebug && logger.debug(`参数`, params)

    let mod = await getModule(id)
    if(!(mod && mod.prompt))
        throw `模块（ID=${id}）无效`

    //判断是否积分券可用
    if(count(COUPON, `id=? AND quota>=?`, coupon, mod.price)<=0)
        throw `积分券 ${coupon} 余额不足`

    //构建提示语句
    const prompt = Mustache.render(mod.prompt, {...params, limit: mod.limit })
    global.isDebug && logger.debug(`[提示词] ${prompt}`)

    if(config.app.useMock){
        logger.debug(`已启用 MOCK，随机返回取名结果...`)
        return createRandomNames(mod.limit)
    }

    let messages = []
    if(mod.message) messages.push(mod.message)
    messages.push(Mustache.render(config.app.prompt, mod))

    let { content, used, token } = await callLLM(prompt, messages)

    /**@type {Array<import("../beans").NameBean>} */
    let names = parseNames(content)

    if(names.length)
        consumeCoupon(coupon, mod.price)

    insertNew(LLM_LOG, LLMLog.parse({ mid:mod.id, uid: coupon, used, token, price:mod.price, ip, addOn: Date.now()}))

    //启用异步任务，不阻塞请求的返回
    ;(async ()=>{
        let addOn = Date.now()

        for(let bean of names){
            try{
                let row = Name.parse(bean)
                row.addOn = addOn
                row.mod = mod.name
                row.name = bean.text

                let result = exec(`UPDATE ${NAME} SET hot=hot+1 WHERE name=? AND mod=?`, row.name, row.mod)
                if(result.changes==0){
                    insertNew(NAME, row)
                    logger.info(`入库名字 ${row.name}/${row.mod} ${row.score}`)
                }
            }catch(e){
                logger.error(`[异步入库出错] ${e.message??e}`)
            }
        }
    })()

    return names
}