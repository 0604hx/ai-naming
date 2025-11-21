<template>
    <Layout title="兑换积分券">
        <view class="card">
            <wd-input type="text" size="large" no-border v-model="code" center clearable placeholder="请输入券码..." />
        </view>
        <view class="p15 pt-1">
            <wd-button type="primary" size="large" @click="confirm()" :round="false" block :loading="loading">领取积分券</wd-button>
        </view>
    </Layout>
</template>

<script setup>
    import { homePage, RESULT } from '@U'

    import { useDataStore } from '@/store'

    const toast = useToast()
    const message = useMessage()
    const router = useRouter()
    const route = useRoute()

    const dataStore = useDataStore()

    let code = ref()
    let loading = ref(false)

    const confirm = ()=>{
        if(!code.value)
            return toast.warning(`请填写券码`)

        RESULT("/coupon/claim", { id:code.value.trim() }, d=>{
            let { id, quota } = d.data
            dataStore.setCoupon(id)

            message
                .confirm({
                    msg: `已领取积分券（余额 ${quota} 积分）。每次成功取名后，将自动扣除对应积分；积分清零时，该券随即失效。`,
                    title: `领券成功🎉`,
                    confirmButtonText:"前往使用",
                    cancelButtonText: "我知道了"
                })
                .then(()=> router.replace(homePage))
                .catch(()=>{})
        })
    }

    onMounted(() => {
        if(route.query.code){
            code.value = route.query.code
            toast.info(`自动填写券码`)
        }
    })
</script>