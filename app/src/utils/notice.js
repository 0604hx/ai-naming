export const showModal = (content, title="提示")=> uni.showModal({ title, content, showCancel: false })

export const showError = (content, title="运行错误")=>uni.showModal({ title, content, showCancel: false, confirmText:"我知道了" })

/**
* 弹出咨询对话框
* @param {*} title
* @param {*} content
* @param {*} onOk
* @param {*} onCancel
*/
export const showConfirm = (title, content, onOk=()=>{}, onCancel=()=>{})=>{
    uni.showModal({
        title,
        content,
        success(res) {
            if (res.confirm) {
                onOk()
            } else if (res.cancel) {
                onCancel()
            }
        }
    })
}

/**
 * 弹框让用户输入
 * @param {String} title
 * @param {String} content
 * @param {Function} ok
 */
export const showInput = (title, content, ok)=>{
    uni.showModal({
        title,
        content,
        editable: true,
        success: (res) => {
            if (res.confirm == true)
                ok && ok(res.content)
        }
    })
}
