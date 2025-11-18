<template>
    <Layout title="AI取名大师" :back="false" :tabbar="0" :top="15">
        <Trial ref="trialView" />

        <wd-row :gutter="16" class="mod-row">
            <wd-col v-for="item in items" :span="(item.col || 1)*12">
                <Mod :bean="item" :bg="uiStore.modBg" @tap="jump(item)"/>
            </wd-col>
        </wd-row>
        <view class="text-center p-1">
            <wd-text @click="onClick" :text size="12px" />
        </view>
    </Layout>
</template>

<script setup>
    import { RESULT, adminHomePage } from '@U'
    import { useUIStore } from '@/store'
    import Mod from '@C/mod.vue'
    import Trial from '@C/trial.vue'

    const uiStore = useUIStore()
    const router = useRouter()

    const text = `欢迎使用，当前版本${__APP_VERSION__}`

    const trialView = ref()
    const items = ref([])

    const jump = item=>{
        console.debug("跳转", item)
        router.push(`/pages-sub/form?id=${item.id}`)
    }

    let lastTime = 0
    const onClick = ()=>{
        const now = Date.now()
        if(now - lastTime < 250){
            //处理双击
            router.replace(adminHomePage)
        }
        lastTime = now
    }

    onMounted(() => RESULT("/module/all", {}, d=> {
        items.value = d.data

        trialView.value.check()
    }))
</script>

<style scoped>
    .title {
        padding-bottom: 4px;
    }
</style>