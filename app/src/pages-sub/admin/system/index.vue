<template>
    <AdminLayout title="系统配置" :tabbar="4" :top="0">
        <wd-tabs>
            <wd-tab title="LLM 大模型">
                <LLMConfig />
            </wd-tab>

            <wd-tab title="模块管理">
                <ModConfig />
            </wd-tab>
        </wd-tabs>
    </AdminLayout>
</template>

<script setup>
    import AdminLayout from '../widget/layout.vue'

    import LLMConfig from './llm.vue'
    import ModConfig from './mod.vue'
</script>