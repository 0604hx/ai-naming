import { formatFileSize } from "./src/common/tool"
import pc from 'picocolors'

const VERSION = ()=>{
    let now = new Date
    return `v${now.getUTCFullYear() - 2000}.${now.getUTCMonth() + 1}.${now.getUTCDate()}-${now.getHours()}${now.getMinutes()}`
}

const ENV = "production"

const started = Date.now()
const result = await Bun.build({
    entrypoints:["./src/app.js"],
    minify: true,
    outdir:"./dist",
    naming:"[dir]/ai-naming.js",
    target: 'bun',
    env: 'disable',
    define:{
        "APP_VERSION": JSON.stringify(VERSION()),
        "Bun.env.NODE_ENV": JSON.stringify(ENV),
        "process.env.NODE_ENV": JSON.stringify(ENV)
    }
})

if(!result.success){
    console.debug(`Build fail:`, result.logs)
    process.exit(-1)
}

let cwd = process.cwd()

console.debug(pc.green(`\n✅ 构建完成(env=${ENV})，耗时 ${Date.now()-started} ms\n`))
for(let item of result.outputs){
    console.debug(pc.cyan(`${item.path.replace(cwd, "   ")}\t${item.hash}\t${formatFileSize(item.size)}`))
}