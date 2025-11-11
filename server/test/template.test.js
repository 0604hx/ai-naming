import { describe, test } from 'bun:test'
import Mustache from 'mustache'

const params = {
    "姓氏": "李",
    "性别": "男",
    "固定字": "德",
    "固定位置": "中间",
    "示例": ["李白", "杜甫"]
}

describe(`模板测试`, ()=>{
    test(`渲染提示词`, ()=>{
        console.debug(params)
        console.debug(
            Mustache.render(
                `请给{{姓氏}}姓{{性别}}宝宝取名{{#固定字}}，以“{{固定字}}”为{{固定位置}}固定字{{/固定字}}，示例：{{示例}}{{^示例}}暂无示例{{/示例}}`,
                params
            )
        )
    })
})