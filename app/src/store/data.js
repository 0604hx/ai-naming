import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
    state:()=>({
        coupon: null,
        token: null
    }),
    actions: {
        setCoupon (v){
            this.coupon = v
            console.debug(`激活积分券`, v)
        },
        setToken (v){
            this.token = v
        }
    },
    unistorage: true
})
