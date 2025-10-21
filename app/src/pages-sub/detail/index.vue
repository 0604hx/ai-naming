<template>
	<Layout title="详情页面">
        <wd-card title="诗词赏析">
            <div class="space vertical text-center">
                <div>经乱离后天恩流夜郎忆旧游书怀赠江夏韦太守良宰</div>
                <div>唐·李白</div>
                <div>天上白玉京，十二楼五城。</div>
                <div>仙人抚我顶，结发受长生。</div>
                <div>误逐世间乐，颇穷理乱情。</div>
                <div>九十六圣君，浮云挂空名。</div>
                <div>天地赌一掷，未能忘战争。</div>
                <div>试涉霸王略，将期轩冕荣。</div>
                <div>时命乃大谬，弃之海上行。</div>
                <div>学剑翻自哂，为文竟何成。</div>
                <div>剑非万人敌，文窃四海声。</div>
                <div>儿戏不足道，五噫出西京。</div>
            </div>
        </wd-card>

        <div class="card">
            <wd-button type="primary" size="large" block @click="toDetail">到二级页面</wd-button>
        </div>
    </Layout>
</template>

<script setup>
    const router = useRouter()

    const toDetail = () => {
        router.push('/pages-sub/detail/detail')
    }
</script>
