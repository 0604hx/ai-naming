export * from './http'
export * from './notice'

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
