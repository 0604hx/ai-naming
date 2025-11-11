import { statSync } from 'node:fs'
import { platform } from 'node:os'
import { stats, withCache } from "../common/cache";
import { datetime } from "../common/date";
import config from "../config";
import { count } from "../db";
import { COUPON, LLM_LOG, NAME } from "../fields";

export const dashboard = ()=> withCache('dashboard', async ()=>{
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
        'log'               : count(LLM_LOG)
    }
})