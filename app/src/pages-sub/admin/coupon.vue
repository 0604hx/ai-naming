<template>
    <AdminLayout title="积分券管理" :tabbar="1" :top="0">
        <wd-card title="条件筛选" style="margin: 10px 0px 10px 0px;">
            <wd-row :gutter="10">
                <wd-col :span="12"><wd-input :size="size" placeholder="编号" v-model="form.id"/></wd-col>
                <wd-col :span="12">
                    <wd-cell label="仅显示有效">
                        <wd-switch size="20px" v-model="form.active" />
                    </wd-cell>
                </wd-col>
            </wd-row>

            <template #footer>
                <CreateCoupon type="info" :size="size" icon="add-circle" />
                <wd-button type="primary" :loading="loading" :size="size" icon="search" @click="refresh" style="margin-left: 10px;">检索</wd-button>
            </template>
        </wd-card>

        <wd-table :data="data" :border="false">
            <wd-table-col prop="id" label="编号" width="28%">
                <template #value="{row}">
                    <view @click="copy(row.id)">{{ row.id }}</view>
                </template>
            </wd-table-col>
            <wd-table-col prop="quota" label="余额" width="15%">
                <template #value="{row}">
                    <view @click="quota(row)">{{ row.quota }}</view>
                </template>
            </wd-table-col>
            <wd-table-col prop="addOn" label="日期" width="45%">
                <template #value="{row}"> {{ datetime(row.addOn) }} </template>
            </wd-table-col>
            <wd-table-col label="操作" width="12%" align="center" prop="">
                <template #value="{row, index}">
                    <wd-icon name="share" @click="share(row)"></wd-icon>
                    <wd-icon name="delete" class="ml-2" @click="remove(row, index)"></wd-icon>
                </template>
            </wd-table-col>
        </wd-table>
        <view class="text-center mt-2">
            <wd-text :text="`显示前`+form.pageSize+`个结果`" size="12px" />
        </view>
    </AdminLayout>
</template>

<script setup>
    import { RESULT, datetime } from '@U'
    import AdminLayout from './widget/layout.vue'
    import CreateCoupon from './widget/create-coupon.vue'

    const toast = useToast()
    const message = useMessage()
    const size = "small"

    //{ id:"lqxoeL", quota:100, addOn: Date.now() }
    let data = ref([])
    let form = reactive({ id:null, active:false, pageSize:50 })
    let loading = ref(false)

    const refresh = ()=> {
        loading.value = true
        RESULT("/master/coupon-list", form, d=>{
            data.value = d.data
            loading.value = false
        }, ()=>loading.value = false)
    }

    const quota = row=> message
        .prompt({
            title:`修改 ${row.id} 余额`,
            inputType: 'number',
            inputValue: row.quota
        })
        .then(({ value })=>{
            let quota = parseInt(value)
            RESULT("/master/coupon-quota", { id:row.id, quota}, ()=>{
                toast.success(`余额已修改为${quota}`)

                row.quota = quota
            })
        })
        .catch(()=>{})

    const copy = text=>{
        navigator.clipboard.writeText(text)
        toast.success(`编号已复制`)
    }
    const share = row=> RESULT("/master/coupon-share", {id:row.id},d=>{
        navigator.clipboard.writeText(d.data)
        toast.success(`分享链接已复制`)
    })

    const remove = (row, index)=> message
        .confirm({
            title:`删除`,
            msg:`确定删除券码 ${row.id}（余额 ${row.quota}）吗？`
        })
        .then(()=>{
            console.debug(row, index)
            RESULT("/master/coupon-del", { id:row.id }, ()=>{
                data.value.splice(index, 1)
                toast.success(`数据已删除`)
            })
        })
        .catch(()=>{})

    onMounted( refresh )
</script>