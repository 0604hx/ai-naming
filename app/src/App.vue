<script setup>
    import { updateToken } from '@U'
    import { useUIStore, useDataStore } from '@/store'

    const uiStore = useUIStore()
    const dataStore = useDataStore()

    const updateTheme = ({ theme }) => uiStore.setDark(theme=='dark')

    onLaunch(() => {
        // // js 监听系统主题模式,初始化的时候确定是亮色还是暗夜主题
        // const scheme = window.matchMedia('(prefers-color-scheme: dark)')
        // const info = uni.getSystemInfoSync()
        // updateTheme(info)

        uni.onThemeChange(updateTheme)

        if(dataStore.token)
            updateToken(dataStore.token)
    });
    onShow(() => {
    });
    onHide(() => {
    });
</script>
