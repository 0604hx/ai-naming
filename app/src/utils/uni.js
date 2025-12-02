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

export const checkMicroUpdate = ()=>{
    // #ifndef H5 || APP-PLUS
    const upManager = uni.getUpdateManager()

    upManager.onCheckForUpdate(res=>{
        if(res && res.hasUpdate){
            uni.showModal({
                title: '更新提示',
                content: '检测到新版本，是否下载新版本并重启小程序？',
                success(res) {
                    if (res.confirm) {
                        uni.showLoading({ title: '小程序更新中' })

                        updateManager.onUpdateReady(function (res) {
                            uni.hideLoading()

                            uni.showModal({
                                title: '更新提示',
                                content: '新版本已经准备好，是否重启应用？',
                                success(res) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    res.confirm && updateManager.applyUpdate()
                                }
                            })
                        })

                        updateManager.onUpdateFailed(function (res) {
                            uni.hideLoading()

                            // 新的版本下载失败
                            uni.showModal({
                                title: '自动更新失败',
                                content: '请您删除当前小程序，重新搜索打开哟~',
                                showCancel: false
                            });
                        })
                    }
                }
            })
        }
    })
    // #endif
}