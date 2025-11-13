<template>
	<Layout :title>
        <view class="text-center" v-if="!inited">
            <wd-loading type="outline" />
        </view>
        <template v-else>
            <Mod :bean plain :bg="uiStore.modBg" border :iconSize="64" />

            <template v-if="bean.params && bean.params.length">
                <wd-card  style="padding-top: 12px;" class="formview">
                    <template v-for="item in bean.params">
                        <!--
                        wot-ui 1.13.0 有问题，配置 :maxlength="item.max>0?item.max:-1" showWordLimit 会报错
                        Cannot read properties of undefined (reading 'readonly')

                        临时方案：
                            使用代码自行控制输入长度
                        -->
                        <wd-input v-if="item.type=='TEXT'" v-model="form[item.label]" :placeholder="tip(item)" :label="item.label" :label-width :required="item.required" />
                        <wd-cell v-else-if="item.type=='NUMBER'" :title="item.label" :title-width="labelWidth" :required="item.required">
                            <wd-input-number v-model="form[item.label]" :min="0" />
                        </wd-cell>
                        <wd-cell v-else-if="item.type=='RADIO'" :title="item.label" :title-width="labelWidth" :required="item.required">
                            <wd-radio-group shape="dot" v-model="form[item.label]">
                                <wd-radio v-for="opt in item.items" :value="opt">{{ opt }}</wd-radio>
                            </wd-radio-group>
                        </wd-cell>
                        <wd-datetime-picker v-else-if="item.type=='DATE'" type="date" v-model="form[item.label]" :required="item.required"
                            :label="item.label" :default-value="nowDate" :minDate :label-width placeholder="请选择时间" />
                        <wd-datetime-picker v-else-if="item.type=='TIME'" type="time" v-model="form[item.label]" :required="item.required"
                            :label="item.label" :label-width placeholder="请选择时间" />
                        <wd-select-picker v-else-if="item.type=='SELECT'" :label="item.label" :label-width :required="item.required"
                            filterable :type="item.multiple==true?'checkbox':'radio'"
                            :columns="buildOption(item.items)" v-model="form[item.label]" />
                    </template>
                </wd-card>

                <view class="p15 pt-1">
                    <wd-button type="primary" size="large" @click="run" :round="false" block :loading>AI取名</wd-button>
                </view>

                <view class="text-center p-1">
                    <wd-text text="特别申明：您的数据仅作为本次取名使用" size="12px"></wd-text>
                </view>
            </template>
            <view v-else class="card">
                <view class="title" style="color: #f0883a; font-size:18px">
                    <wd-icon name="warning"></wd-icon>
                    功能不可用
                </view>
                模块 <b>{{ bean.id }}/{{bean.name}}</b> 未配置表单，请联系管理员。
            </view>
    </template>

        <wd-popup v-model="result.show" position="bottom" closable custom-style="height: 320px;"
            :close-on-click-modal="false" safe-area-inset-bottom @close="()=>result.show=false">
            <wd-cell-group border use-slot>
                <template #title>
                    <wd-icon name="spool" class="primary" />
                    取名结果
                    <wd-text text="点击名字可复制信息" size="12px"/>
                </template>
                <wd-cell v-for="item in result.names" :label="item.desc" center title-width="75%" size="large">
                    <template #title>
                        <wd-badge :modelValue="item.score">
                            <wd-button size="small" @click="copy(item)">{{item.text}}</wd-button>
                        </wd-badge>
                    </template>
                    <wd-button icon="heart" type="info" size="small" @click="mark(item)">收藏</wd-button>
                </wd-cell>
            </wd-cell-group>
        </wd-popup>
    </Layout>
</template>

<script setup>
    import { useDataStore, useUIStore } from '@/store'
    import { date, RESULT, saveNames } from '@U'

    import Mod from '@C/mod.vue'

    const toast = useToast()
    const message = useMessage()

    const route = useRoute()
    const router = useRouter()
    const dataStore = useDataStore()
    const uiStore = useUIStore()

    let id = null
    const labelWidth = "90px"
    const nowDate = Date.now()
    const minDate = Date.now()-50*365*24*60*60*1000

    let inited = ref(false)
    let loading = ref(false)
    let bean = {}
    const form = reactive({})
    const result = reactive({show: false, names:[]})
    const title = ref(" ")

    const refrehBean = data=>{
        bean = data
        bean.params?.forEach(p=>{
            form[p.label] = p.defVal
        })
        title.value = bean.name.endsWith("取名")?bean.name:`${bean.name}取名`
        inited.value = true
    }

    /**
     * @params {Array<String>} items
     */
    const buildOption = items=> items.map(label=>({ label, value: label }))
    const tip = item=> `请输入${item.label}`+(item.max>0?`（${item.max}字内）`:"")

    const run = ()=>{
        let params = {}

        for(let i=0;i<bean.params.length;i++){
            let p = bean.params[i]
            if(p.required === true && !form[p.label]){
                toast.warning(`⌈${p.label}⌋为必填项`)
                return
            }

            if(p.type=='DATE'){
                params[p.label] = form[p.label]?date(new Date(form[p.label])):null
            }
            else{
                if(p.type=='TEXT'){
                    if(p.max>0 && form[p.label] && form[p.label].length>p.max)
                        return toast.warning(`⌈${p.label}⌋字符数不能超过${p.max}`)
                }
                params[p.label] = form[p.label]
            }
        }

        console.debug(`表单值`, params, form)

        loading.value = true
        RESULT(
            "/run",
            { id, coupon: dataStore.coupon, params },
            d=>{
                loading.value = false

                if(d.data.length){
                    result.names = d.data
                    result.show = true

                    saveNames(d.data.map(v=> ({mod: bean.name, ...v})))
                }
                else{
                    message.alert(`AI大模型未给出回应，本次不扣除积分，请重试`)
                }
            }, ()=>{
                loading.value = false
            }
        )
    }

    const copy = row=>{
        navigator.clipboard.writeText(`${row.text}，${row.desc}`)
        toast.success(`⌈${row.text}⌋已复制`)
    }
    const mark = row=>{
        toast.success(`⌈${row.text}⌋已收藏`)
    }

    onMounted(() => {
        id = route.query.id

        if(!dataStore.coupon){
            message
                .confirm({
                    msg: `检测到没有可用的积分券（用于支付取名功能），请联系管理员获取兑换码`,
                    title: `无可用积分券`,
                    confirmButtonText:"前往兑换"
                })
                .then(()=> router.push("/pages-sub/coupon"))
                .catch(()=>{})
        }

        RESULT(`/module/${id}`, {}, d=>refrehBean(d.data))
    })
</script>

<style>
    .formview {
        .wd-radio {
            /* line-height: 1.0; */
            margin-top: 0px !important;
            margin-bottom: 10px;
        }
    }
</style>