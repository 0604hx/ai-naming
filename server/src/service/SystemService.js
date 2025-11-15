import { statSync } from 'node:fs'
import { platform } from 'node:os'
import { stats, withCache } from "../common/cache";
import { datetime } from "../common/date";
import config from "../config";
import { count, query } from "../db";
import { COUPON, LLM_LOG, NAME, TRIAL } from "../fields";

/**@type {Map<String, Number>} */
const pageView = new Map()

/**
 * 对页面访问进行统计
 * @param {String} ip
 * @returns {Promise}
 */
export const onPageView = ip =>new Promise(()=>{
    if(!config.pageViewEnable)  return

    pageView.set(ip, (pageView.get(ip)||0) + 1)
})

export const dashboard = ()=> withCache('dashboard', async ()=>{
    // 新增计算过去7日内的token消耗、试用总数
    let rows = query(`SELECT token FROM ${LLM_LOG} WHERE addOn>?`, Date.now()-7*24*60*60*1000)
    let token = rows.reduce((sum, row)=> sum+row.token, 0)

    return {
        //--------------- START 系统信息 START ---------------
        'os'                : `${platform()} / Bun ${Bun.version}`,
        'uptime'            : datetime(new Date(Date.now() - process.uptime()*1000)),
        'mem'               : process.memoryUsage.rss(),
        'db'                : statSync(config.db.file).size,
        'cache'             : stats().vsize,
        'updateOn'          : datetime(),
        //--------------- END 系统信息 END ---------------
        'coupon'            : count(COUPON),
        'name'              : count(NAME),
        'logs'              : count(LLM_LOG),
        token,
        log                 : rows.length,
        'trial'             : count(TRIAL),
        'pv'                : Array.from(pageView.values()).reduce((sum, v)=> sum+v),
        'uv'                : pageView.size
    }
})