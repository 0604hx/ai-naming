import { describe, test, beforeAll } from 'bun:test'
import { consumeCoupon, createCoupon } from '../src/service/CouponService'
import { Coupon } from '../src/beans'
import { delByID, findByID, query, setupDB } from '../src/db'
import { COUPON } from '../src/fields'
import { COUPON_ID } from './abstract'

global.showSQL = true

beforeAll( setupDB )

describe(`积分券单元测试`, ()=>{
    test(`创建新的积分券`, ()=>{
        //删除旧的
        delByID(COUPON, COUPON_ID)

        let result = createCoupon(Coupon.parse({id: COUPON_ID, quota: 10000}))
        console.debug(result)
    })

    test(`获取前10个积分券`, ()=>{
        /**@type {Array<import('../src/beans').CouponType>} */
        let result = query(`SELECT * FROM ${COUPON} LIMIT 10;`)
        console.debug(result)
    })

    test(`按 ID=${COUPON_ID} 查询`, ()=>{
        /**@type {import('../src/beans').CouponType} */
        let coupon = findByID(COUPON, COUPON_ID)

        consumeCoupon(coupon.id, 1)
    })
})