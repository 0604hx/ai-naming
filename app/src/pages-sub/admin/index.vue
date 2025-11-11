<template>
    <AdminLayout title="管理员首页" :back="false" :tabbar="0" :inited>
        <view class="p-2">
            <wd-row :gutter="6">
                <wd-col :span="8">
                    <view class="card card-warning m0">
                        <view class="title"> <wd-icon name="barcode" class="mr-1" />积分券</view>
                        <wd-count-to :endVal="bean.coupon" type="default" suffix=" 张" />
                    </view>
                </wd-col>
                <wd-col :span="8">
                    <view class="card card-error m0">
                        <view class="title"><wd-icon name="user-circle" class="mr-1" />名字</view>
                        <wd-count-to :endVal="bean.name" type="default" suffix=" 个"/>
                    </view>
                </wd-col>
                <wd-col :span="8">
                    <view class="card card-success m0">
                        <view class="title"><wd-icon name="spool" class="mr-1" />调用</view>
                        <wd-count-to :endVal="bean.log" type="default" suffix=" 次"/>
                    </view>
                </wd-col>
            </wd-row>

            <wd-cell-group title="快捷功能" class="mt-4 ml-1 mr-1" border>
                <view class="p15">
                    <CreateCoupon size="small" />
                    <wd-button size="small" type="primary" @click="refreshModule" style="margin-left: 6px;">刷新模块缓存</wd-button>
                </view>
            </wd-cell-group>

            <wd-cell-group title="系统监控" class="mt-4 ml-1 mr-1" border>
                <wd-cell title="后端启动" :value="bean.uptime" />
                <wd-cell title="运行环境" :value="bean.os"/>
                <wd-cell title="内存使用" :value="filesize(bean.mem)"/>
                <wd-cell title="数据文件" :value="filesize(bean.db)" />
                <wd-cell title="缓存大小" :value="filesize(bean.cache)" />
            </wd-cell-group>

            <view class="text-center p-3">
                <wd-text :text='"数据更新于"+bean.updateOn' size="12px" />
            </view>
        </view>
    </AdminLayout>
</template>

<script setup>
    import { RESULT, filesize } from '@U'
    import AdminLayout from './widget/layout.vue'
    import CreateCoupon from './widget/create-coupon.vue'

    import { failFunc } from '.'

    const toast = useToast()
    const router = useRouter()

    let inited = ref(false)

    let bean = {}

    const refreshModule = ()=> RESULT("/master/module-refresh", {}, ()=> toast.success(`模块缓存已清空`))

    onMounted(() => {
        RESULT(
            "/master/overview", {},
            d=>{
                bean = d.data
                inited.value = true
            },
            failFunc(router)
        )
    })
</script>