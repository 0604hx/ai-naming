<template>
    <Layout title="AI取名大师" :back="false" :tabbar="0" :top="15">
        <wd-row :gutter="16" class="mod-row">
            <wd-col v-for="item in items" :span="(item.col || 1)*12">
                <Mod :bean="item" :bg="uiStore.modBg" @click="jump(item)"/>
            </wd-col>
        </wd-row>
        <view class="text-center p-1">
            <wd-text @longpress="toAdminHome" @dblclick="toAdminHome" :text size="12px" />
        </view>
    </Layout>
</template>

<script setup>
    import { RESULT, adminHomePage } from '@U'
    import { useUIStore } from '@/store'
    import Mod from '@C/mod.vue'

    const uiStore = useUIStore()
    const router = useRouter();

    const text = `欢迎使用，当前版本${__APP_VERSION__}`

    const items = ref([])

    const jump = item=>router.push(`/pages-sub/form?id=${item.id}`)
    const toAdminHome =()=> router.replace(adminHomePage)

    onMounted(() => {
        RESULT("/module/all", {}, d=> items.value = d.data )
    })
</script>

<style scoped>
    .title {
        padding-bottom: 4px;
    }
</style>