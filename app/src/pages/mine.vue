<template>
    <Layout title="个人中心" :back="false" :tabbar="1">
        <wd-card>
            <wd-cell-group title="我的积分券" border>
                <template v-if="coupon.id">
                    <wd-cell title="券码" icon="info-circle" :value="coupon.id"/>
                    <wd-cell title="可用额度" icon="money-circle">
                        <wd-tag type="primary" mark plain>{{ coupon.quota }}</wd-tag>
                    </wd-cell>
                    <wd-cell title="创建日期" icon="calendar" :value="date(coupon.addOn)"/>
                    <wd-cell title="更换积分券" icon="barcode" @click="toCoupon" is-link clickable />
                </template>
                <view v-else class="text-center">
                    <view>暂无可用积分券</view>
                    <wd-button @click="toCoupon" class="mt-2">前往兑换</wd-button>
                </view>
            </wd-cell-group>
        </wd-card>

        <wd-card>
            <wd-cell-group use-slot>
                <template #title>
                    取名记录
                    <wd-text custom-class="ml-1" text="点击可复制" size="12px"></wd-text>
                </template>
                <template #value>
                    <wd-button class="mini" @click="clear" size="small" type="text">清空</wd-button>
                    <!-- <wd-icon name="delete-thin" size="12px" @click="clear"></wd-icon> -->
                </template>

                <wd-tabs class="mini" v-model="nameTab">
                    <wd-tab v-for="(items, index) in names" :name="index" :title="index" :badge-props="{ modelValue: items.length }">
                        <wd-cell class="logview" v-for="item in items" :title="item.text" :label="item.desc"
                            clickable @click="copy(item)" title-width="100%" center />
                    </wd-tab>
                </wd-tabs>
            </wd-cell-group>
        </wd-card>

        <wd-card>
            <wd-cell-group border class="pt-2">
                <wd-cell title="个性化外观" icon="tips" clickable is-link to="/pages-sub/setting" />
                <wd-cell title="帮助与客服" icon="service" @click="help" clickable is-link></wd-cell>
                <wd-cell title="关于" icon="info-circle" clickable is-link  to="/pages-sub/about" />
            </wd-cell-group>
        </wd-card>
    </Layout>
</template>

<script setup>
    import { RESULT, date, getNames, clearNames, copyText } from '@U'
    import { useDataStore } from '@/store'

    const dataStore = useDataStore()
    const message = useMessage()
    const toast = useToast()
    const router = useRouter()

    let coupon = ref({})
    let names = ref([])
    let nameTab = ref(0)

    const toCoupon = ()=> router.push("/pages-sub/coupon")
    const help = ()=> message.alert({ title:"帮助与客服", msg:`更多帮助信息请在⌈咸鱼⌋搜索⌈集成显卡⌋或添加微信 ironman_1024`})

    const refreshNames = items=>{
        // 按 mod 分组
        let nameTabs = {}
        for(let item of items){
            if(!nameTabs[item.mod])
                nameTabs[item.mod] = []
            nameTabs[item.mod].push(item)
        }
        names.value = nameTabs
    }
    const copy = row=> copyText(`${row.text}，${row.desc}`, ()=> toast.success(`⌈${row.text}⌋已复制`))
    const clear = ()=> message
        .confirm({
            msg: `请选择要清空的范围？`,
            title: `清空本地缓存`,
            confirmButtonText:"仅当前标签",
            cancelButtonText: "全部"
        })
        .then(()=> clearNames(nameTab.value, refreshNames))
        .catch(()=> clearNames(null, refreshNames))

    onMounted(() => {
        if(dataStore.coupon){
            RESULT("/coupon/"+dataStore.coupon, {}, d=>{
                coupon.value = d.data
            })
        }

        getNames().then(refreshNames)
    })
</script>

<style scoped>
    .logview .wd-cell__wrapper {
        padding: 0px !important;
    }
</style>