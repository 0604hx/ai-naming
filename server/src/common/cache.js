import NodeCache from 'node-cache'

const cache = new NodeCache({ useClones: true })

/**
 *
 * @param {String} key
 * @param {*} value
 * @param {Number} ttl
 * @returns
 */
export const setCache = (key, value, ttl=2*60*60)=> {
    cache.set(key, value, ttl)
    return value
}

export const getCache = (key, defaultVal)=> cache.get(key) || defaultVal

export const takeCache = key=> cache.take(key)

/**
 *
 * @param {String} key
 * @returns {Boolean}
 */
export const hasCache = key=> cache.has(key)

/**
 * 删除缓存
 * @param {String|Array<String>} key
 * @returns {Number}
 */
export const delCache = key=> cache.del(key)

export const cacheKeys = ()=> cache.keys()

/**
 *
 * @param {String} key - 关键字
 * @param {Boolean} withPrefix - 是否前缀匹配删除
 * @returns {Number} 删除的个数
 */
export const clearCache = (key, withPrefix=false)=>{
    let count = 0
    if(withPrefix){
        cache.keys()
            .filter(k=>k.startsWith(key))
            .forEach(k=>{
                cache.del(k)
                count ++
            })
    }
    else{
        if(cache.has(key)){
            cache.del(key)
            count++
        }
    }
    return count
}

export const cacheStats = ()=> cache.getStats()

/**
 *
 * @param {String} key - 缓存ID
 * @param {Function} creater - 构建函数
 * @param {Number} exire - 超时，单位秒，默认两小时
 */
export const withCache = async (key, creater, expire=120*60)=>{
    if(hasCache(key)){
        // if(global.isDebug)  logger.debug(`[CACHE] 使用缓存 ${key}`)
        return getCache(key)
    }
    const data = await creater()
    return setCache(key, data, expire)
}