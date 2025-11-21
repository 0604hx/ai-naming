<!-- 显示 PageView -->
<template>
    <Layout title="IP访问记录（临时）" :top="0" :inited>
        <wd-table :data :border="false" :height>
            <wd-table-col prop="ip" label="IP" width="30%" />
            <wd-table-col prop="region" label="地域" width="52%" />
            <wd-table-col prop="count" label="次数" width="18%" />
        </wd-table>
    </Layout>
</template>

<script setup>
    import { RESULT, tableHeight } from '@U'

    let data = ref([])
    let inited = ref(false)
    const height = tableHeight(30)

    onMounted(()=> RESULT("/master/overview-pv", { }, d=>{
        data.value = d.data
        inited.value = true
    }))
</script>