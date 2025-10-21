<template>
	<Layout title="二级详细页面">
        <wd-card title="这里是二级详细页面">
            <wd-button type="primary" @click="showMsg">显示当前时间戳</wd-button>
        </wd-card>
    </Layout>
</template>

<script setup>
    const toast = useToast()

    const showMsg = ()=> toast.show(`Hi, ${Date.now()}`)
</script>
