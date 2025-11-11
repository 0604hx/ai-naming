import { beforeAll } from 'bun:test'
import { setupDB } from '../src/db'
global.isDebug = true

export const COUPON_ID = "EUqVMk3RCm"

export const useDB = ()=> beforeAll(()=>{
    global.showSQL = true
    setupDB()
})