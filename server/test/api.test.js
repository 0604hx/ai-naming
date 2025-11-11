import { describe, test } from 'bun:test'
import { runModule } from '../src/service/ModuleService'
import { COUPON_ID, useDB } from './abstract'

import { Faker, zh_CN } from '@faker-js/faker'
import { date } from '../src/common/date'

const f = new Faker({ locale: zh_CN})

useDB()

describe(`取名API测试`, ()=>{
    test(`宝宝取名`, async ()=>{
        let names = await runModule(
            "baobao",
            COUPON_ID,
            {
                "姓氏": f.person.lastName(),
                "性别": f.person.sex(),
                "出生日期": date(f.date.birthdate()),
                "固定字": Math.random()>0.1? f.person.firstName()[0]:"",
                "固定位置": Math.random()>0.3?"中间":"末尾"
            }
        )

        console.debug(names)
    })
})