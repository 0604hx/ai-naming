import { date, datetime } from './date'

export * from './http'
export * from './notice'
export * from './date'

export const homePage = "/pages/index/index"
export const adminHomePage = "/pages-sub/admin/index"
export const adminPwdPage = "/pages-sub/admin/pwd"

export const filesize =  (mem, fixed=1, split=" ")=>{
    var G = 0
    var M = 0
    var KB = 0
    mem >= (1 << 30) && (G = (mem / (1 << 30)).toFixed(fixed))
    mem >= (1 << 20) && (mem < (1 << 30)) && (M = (mem / (1 << 20)).toFixed(fixed))
    mem >= (1 << 10) && (mem < (1 << 20)) && (KB = (mem / (1 << 10)).toFixed(fixed))
    return G > 0
        ? G + split + 'GB'
        : M > 0
            ? M + split + 'MB'
            : KB > 0
                ? KB + split + 'KB'
                : mem + split + 'B'
}

/**是否为生产环境 */
export const isPro      = process.env.NODE_ENV == 'production'
/**是否为H5 */
export const isH5       = process.env.UNI_PLATFORM === 'h5'
/**是否为微信小程序 */
export const isWeixin   = process.env.UNI_PLATFORM === 'mp-weixin'
/**是否为APP环境（包含 android、ios） */
export const isApp      = process.env.UNI_PLATFORM === 'app'

// ======================== 业务功能 ========================

const NAMES = "names"
/**
 * 保存取名记录到本地
 * @param {Array<Object>|Object} names
 * @param {Number} max 最大存储数据
 */
export const saveNames = (names, max=50)=> getNames().then(items=>{
    console.debug(`旧列表 ${items.length} 个...`)

    let newItems = Array.isArray(names)?names:[names]
    for(let item of newItems){
        items.unshift(item)
    }
    if(items.length>max)
        items.splice(max)
    uni.setStorage({ key:NAMES, data: items })
})

/**
 *
 * @returns {Promise<Array>}
 */
export const getNames = ()=> new Promise(ok=>{
    uni.getStorage({
        key:NAMES,
        success: ({ data })=>ok(data),
        fail:()=>ok([])
    })
})