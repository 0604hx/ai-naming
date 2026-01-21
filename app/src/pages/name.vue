<template>
    <Layout title="取名记录">
        <wd-card>
            <wd-cell-group use-slot>
                <template #title>
                    <wd-text text="点击可复制" size="12px"></wd-text>
                </template>
                <template #value>
                    <wd-button class="mini" @click="clear" size="small" type="text">清空</wd-button>
                </template>

                <wd-tabs class="mini" v-model="nameTab">
                    <wd-tab v-for="(items, index) in names" :name="index" :title="index" :badge-props="{ modelValue: items.length }">
                        <wd-cell class="logview" v-for="item in items" :title="item.text" :label="item.desc"
                            clickable @click="copy(item)" title-width="100%" center />
                    </wd-tab>
                </wd-tabs>
            </wd-cell-group>
        </wd-card>
    </Layout>
</template>

<script setup>
    import { copyText, clearNames, getNames } from '@U'

    const toast = useToast()
    const message = useMessage()

    const refreshNames = items=>{
        // 按 mod 分组
        let nameTabs = {}
        for(let item of items){
            if(!nameTabs[item.mod])
                nameTabs[item.mod] = []
            nameTabs[item.mod].push(item)
        }
        names.value = nameTabs
    }
    
    const copy = row=> copyText(`${row.text}，${row.desc}`, ()=> toast.success(`⌈${row.text}⌋已复制`))
   
    const clear = ()=> message
        .confirm({
            msg: `请选择要清空的范围？`,
            title: `清空本地缓存`,
            confirmButtonText:"仅当前标签",
            cancelButtonText: "全部"
        })
        .then(()=> clearNames(nameTab.value, refreshNames))
        .catch(v=> {
            //仅当点击全部按钮才执行删除动作
            if(v && v.action=='cancel')
                clearNames(null, refreshNames)
        })

    onMounted(() => {
        getNames().then(refreshNames)
    })
</script>