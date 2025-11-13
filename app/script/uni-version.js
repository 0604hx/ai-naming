/**
 * 将 uni-app 正式版版本号转化为 VUE-CLI 版本号
 *
 * 示例值：
 * 4.56.20250312 -> 3.0.0-4050620250312001
 *
 * npm镜像信息 https://registry.npmmirror.com/-/package/@dcloudio/vite-plugin-uni/dist-tags
 *
 *
 * 用过的版本
 *  3.0.0-4080420251103001
 *  3.0.0-alpha-4080620251107001
 */
import pc from 'picocolors'

if(Bun.argv.length<=2){
    console.error(`😔 请输入正式版本号...`)
    process.exit(0)
}

let version = Bun.argv.pop()
let temp = version.split(".")

let cliVer = `3.0.0-${temp[0]}0${temp[1][0]}0${temp[1][1]}${temp[2].substring(0, 8)}001`
console.debug(`正式版 ${pc.cyan(version)} 对应的 CLI 版本为 ${pc.red(cliVer)}`)