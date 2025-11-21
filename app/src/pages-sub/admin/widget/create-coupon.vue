<template>
    <view @click="create" class="inline">
        <slot>
            <wd-button :icon="icon" :size="size" :type="type">创建积分券</wd-button>
        </slot>
    </view>
    <wd-toast />
</template>

<script setup>
    import { RESULT, copyText } from '@U'

    const props = defineProps({
        coupon:{type:Number, default: 10},
        type:{type:String, default:"primary"},
        icon:{type:String, default:null},
        size:{type:String, default:"medium"}
    })

    const toast = useToast()
    const message = useMessage()

    const create = ()=> message
        .prompt({
            title: `创建积分券`,
            msg: `默认额度为${props.coupon}`,
            inputType: 'number',
            inputValue: props.coupon,
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
                    .then(() => copyText(d.message, ()=> toast.success(`分享链接已复制`)))
                    .catch(() => copyText(d.data, ()=>toast.success(`券码已复制`)))
            })
        })
        .catch(()=>{})
</script>