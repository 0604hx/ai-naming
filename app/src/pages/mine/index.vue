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
                </template>
                <view v-else class="text-center">
                    <view>暂无可用积分券</view>
                    <wd-button @click="toCoupon" class="mt-2">前往兑换</wd-button>
                </view>
            </wd-cell-group>
        </wd-card>

        <wd-card>
            <wd-cell-group title="取名记录" use-slot border>
                <template #value>
                    <wd-text text="点击可复制" size="12px"></wd-text>
                </template>

                <wd-tabs class="mini">
                    <wd-tab v-for="(items, index) in names" :key="index" :title="index" :badge-props="{ modelValue: items.length }">
                        <wd-cell class="logview" v-for="item in items" :title="item.text" :label="item.desc"
                            clickable @click="copy(item)" :title-width center />
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
    import { RESULT, date, getNames } from '@U'
    import { useDataStore } from '@/store'

    const dataStore = useDataStore()
    const message = useMessage()
    const toast = useToast()
    const router = useRouter()

    const titleWidth = "100%"
    let coupon = ref({})
    let names = ref([])

    const toCoupon = ()=> router.push("/pages-sub/coupon")
    const help = ()=> message.alert({ title:"帮助与客服", msg:`更多帮助信息请联系⌈咸鱼⌋`})

    const copy = row=>{
        navigator.clipboard.writeText(`${row.text}，${row.desc}`)
        toast.success(`⌈${row.text}⌋已复制`)
    }

    onMounted(() => {
        if(dataStore.coupon){
            RESULT("/coupon/"+dataStore.coupon, {}, d=>{
                coupon.value = d.data
            })
        }

        getNames().then(items=>{
            // 按 mod 分组
            let nameTabs = {}
            for(let item of items){
                if(!nameTabs[item.mod])
                    nameTabs[item.mod] = []
                nameTabs[item.mod].push(item)
            }
            names.value = nameTabs
        })
    })
</script>

<style scoped>
    .logview .wd-cell__wrapper {
        padding: 0px !important;
    }
</style>