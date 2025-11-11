import { adminPwdPage } from '@U'

export const failFunc = router => ({ data })=>{
    console.debug(data, router)
    if(data=="NO_PRES"){
        console.debug(`用户未授权，即将跳转到验证页面...`)
        router.replace(adminPwdPage)
    }
}