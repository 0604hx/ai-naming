<template>
    <wd-card class="mod-card" :style="buildStyle()">
        <view v-if="plain || bean.col>1" class="content">
            <component :is='buildSVG(bean)' />
            <view>
                <view class="title">{{bean.name}}</view>
                <view>{{bean.desc}}</view>
                <view v-if="plain">
                    <wd-tag type="primary" plain>每次消耗{{bean.price}}积分</wd-tag>
                    <wd-tag type="success" class="ml-2" plain>每次生成{{bean.limit}}个结果</wd-tag>
                </view>
            </view>
        </view>
        <template v-else>
            <view class="content">
                <component :is='buildSVG(bean)' />
                <view class="title">{{bean.name}}</view>
            </view>
            <view>{{bean.desc}}</view>
        </template>
    </wd-card>
</template>

<script setup>
    import BabySVG from '@SVG/baby.vue'
    import ShopSVG from '@SVG/shop.vue'
    import DogSVG from '@SVG/dog.vue'
    import EditSVG from '@SVG/edit.vue'
    import CreationSVG from '@SVG/creation.vue'
    import VestSVG from '@SVG/vest.vue'
    import TitleSVG from '@SVG/title.vue'

    const props = defineProps({
        bean: {type:Object},
        plain: {type:Boolean, default: false},
        bg: {type:Boolean, default: true},
        border: {type:Boolean, default: false},
        iconSize: {type:Number, default: 48}
    })

    const buildSVG = item=>{
        let { color, svg, fill } = item.icon || {}
        if(svg && svg.startsWith("<svg "))
            return h('view', {class:"icon", innerHTML: svg })

        return h(
            item.id == 'baobao'? BabySVG:
            item.id == 'dianpu'? ShopSVG:
            item.id == 'chongwu'? DogSVG:
            item.id == 'wangming'? VestSVG:
            item.id == 'biming'? EditSVG:
            item.id == 'zuopin'? CreationSVG:
            item.id == 'wenzhang'? TitleSVG:
            null,
            { clazz:'icon', fill: fill || color, size: props.iconSize }
        )
    }

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