<template>
    <AdminLayout title="历史记录" :tabbar="3" :top="0">
        <wd-table :data :border="false">
            <wd-table-col prop="id" label="ID" width="16%" />
            <wd-table-col prop="mid" label="模块" width="22%" />
            <wd-table-col prop="price" label="积分/令牌" width="22%">
                <template #value="{row}"> {{ row.price }} <wd-text :text="'/'+row.token" size="12px" /> </template>
            </wd-table-col>
            <wd-table-col prop="used" label="耗时" width="14%" />
            <wd-table-col prop="addOn" label="日期" width="26%">
                <template #value="{row}"> {{ date(row.addOn) }} </template>
            </wd-table-col>
        </wd-table>
    </AdminLayout>
</template>

<script setup>
    import { RESULT, datetime, date } from '@U'
    import AdminLayout from './widget/layout.vue'

    let data = ref([])

    const refresh = ()=> RESULT("/master/log-list", { }, d=>{
        data.value = d.data
    })

    onMounted( refresh )
</script>