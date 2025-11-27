let canUseHeight = undefined

/**
 * 计算表格高度，仅适用于非H5
 * @param  {Number} ignore
 * @returns {Number}
 */
export const tableHeight = (ignore)=>{
    if(canUseHeight == undefined){
        let other = 30
        let { safeAreaInsets, windowHeight } = uni.getSystemInfoSync()

        canUseHeight = windowHeight - safeAreaInsets.bottom - safeAreaInsets.top - other
    }
    return canUseHeight - ignore
}

/**
 *
 * @param {String} data
 * @param {Function} onOk 回调函数
 */
export const copyText = (data, onOk) => {
    let showToast = !onOk
    uni.setClipboardData({
        data,
        showToast,
        success: ()=>{
            if(onOk){
                // #ifndef H5
                // 小程序还是会默认弹窗
                uni.hideToast()
                // #endif
                onOk()
            }
        },
        fail: e=> uni.showModal({ title:`复制失败`, content: e.message??e})
    })
}