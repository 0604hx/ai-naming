import { existsSync, statSync, rmSync, cpSync } from 'node:fs'
import pc from 'picocolors'
import AdmZip from 'adm-zip'

const originDir = "dist/build/h5"
const targetZip = "../server/dist/www.zip"

console.debug()

if(!existsSync(originDir) || !statSync(originDir).isDirectory()){
    console.error(`源目录 ${originDir} 不存在或不是一个有效目录`)
    process.exit()
}

console.debug(`即将开始压缩前端文件...`)

const zip = new AdmZip()
zip.addLocalFolder(originDir)
zip.writeZip(targetZip)

const size = `（大小 ${(statSync(targetZip).size/1024).toFixed(2)} KB）`
console.debug(`成功压缩 ${pc.cyan(originDir)} 到 ${pc.cyan(targetZip)}${pc.gray(size)} :)`)
