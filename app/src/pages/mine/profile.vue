<template>
    <Layout title="个性化设置">
        <wd-cell-group border custom-class="ml-2 mr-2">
            <wd-cell title="主题配色" clickable center label="设置按钮、导航栏、开关等主配色" @click="theme.show=true" :title-width="width">
                <wd-tag type="primary" size="small" :round="false" custom-style="padding: 8px 16px"></wd-tag>
            </wd-cell>
            <wd-cell title="大号字体" clickable center label="勾选后全局字体都会放大噢" :title-width="width">
                <wd-switch v-model="uiStore.largeFont" size="24px" />
            </wd-cell>
        </wd-cell-group>

        <wd-popup v-model="theme.show" position="bottom" closable custom-style="height: 320px; padding:16px" safe-area-inset-bottom @close="()=>theme.show=false">
            <div>
                <wd-icon name="tips" class="primary" />
                主题色
            </div>
            <wd-grid :column="5" clickable>
                <wd-grid-item v-for="item in colors" use-icon-slot :text="item" :icon-size="theme.size" @itemclick="themeSelect(item)">
                    <template #icon><div :style="{ width: theme.size, height:theme.size, borderRadius: `4px`, background: item}" /></template>
                </wd-grid-item>
            </wd-grid>

            <div class="p-3">
                <div>自定义颜色</div>
                <wd-input type="text" v-model="theme.custom" :maxlength="6" placeholder="请输入HEX颜色代码">
                    <template #prefix><wd-text text="#" /></template>
                    <template #suffix><wd-button size="small" type="primary" @click="themeSelect()">确定</wd-button></template>
                </wd-input>
            </div>
        </wd-popup>
    </Layout>
</template>

<script setup>
    import { useUIStore } from '@/store';
    const uiStore = useUIStore()

    const toast = useToast()

    const width = "85%"
    const theme = reactive({ show:false, size:'50px', custom:undefined })
    const colors = ["#3c63dd","#8c0776", "#2ba471", "#f5ba18", "#e37318", "#d54941", "#e851b3", "#8e56dd", "#029cd4", "#000000"] // "#0052d9",

    const open = ()=> theme.show = true
    const toTheme = ()=> theme.show=true
    const themeSelect = v=>{
        let color = v || (theme.custom?`#${theme.custom}`:undefined)
        if(!color)  return toast.warning(`请输入颜色代码`)

        toast.show(`主题色设置为${color}`)
        uiStore.setColor(color)
        theme.show = false
    }

    defineExpose({ open })
</script>
