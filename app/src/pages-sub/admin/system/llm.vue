<template>
    <view class="p15">
        <wd-cell-group title="模型ID">
            <wd-input v-model="llm.id" class="ml-4 mr-4" placeholder="对应参数 model" clearable/>
        </wd-cell-group>
        <wd-cell-group title="模型URL" >
            <wd-input v-model="llm.url" class="ml-4 mr-4" placeholder="对应参数 baseUrl" clearable/>
        </wd-cell-group>
        <wd-cell-group title="访问令牌" >
            <wd-input v-model="llm.key" class="ml-4 mr-4" placeholder="对应参数 apiKey" clearable/>
        </wd-cell-group>
        <wd-cell title="TOKEN阈值" class="mt-2" :size="size" :title-width="labelWidth">
            <wd-input-number v-model="llm.maxToken" :step="100" :min="0" :max="5000"/>
        </wd-cell>
        <wd-button class="mt-2" type="primary" size="large" @click="save" :round="false" block :loading="loading">保存配置</wd-button>
    </view>

    <view class="card">
        <view class="head">参数说明</view>
        <view>1. 请查阅大模型供应商获取相关参数</view>
        <view>2. TOKEN 阈值默认是 500，设置大于0的数值才可生效</view>
        <view>3. <wd-text text="请谨慎操作" bold /></view>
    </view>

    <wd-toast />
</template>

<script setup>
    import { RESULT } from '@U'

    const toast = useToast()

    const size = "large"
    const labelWidth = "80px"
    const llm = reactive({ id:"", url:"", key:"", maxToken: 0 })
    const loading = ref(false)

    const save = ()=>{
        if(!(llm.id && llm.url))
            return toast.warning(`ID及URL不能为空`)
        if(!llm.url.startsWith("http"))
            return toast.warning(`URL 必须以 http 开头`)

        loading.value = true
        RESULT(
            "/master/sys-llm", llm,
            d=>{
                loading.value = false

                toast.success(`操作成功`)
            },
            ()=> loading.value = false
        )
    }
</script>