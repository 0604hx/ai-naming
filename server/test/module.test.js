import { describe, expect, test } from 'bun:test'
import { getModule, listModule } from '../src/service/ModuleService'

describe(`模块读取测试`, ()=>{
    test(`读取 module.yaml 文件`, async ()=>{
        let items = await listModule(false)

        console.debug(["id", "name", "price", "sort", "limit"].join("\t"))
        for(let item of items){
            console.debug([item.id, item.name, item.price, item.sort, item.limit].join("\t"))
        }
    })

    test(`显示宝宝取名`, async ()=>{
        console.debug(await getModule('baobao'))
    })
})