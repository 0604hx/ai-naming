<template>
    <view :class="{ 'wot-theme-dark': uiStore.dark }" :style="style">
        <wd-navbar v-if="title" fixed placeholder :left-arrow="back" :right-text="right?'退出':''" @click-right="logout"
            :bordered="navBorder" :title="title" safeAreaInsetTop>
            <template #capsule>
                <wd-navbar-capsule @back="goBack" @back-home="toHome" />
            </template>
        </wd-navbar>

        <view v-if="top" :style="{height: top+'px'}" />

        <view class="text-center" v-if="!inited">
            <wd-loading type="outline" />
        </view>
        <template v-else>
            <slot />
        </template>

        <!-- :custom-style="`bottom:`+tabBottom"   -->
        <wd-tabbar v-if="tabbar>=0" :z-index="9" fixed :shape="tabRound?'round':'default'" :bordered="tabBorder"
            :safeAreaInsetBottom="tabSafe" v-model="tabIndex" @change="onTabChange" placeholder>
            <wd-tabbar-item v-for="item in tabs" :title="item.title" :icon="item.icon" />
        </wd-tabbar>

        <wd-toast />
        <wd-message-box />
        <wd-notify />
    </view>
</template>

<script setup>
    import { homePage, adminHomePage, adminPwdPage } from '@U'
    import { useUIStore, useDataStore } from '@/store'

    const uiStore = useUIStore()
    const router = useRouter()
    const dataStore = useDataStore()
    const message = useMessage()

    const props = defineProps({
        inited:{type:Boolean, default:true},
        navBorder:{type:Boolean, default: false},
        top:{ type:Number, default: 15 }, //顶部距离
        title: {type:String},
        back: {type:Boolean, default: true },
        right: {type:Boolean, default: true},
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
        { title:"监控", icon:"dashboard", url:adminHomePage },
        { title:"积分券", icon:"barcode", url:"/pages-sub/admin/coupon" },
        { title:"名字", icon:"usergroup", url:"/pages-sub/admin/name" },
        { title:"历史", icon:"spool", url:"/pages-sub/admin/log" },
        { title:"配置", icon:"setting1", url:"/pages-sub/admin/system/index" }
    ]

    const onTabChange = ({ value })=> router.replace(tabs[value].url)

    const goBack = ()=>{
        if(props.back != true)  return

        if(getCurrentPages().length > 1)
            return router.back()

        router.replace(adminHomePage)
    }
    const toHome = ()=> {
        console.debug("跳转到首页", homePage)
        router.replace(homePage)
    }
    const logout = ()=>{
        message
            .confirm({
                msg: `确定退出当前登录状态，并跳转到授权页吗？`,
                title: `退出登录`,
                confirmButtonText:"确定"
            })
            .then(()=> {
                dataStore.setToken(null)

                router.replace(adminPwdPage)
            })
            .catch(()=>{})
    }
</script>

