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
