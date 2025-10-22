import NodeCache from 'node-cache'

const cache = new NodeCache({ useClones: true })

/**
 *
 * @param {String} key
 * @param {*} value
 * @param {Number} ttl
 * @returns
 */
export const set = (key, value, ttl=2*60*60)=> {
    cache.set(key, value, ttl)
    return value
}

export const get = (key, defaultVal)=> cache.get(key) || defaultVal

export const take = key=> cache.take(key)

/**
 *
 * @param {String} key
 * @returns {Boolean}
 */
export const has = key=> cache.has(key)

/**
 * 删除缓存
 * @param {String|Array<String>} key
 * @returns {Number}
 */
export const del = key=> cache.del(key)

export const keys = ()=> cache.keys()

/**
 *
 * @param {String} key - 关键字
 * @param {Boolean} withPrefix - 是否前缀匹配删除
 * @returns {Number} 删除的个数
 */
export const clear = (key, withPrefix=false)=>{
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

export const stats = ()=> cache.getStats()
