import pc from 'picocolors'

export default function UniExpandVueBind(debug=true) {
    debug && console.debug(`使用 vue3 ${pc.cyan("同名简写")}扩展插件 ^.^`)
    return {
        name: 'uni-expand-vue-bind',
        enforce: 'pre', // 在其它处理前执行，避免被 Vue 编译器提前处理

        transform(code, id) {
            if (!id.endsWith('.vue')) return

            // 提取 <template> 内容
            const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
            if (!templateMatch) return

            const template = templateMatch[1]

            // 匹配同名简写的 :prop
            // 条件：
            //   1. 以 :prop 开头
            //   2. prop 支持字母、数字、下划线、短横线
            //   3. 后面紧接空白或 > 或 />
            //   4. 不能有等号（不处理 :prop="xxx"）
            const pattern = /:([a-zA-Z_][\w-]*)\s*(?=[\s>/])/g

            let count = 0
            // 替换同名简写
            const expanded = template.replace(pattern, (match, attr) => {
                count ++
                return `:${attr}="${attr}"`
            })

            // 把展开后的 template 写回原代码
            const newCode = code.replace(
                /<template[^>]*>[\s\S]*?<\/template>/,
                `<template>\n${expanded}\n</template>`
            )
            if(debug && count){
                console.debug(`处理 ${pc.gray(id)} 替换 ${pc.cyan(count)} 个绑定...`)
            }

            return {
                code: newCode,
                map: null
            }
        }
    }
}
