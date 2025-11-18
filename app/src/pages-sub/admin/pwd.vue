<template>
    <AdminLayout title="密码验证" :back="false" :right="false">
        <view class="card card-error">
            进入管理员页面前，需进行密码验证，如忘记密码请在服务端重置！
        </view>
        <view class="card">
            <wd-input type="text" size="large" no-border v-model="code" clearable show-password placeholder="请输入管理员密码..." />
        </view>
        <view class="p15 pt-1">
            <wd-button type="primary" size="large" @click="login" :round="false" block :loading="loading">登录</wd-button>
        </view>
    </AdminLayout>
</template>

<script setup>
    import { RESULT, updateToken, adminHomePage } from '@U'
    import { useDataStore } from '@/store'

    import AdminLayout from './widget/layout.vue'

    const dataStore = useDataStore()
    const toast = useToast()
    const router = useRouter()

    let code = ref()
    let loading = ref(false)

    const login = ()=>{
        if(!code.value)
            return toast.warning(`请输入密码`)

        loading.value = true

        RESULT(
            "/master/verify",
            { code: btoa(code.value) },
            d=>{
                toast.success(`验证成功`)

                updateToken(d.data)
                dataStore.setToken(d.data)
                loading.value = false

                setTimeout(()=> router.replace(adminHomePage), 1500)
            },
            ()=> loading.value = false
        )
    }
</script>