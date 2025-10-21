<template>
    <Layout title="个人中心" :back="false" :tabbar="1">
        <view class="card">
            <div class="flex">
                <wd-img :width="imgSize" :height="imgSize" round :src="joy" enable-preview/>
                <div class="flex-1 pl-6">
                    <div class="space vertical large">
                        <div class="text-lg">集成显卡</div>
                        <wd-text :lines="3" text="天上白玉京，十二楼五城。仙人抚我顶，结发受长生。（唐·李白）"/>
                    </div>
                </div>
            </div>
        </view>

        <wd-card>
            <wd-text text="已打卡 999 天，继续加油💪" />
        </wd-card>

        <wd-card>
            <wd-cell-group title="功能菜单" border>
                <wd-cell title="个性化外观" icon="tips" clickable is-link to="/pages/mine/profile" />
                <wd-cell title="会员等级" icon="star" clickable is-link>
                    <wd-tag type="primary" mark plain>钻石会员</wd-tag>
                </wd-cell>
                <wd-cell title="安全设置" icon="setting1" clickable is-link/>
                <wd-cell title="通知设置" icon="notification" clickable is-link/>
                <wd-cell title="隐私设置" icon="lock-on" clickable is-link/>
            </wd-cell-group>
        </wd-card>

        <wd-card>
            <wd-cell-group border class="mt-2">
                <wd-cell title="帮助与客服" icon="service" clickable is-link></wd-cell>
                <wd-cell title="关于" icon="info-circle" clickable is-link></wd-cell>
            </wd-cell-group>
        </wd-card>

        <div class="text-center mt-2">
            <wd-text size="22rpx" :text="versionText" />
        </div>
    </Layout>
</template>

<script setup>
    import { isH5, isWeixin, isApp } from '@U'
    const joy = `data:image/webp;base64,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`
    const imgSize = 100

    const versionText = `当前版本：${__APP_VERSION__}（运行环境：${isH5?"H5":(isWeixin?"微信小程序":(isApp?"APP":"未知"))}）`
</script>
