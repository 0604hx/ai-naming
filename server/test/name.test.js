/**
 * 大模型结果解析
 */

import pc from 'picocolors'
import { test } from 'bun:test'
import { parseNames } from '../src/service/ModuleService'

let texts = [
    `皮宇子
解析：“宇”有广阔宇宙之意，寓意孩子有开阔的胸襟与宏大的志向。
皮睿子
解析：“睿”表聪慧睿智，期望孩子头脑机灵、聪慧过人`,
    `陆鹏瑶 评分：85分 解析：“鹏”寓志向高远，“瑶”似美玉，寓意宝宝如美玉般美好且有远大前程。
陆鹏昕 评分：83分 解析：“鹏”表鹏程万里，“昕”含黎明朝气，象征宝宝未来充满希望与光明`,
    `赖昊宇 85分，“昊”表广阔天空，“宇”含浩瀚宇宙之意，寓意胸怀宽广、有广阔发展空间。
赖昊晨 80分，“昊”承高远，“晨”具朝气，象征新的开始与蓬勃朝气，充满希望。`,
    `荤烨昕 85 “昕”含黎明朝气之意，契合出生时段希望宝宝朝气蓬勃
荤烨瑶 “瑶”似美玉，寓意女宝宝珍贵美好`
]

test(`大模型文本结果解析`, ()=>{
    for(let i=0;i< texts.length;i++){
        console.group(pc.yellow(`-----------------第${i+1}个文本-----------------`))
        console.debug(pc.gray(texts[i]))
        console.debug(parseNames(texts[i]))
        console.groupEnd()
        console.debug()
    }
})
