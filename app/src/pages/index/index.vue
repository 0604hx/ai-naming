<template>
    <Layout title="UNI-APP快速开发模板" :back="false" :tabbar="0">
        <div class="card">
            <view class="text-center">
                <view class="my-4">
                    <text class="text-gray-400 font-bold">{{ title }}</text>
                </view>
                <view class="flex my-4">
                    <button class="sn-btn-default" @click="handlePlus">
                        <view class="sn-icon-park-outline:plus mr-1"></view>
                        增加
                    </button>
                    <view class="text-center font-bold text-4xl">
                        {{ num }}
                    </view>
                    <button class="sn-btn-default" @click="handleMinus">
                        <view class="sn-icon-park-outline:minus mr-1"></view>
                        减少
                    </button>
                </view>
            </view>
        </div>

        <view class="mt-2">
            <wd-card title="关于UNI-APP">
                <wd-tag type="primary">uni-app</wd-tag> 是一个使用 <wd-tag type="primary">Vue.js</wd-tag> 开发所有前端应用的框架，
                开发者编写一套代码，可发布到iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/飞书/QQ/快手/钉钉/淘宝）、快应用等多个平台。
                <template #footer>
                    <wd-button size="small" plain @click="handleToDetail" type="primary">查看详情</wd-button>
                </template>
            </wd-card>
        </view>

        <wd-card title="请求测试">
            <div class="space vertical">
                <div>使用 uni.request 方法</div>
                <wd-button type="primary" block plain @click="requestStatus">发起请求</wd-button>
                <!-- <wd-button type="primary" plain>带参数的请求</wd-button> -->
            </div>
        </wd-card>

        <wd-card title="配色卡片">
            <wd-row :gutter="8" class="text-center">
                <wd-col :span="6"><div class="card card-info m-0">主要</div></wd-col>
                <wd-col :span="6"><div class="card card-success m-0">成功</div></wd-col>
                <wd-col :span="6"><div class="card card-warning m-0">警告</div></wd-col>
                <wd-col :span="6"><div class="card card-error m-0">危险</div></wd-col>
            </wd-row>
        </wd-card>

        <wd-card title="配色卡片（BLOCK）">
            <div class="card card-info noborder">主要卡片</div>
            <div class="card card-success">成功卡片</div>
            <div class="card card-warning">警告卡片</div>
            <div class="card card-error">危险卡片</div>
        </wd-card>
    </Layout>
</template>

<script setup>
    import { RESULT, showModal } from '@U'

    const toast = useToast()
    const title = ref('Hello，欢迎使用');

    const router = useRouter();

    import { useCounterStore } from '@/store';
    const counterStore = useCounterStore();

    const num = computed(() => counterStore.count);
    const handlePlus = () => {
        counterStore.increment();
    };

    const handleMinus = () => {
        counterStore.decrement();
    };

    const handleToDetail = () => {
        router.push('/pages-sub/detail/index');
        // router.push({ name: 'Detail' }); 注：Detail 为<route>配置中的name参数，路由文档地址：https://hu-snail.github.io/snail-uni/guide/router.html
    }

    const requestStatus = ()=> {
        RESULT("/common/status", {}, d=>{
            showModal(JSON.stringify(d), `请求结果`)
        })
    }

    onMounted(() => {
        toast.success(`欢迎使用`)
    })
</script>
