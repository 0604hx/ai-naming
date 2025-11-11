import { showError } from "./notice"

const {
    VITE_SERVER_URL: baseURL,
    VITE_CONTENT_TYPE,
    VITE_REQUEST_TIMEOUT,
    VITE_TOKEN_KEY,
} = import.meta.env;

const timeout = VITE_REQUEST_TIMEOUT??60000
let header = (()=>{
    let d = uni.getDeviceInfo()
    return {
        [VITE_TOKEN_KEY]:"",
        brand: d.brand,
        platform: d.platform,
        system: d.system,
        'Content-Type': VITE_CONTENT_TYPE
    }
})();

/**
 * 更新 TOKEN 值
 * @param {String} value
 * @returns
 */
export const updateToken = value=> header[VITE_TOKEN_KEY] = value || ""

/**
 * 发起请求
 * @param {String} target
 * @param {Object} data
 * @param {Function} onOk
 * @param {Function} onFail
 */
export const RESULT = (target, data, onOk, onFail)=>{
    let url = `${baseURL}${target}`
    uni.request({
        url, data, header, timeout, method:'POST',
        success: ({ data, statusCode, header }) => {
            if(statusCode == 200 && data.success == true){
                onOk && onOk(data)
            }
            else{
                //当自定义了异常处理函数，就优先调用，当 onFail 返回 true 时不显示系统级别的错误提示
                let notShowError = onFail && onFail(data)===true
                if(!notShowError){
                    let msg = data.message == 'invalid signature'?"无效的TOKEN（可清理缓存后再试）":data.message
                    showError(msg, `操作出错`)
                }
            }
        },
        fail: e => {
            console.error(`请求异常`, e)
            let notShowError = onFail && onFail(data)===true
            if(!notShowError){
                showError(e.errMsg, `网络请求失败`)
            }
        }
    })
}
