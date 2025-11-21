<template>
    <view class="inline" :class="clazz" @click="logout">
        <slot>
            <wd-button :class="clazz" :icon :size :type>退出登录</wd-button>
        </slot>
    </view>
</template>

<script setup>
    import { adminPwdPage } from '@U'
    import { useDataStore } from '@/store'

    const props = defineProps({
        clazz:{type:String, default:""},
        type:{type:String, default:"primary"},
        icon:{type:String, default:null},
        size:{type:String, default:"medium"}
    })

    const message = useMessage()
    const dataStore = useDataStore()
    const router = useRouter()

    const logout = ()=>{
        message
            .confirm({
                msg: `确定退出当前登录状态，并跳转到授权页吗？`,
                title: `退出登录`,
                confirmButtonText:"确定"
            })
            .then(()=> {
                dataStore.setToken(null)

                router.replace(adminPwdPage)
            })
            .catch(()=>{})
    }
</script>