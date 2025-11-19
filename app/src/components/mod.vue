<template>
    <wd-card custom-class="mod-card" :custom-style="buildStyle()">
        <view v-if="plain || bean.col>1" class="content">
            <SvgIcon :bean :size="iconSize"/>
            <view>
                <view class="title">{{bean.name}}</view>
                <view>{{bean.desc}}</view>
                <view v-if="plain">
                    <wd-tag plain>每次消耗{{bean.price}}积分</wd-tag>
                    <wd-tag custom-class="ml-2" plain>每次生成{{bean.limit}}个结果</wd-tag>
                </view>
            </view>
        </view>
        <template v-else>
            <view class="content">
                <!-- <component :is='buildSVG(bean)' /> -->
                <SvgIcon :bean :size="iconSize"/>
                <view class="title">{{bean.name}}</view>
            </view>
            <view>{{bean.desc}}</view>
        </template>
    </wd-card>
</template>

<script setup>
    import SvgIcon from './svgIcon.vue'

    const props = defineProps({
        bean: {type:Object},
        plain: {type:Boolean, default: false},
        bg: {type:Boolean, default: true},
        border: {type:Boolean, default: false},
        iconSize: {type:Number, default: 48}
    })

    const buildStyle = () => {
        let { color } = props.bean.icon || {}
        // return color ? { background: `linear-gradient(135deg, ${color}10 0%, ${color} 100%)` } : {}
        let style = {}
        if(color){
            if(props.bg)        style.background = `${color}50`
            if(props.border)    style.border = `${color} solid 1px`
        }

        return style
    }
</script>