import { rmSync, cpSync } from 'node:fs'
import pc from 'picocolors'

const originDir = "dist/build/h5"
const target = "../server/dist/h5"

console.debug(`将 ${pc.cyan(originDir)} 复制到 ${pc.cyan(target)}`)

rmSync(target, { recursive: true, force: true })
cpSync(originDir, target, { recursive:true })