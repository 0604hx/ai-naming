<template>
    <template v-if="inited">
        <view v-if="custom" class="icon" :innerHTML="bean.icon.svg" />
        <BabySVG v-else-if="bean.id=='baobao'" :fill :color :size clazz='icon' />
        <ShopSVG v-else-if="bean.id=='dianpu'" :fill :color :size clazz='icon' />
        <DogSVG v-else-if="bean.id=='chongwu'" :fill :color :size clazz='icon' />
        <VestSVG v-else-if="bean.id=='wangming'" :fill :color :size clazz='icon' />
        <EditSVG v-else-if="bean.id=='biming'" :fill :color :size clazz='icon' />
        <CreationSVG v-else-if="bean.id=='zuopin'" :fill :color :size clazz='icon' />
        <TitleSVG v-else-if="bean.id=='wenzhang'" :fill :color :size clazz='icon' />
        <view v-else>无</view>
    </template>
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
        bean:{type:Object, default:{}},
        size:{type:Number, default:48}
    })

    let inited = ref(false)
    let fill
    let color
    let custom = false

    onMounted(() => {
        let { svg } = props.bean.icon || {}
        if(svg && svg.startsWith("<svg "))
            custom = true

        fill = props.bean.icon?.fill
        color = props.bean.icon?.color

        inited.value = true
    })
</script>