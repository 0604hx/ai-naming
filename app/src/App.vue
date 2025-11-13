<script setup>
    import { updateToken } from '@U'
    import { useUIStore, useDataStore } from '@/store'

    const uiStore = useUIStore()
    const dataStore = useDataStore()

    const updateTheme = ({ theme }) => {
        // let isDark = false
        // if(uiStore.theme == darkTheme)
        //     isDark = true
        // else if(uiStore.theme == lightTheme)
        //     isDark = false
        // else
        //     isDark = theme == darkTheme

        // console.debug("监听到主题色变化", theme, uiStore.theme, "isDark=",isDark)
        // uiStore.setDark(isDark)
        uiStore.setDark(theme == 'dark')
    }

    onLaunch(() => {
        // // js 监听系统主题模式,初始化的时候确定是亮色还是暗夜主题
        // const scheme = window.matchMedia('(prefers-color-scheme: dark)')
        // const info = uni.getSystemInfoSync()
        // updateTheme(info)

        const info = uni.getSystemInfoSync()
        let theme = info.osTheme || info.hostTheme
        updateTheme({ theme })

        uni.onThemeChange(updateTheme)

        if(dataStore.token)
            updateToken(dataStore.token)
    });
    onShow(() => {
    });
    onHide(() => {
    });
</script>
