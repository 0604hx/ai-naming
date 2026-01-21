<template>
    <Layout title="收藏的名字" :top="0">
        <wd-card title="条件筛选" custom-style="margin: 0px 0px 10px 0px;">
            <wd-row :gutter="10">
                <wd-col :span="24"><wd-input :size="size" placeholder="名称" v-model="form.name"/></wd-col>
                <!-- <wd-col :span="12"><wd-input :size="size" placeholder="模块" v-model="form.mod"/></wd-col> -->
            </wd-row>

            <template #footer>
                <wd-button type="primary" :loading="loading" :size="size" icon="search" @click="refresh" custom-style="margin-left: 10px;">检索</wd-button>
            </template>
        </wd-card>

        <wd-table :data="data" :border="false" :height="height" @row-click="rowClick">
            <wd-table-col prop="name" label="名字" width="30%" />
            <wd-table-col prop="mod" label="模块" width="20%" />
            <wd-table-col prop="addOn" label="收藏日期" width="35%">
                <template #value="{row}"> {{ date(row.addOn) }} </template>
            </wd-table-col>
            <wd-table-col label="操作" width="15%" align="center" prop="">
                <template #value="{row, index}">
                    <wd-icon name="delete" @click.native.stop="remove(row, index)"></wd-icon>
                </template>
            </wd-table-col>
        </wd-table>
        <view class="text-center mt-2">
            <wd-text :text="`显示最近收藏 `+ data.length +` 个结果（最多100个）`" size="12px" />
        </view>
    </Layout>
</template>

<script setup>
    import { RESULT, datetime, date, tableHeight, copyText } from '@U'
    import { useDataStore } from '@/store'

    const toast = useToast()
    const message = useMessage()
    const dataStore = useDataStore()

    const size = "small"
    const height = tableHeight(230)

    let data = ref([])
    let form = reactive({ })
    let loading = ref(false)

    const refresh = ()=> {
        loading.value = true
        RESULT("/mark/list", { uuid: dataStore.uuid, name: form.name }, d=>{
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
            msg:`确定删除收藏的名字 ${row.name}吗？`
        })
        .then(()=>{
            RESULT("/mark/delete", { id:row.id, name:row.name, uuid:row.uuid }, ()=>{
                data.value.splice(index, 1)
                toast.success(`数据已删除`)
            })
        })
        .catch(()=>{})

    onMounted( refresh )
</script>