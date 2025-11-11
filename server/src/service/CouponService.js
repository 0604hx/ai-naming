import logger from "../common/logger"
import { uuid } from "../common/tool"
import config from "../config"
import { exec, findByID, insertNew } from "../db"
import { COUPON } from "../fields"

/**
 *
 * @param {import("../beans").CouponType} bean
 */
export const createCoupon = bean=>{
    bean.addOn ??= Date.now()
    if(bean.quota <= 0)
        bean.quota = config.app.couponQuota

    bean.id ??= uuid(config.app.couponLen)
    return insertNew(COUPON, bean)
}

/**
 *
 * @param {String} id
 * @param {Boolean} strict 如果不存在则报错
 * @returns {import("../beans").CouponType}
 */
export const getCoupon = (id, strict=true)=>{
    let bean = findByID(COUPON, id)
    if(!bean)
        throw `积分券${id}不存在`

    return bean
}

/**
 * 消耗积分
 * @param {String} id
 * @param {Number} value
 */
export const consumeCoupon = (id, value=1)=>{
    exec(`UPDATE ${COUPON} SET quota=quota-${value} WHERE id=?`, id)
    logger.info(`积分券#${id}余额-${value}`)
}