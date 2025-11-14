<!-- 免费试用 -->
<template>
    <wd-transition :show="showTrial" name="fade-down" :duration="600">
        <view class="card card-success">
            <view class="pt-1">现在能免费领 {{ trial }} 积分试用啦！不用注册，手机号、邮箱都不用填，到手就能用🎉</view>
            <view class="text-right mt-3">
                <wd-button size="small" type="info" style="margin-right: 10px;" @click="showTrial=false">暂不需要</wd-button>
                <wd-button size="small" type="success" @click="getTrial">立即领取</wd-button>
            </view>
        </view>
    </wd-transition>

    <wd-toast />
</template>

<script setup>
    import { RESULT } from '@U'
    import { useDataStore } from '@/store'

    const dataStore = useDataStore()
    const toast = useToast()

    let uuid = ""
    const trial = ref(5)
    const showTrial = ref(false)

    const tryTrial = ()=>{
        //如果已经有积分券，则跳过
        if(dataStore.coupon)
            return

        // Initialize the agent at application startup.
        const fpPromise = import('https://openfpcdn.io/fingerprintjs/v5')
            .then(FingerprintJS => FingerprintJS.load())

        // Get the visitor identifier when you need it.
        fpPromise
            .then(fp => fp.get())
            .then(result => {
                uuid = result.visitorId
                console.debug(`获取到客户端指纹`, uuid)

                RESULT("/trial/check", { uuid }, d=>{
                    if(!isNaN(d.data) && d.data>0){
                        trial.value = d.data
                        showTrial.value = true
                    }
                })
            })
    }

    const getTrial = ()=> {
        if(!uuid)   return toast.warning(`无效指纹数据`)

        RESULT(`/trial/${uuid}`, {}, d=>{
            dataStore.setCoupon(d.data)
            toast.success(`免费积分券已领取`)

            showTrial.value = false
        })
    }

    const check = () => {
        nextTick( tryTrial )
        // setTimeout(()=> showTrial.value = true, 2000)
    }

    defineExpose({ check })

</script>