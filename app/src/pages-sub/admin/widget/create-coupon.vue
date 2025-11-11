<template>
    <view @click="create" class="inline">
        <slot>
            <wd-button :icon :size :type>创建积分券</wd-button>
        </slot>
    </view>
    <wd-toast />
</template>

<script setup>
    import { RESULT } from '@U'

    const props = defineProps({
        type:{type:String, default:"primary"},
        icon:{type:String, default:null},
        size:{type:String, default:"medium"}
    })

    const toast = useToast()
    const message = useMessage()

    const create = ()=> message
        .prompt({
            title: `创建积分券`,
            msg: `默认额度为10`,
            inputType: 'number',
            inputValue: 10,
            confirmButtonText: "创建"
        })
        .then(({ value })=>{
            RESULT("/master/coupon-create", { quota: parseInt(value) }, d=>{
                message
                    .confirm({
                        title:`创建成功`,
                        msg:`新积分券编号为 ${d.data}`,
                        confirmButtonText: "复制分享链接",
                        cancelButtonText: '复制ID'
                    })
                    .then(() => {
                        navigator.clipboard.writeText(d.message)
                        toast.success(`分享链接已复制`)
                    })
                    .catch(() => {
                        navigator.clipboard.writeText(d.data)
                        toast.success(`券码已复制`)
                    })
            })
        })
        .catch(()=>{})
</script>