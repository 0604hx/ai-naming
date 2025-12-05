<template>
    <AdminLayout title="试用清单" :top="0">
        <wd-card title="条件筛选" custom-style="margin: 10px 0px 10px 0px;">
            <wd-row :gutter="10">
                <wd-col :span="12"><wd-input :size="size" placeholder="ID" v-model="form.id"/></wd-col>
                <wd-col :span="12"><wd-input :size="size" placeholder="平台" v-model="form.platform"/></wd-col>
            </wd-row>

            <template #footer>
                <wd-button type="primary" :loading="loading" :size="size" icon="search" @click="refresh" custom-style="margin-left: 10px;">检索</wd-button>
            </template>
        </wd-card>

        <wd-table :data="data" :border="false" :height="height" @row-click="rowClick">
            <wd-table-col prop="id" label="ID" width="34%" />
            <wd-table-col prop="region" label="地域" width="20%" />
            <wd-table-col prop="platform" label="平台" width="20%" />
            <wd-table-col prop="addOn" label="日期" width="26%">
                <template #value="{row}"> {{ date(row.addOn) }} </template>
            </wd-table-col>
        </wd-table>
        <view class="text-center mt-2">
            <wd-text :text="`显示前`+form.pageSize+`个结果`" size="12px" />
        </view>
    </AdminLayout>
</template>

<script setup>
    import { RESULT, datetime, date, tableHeight, copyText } from '@U'
    import AdminLayout from './widget/layout.vue'

    const toast = useToast()
    const message = useMessage()
    const size = "small"
    const height = tableHeight(200)

    let data = ref([])
    let form = reactive({ pageSize:20 })
    let loading = ref(false)

    const refresh = ()=> {
        loading.value = true
        RESULT("/master/trial-list", form, d=>{
            data.value = d.data
            loading.value = false
        }, ()=>loading.value = false)
    }

    const rowClick = ({ rowIndex })=>{
        let row = data.value[rowIndex]
        copyText(row.id)
    }

    onMounted( refresh )
</script>