<template>
    <Layout title="关于 AI 取名大师">
        <wd-card title="ℹ️ 功能简介">
            借助<wd-text text="豆包" type="primary"/>、<wd-text text="通义千问" type="primary"/>、<wd-text text="DeepSeek" type="primary"/> 等 AI 大模型，
            为您的宝宝、宠物、店铺、网名、笔名、项目、产品、服务等取一个专业、有意义的名字。
        </wd-card>

        <wd-card title="🎉 开源说明" border>
            本程序为开源项目，任何人可查阅源代码🚀。
            <view class="mt-2" v-for="(item, index) in repositories" @click="toCopy(item.url)">
                仓库{{ index+1 }}：<a class="inline" :href="item.url" target="_blank">{{ item.name }}</a>
                <wd-icon class="ml-2" name="file-copy" />
            </view>

            <view class="mt-2">
                也欢迎到我的👉<a href="https://blog.csdn.net/ssrc0604hx?type=blog" target="_blank">个人博客</a>👈查看相关文章，一起交流学习🤝。
            </view>
        </wd-card>

        <view class="text-center mt-2">
            <wd-text size="22rpx" :text="versionText" />
        </view>
    </Layout>
</template>

<script setup>
    import { isH5, isWeixin, isApp } from '@U'

    const versionText = `当前版本：${__APP_VERSION__}（运行环境：${isH5?"H5":(isWeixin?"微信小程序":(isApp?"APP":"未知"))}）`

    const repositories = [
        { name:"GITCODE", url: "https://gitcode.com/ssrc0604hx/ai-naming" },
        { name:"GITHUB", url:"https://github.com/0604hx/ai-naming"}
    ]
    const copy = text=>{
        navigator.clipboard.writeText(text)
        uni.showToast({ title:`URL 已复制` })
    }

</script>