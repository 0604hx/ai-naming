export * from './http'
export * from './notice'
export * from './date'
export * from './uni'

export const homePage = "/pages/index"
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
    let newItems = Array.isArray(names)?names:[names]
    for(let item of newItems){
        //判断是否重复
        for(let i=0;i<items.length;i++){
            if(items[i].mod == item.mod && items[i].text == item.text){
                items.splice(i, 1)
            }
        }
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

/**
 *
 * @param {String} mod
 */
export const clearNames = (mod, ok)=> getNames().then(items=>{
    if(!items.length)
        return

    items = mod==null?[]:items.filter(v=>v.mod!=mod)
    uni.setStorage({ key:NAMES, data: items })

    ok(items)
})

export const toBase64 = text=>{
    // #ifndef H5
    let arrBuf;
    if(typeof TextDecoder !== 'undefined'){
        arrBuf = new TextEncoder().encode(text)
    }
    else{
        // 手动实现 UTF-8 编码，兼容真机小程序 TextEncoder is not defined
        const bytes = [];
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            if (charCode < 0x80) {
                bytes.push(charCode);
            } else if (charCode < 0x800) {
                bytes.push(0xc0 | (charCode >> 6));
                bytes.push(0x80 | (charCode & 0x3f));
            } else if (charCode < 0x10000) {
                bytes.push(0xe0 | (charCode >> 12));
                bytes.push(0x80 | ((charCode >> 6) & 0x3f));
                bytes.push(0x80 | (charCode & 0x3f));
            } else {
                charCode -= 0x10000;
                bytes.push(0xf0 | (charCode >> 18));
                bytes.push(0x80 | ((charCode >> 12) & 0x3f));
                bytes.push(0x80 | ((charCode >> 6) & 0x3f));
                bytes.push(0x80 | (charCode & 0x3f));
            }
        }
        arrBuf = new Uint8Array(bytes);
    }
    return uni.arrayBufferToBase64(arrBuf)
    // #endif
    // #ifdef H5
    return btoa(text)
    // #endif
}

/**
 * Unit8Array 转字符串
 * @param {Uint8Array} unit8Array
 * @returns {String}
 */
export const base64ToString = unit8Array=>{
    if(typeof TextDecoder !== 'undefined')
        return new TextDecoder().decode(unit8Array)

    // 手动实现 UTF-8 解码
    let str = ''
    let i = 0
    const len = uint8Array.length
    while (i < len) {
        let byte = uint8Array[i]
        let charCode
        if (byte < 0x80) {
            charCode = byte
            i++
        } else if (byte < 0xe0) {
            charCode = ((byte & 0x1f) << 6) | (uint8Array[i + 1] & 0x3f)
            i += 2
        } else if (byte < 0xf0) {
            charCode = ((byte & 0x0f) << 12) | ((uint8Array[i + 1] & 0x3f) << 6) | (uint8Array[i + 2] & 0x3f)
            i += 3
        } else {
            charCode = ((byte & 0x07) << 18) | ((uint8Array[i + 1] & 0x3f) << 12) | ((uint8Array[i + 2] & 0x3f) << 6) | (uint8Array[i + 3] & 0x3f)
            charCode += 0x10000
            i += 4
        }
        str += String.fromCodePoint(charCode)
    }
    return str
}