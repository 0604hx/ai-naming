<template>
    <AdminLayout title="名字管理" :tabbar="2" :top="0">
        <wd-card title="条件筛选" custom-style="margin: 10px 0px 10px 0px;">
            <wd-row :gutter="10">
                <wd-col :span="12"><wd-input :size="size" placeholder="名称" v-model="form.name"/></wd-col>
                <wd-col :span="12"><wd-input :size="size" placeholder="模块" v-model="form.mod"/></wd-col>
            </wd-row>

            <template #footer>
                <wd-button type="primary" :loading="loading" :size="size" icon="search" @click="refresh" custom-style="margin-left: 10px;">检索</wd-button>
            </template>
        </wd-card>

        <wd-table :data="data" :border="false" :height="height" @row-click="rowClick">
            <wd-table-col prop="name" label="名字" width="18%" />
            <wd-table-col prop="mod" label="模块" width="15%" />
            <wd-table-col prop="score" label="评分" width="14%" />
            <wd-table-col prop="hot" label="热度" width="14%" />
            <wd-table-col prop="addOn" label="日期" width="27%">
                <template #value="{row}"> {{ date(row.addOn) }} </template>
            </wd-table-col>
            <wd-table-col label="操作" width="12%" align="center" prop="">
                <template #value="{row, index}">
                    <wd-icon name="delete" @click.native.stop="remove(row, index)"></wd-icon>
                </template>
            </wd-table-col>
        </wd-table>
        <view class="text-center mt-2">
            <wd-text :text="`按热度显示前`+form.pageSize+`个结果`" size="12px" />
        </view>
    </AdminLayout>
</template>

<script setup>
    import { RESULT, datetime, date, tableHeight, copyText } from '@U'
    import AdminLayout from './widget/layout.vue'

    const toast = useToast()
    const message = useMessage()
    const size = "small"
    const height = tableHeight(260)

    let data = ref([])
    let form = reactive({ pageSize:20 })
    let loading = ref(false)

    const refresh = ()=> {
        loading.value = true
        RESULT("/master/name-list", form, d=>{
            data.value = d.data
            loading.value = false
        }, ()=>loading.value = false)
    }

    const rowClick = ({ rowIndex })=>{
        let row = data.value[rowIndex]
        copyText(row.name)
    }

    const remove = (row, index)=> message
        .confirm({
            title:`删除`,
            msg:`确定删除名字 ${row.name}（模块=${row.mod}）吗？`
        })
        .then(()=>{
            RESULT("/master/name-del", { name:row.name, mod:row.mod }, ()=>{
                data.value.splice(index, 1)
                toast.success(`数据已删除`)
            })
        })
        .catch(()=>{})

    onMounted( refresh )
</script>