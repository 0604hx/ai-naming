<template>
    <view :class="{ 'wot-theme-dark': uiStore.dark }" :style="style">
    <!-- <wd-config-provider :theme="uiStore.dark?'dark':''" :theme-vars="themeVars"> -->
        <wd-navbar v-if="title" fixed placeholder :left-arrow="back" :bordered="navBorder" :title="title" @click-left="goBack" safeAreaInsetTop></wd-navbar>

        <view v-if="top" :style="{height: top+'px'}" />
        <slot />

        <!-- :custom-style="`bottom:`+tabBottom"   -->
        <wd-tabbar v-if="tabbar>=0" :z-index="9" fixed :shape="tabRound?'round':'default'" :bordered="tabBorder"
            :safeAreaInsetBottom="tabSafe" v-model="tabIndex" @change="onTabChange" placeholder>
            <wd-tabbar-item v-for="item in tabs" :title="item.title" :icon="item.icon" />
        </wd-tabbar>

        <wd-toast />
        <wd-message-box />
        <wd-notify />
    </view>
    <!-- </wd-config-provider> -->
</template>

<script setup>
    import { useUIStore } from '@/store';
    const uiStore = useUIStore()
    const router = useRouter()

    const props = defineProps({
        navBorder:{type:Boolean, default: false},
        top:{ type:Number, default: 15 }, //顶部距离
        title: {type:String},
        back: {type:Boolean, default: true },
        tabbar: {type:Number, default: -1},
        tabRound: {type:Boolean, default: true },
        tabSafe: {type:Boolean, default:true},
        tabBorder: {type:Boolean, default: false},
        tabBottom: {type:String, default:"24rpx"}
    })

    const themeVars = computed(()=>({
        colorTheme: uiStore.color
    }))
    const style = computed(()=>{
        let ps = {
            "--wot-color-theme": uiStore.color,
        }
        if(uiStore.largeFont){
            ps["--wot-navbar-title-font-size"] = "24px"
            ps["--wot-fs-title"] = "22px"
            ps["--wot-fs-content"] = "20px"
            ps["--wot-cell-title-fs"] = "20px"
            ps["--wot-cell-label-fs"] = "16px"
        }
        return ps
    })

    let tabIndex = ref(props.tabbar)

    const tabs = [
        { title:"首页", icon:"home", url:"/pages/index/index" },
        { title:"我的", icon:"user", url:"/pages/mine/index" }
    ]

    const onTabChange = ({ value })=>{
        console.debug(`点击底部导航栏`, value)
        router.replace(tabs[value].url)
    }
    const goBack = ()=>router.back()
</script>

