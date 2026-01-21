<script setup>
    import { updateToken, checkMicroUpdate } from '@U'
    import { useUIStore, useDataStore } from '@/store'

    const uiStore = useUIStore()
    const dataStore = useDataStore()

    /**
     * 计算UUID
     */
    const computeUUID = ()=>{
        if(dataStore.uuid)  return

        // #ifdef H5
        // Initialize the agent at application startup.
        const fpPromise = import('https://openfpcdn.io/fingerprintjs/v5')
            .then(FingerprintJS => FingerprintJS.load())

        // Get the visitor identifier when you need it.
        fpPromise
            .then(fp => fp.get())
            .then(result => {
                console.debug(`获取到客户端指纹`, result.visitorId)

                dataStore.uuid = result.visitorId
            })
        // #endif

        // #ifndef H5
        uni.login({ provider: 'weixin', success: async ({ code }) => {
                console.debug("获取用户UUID", code)
                dataStore.uuid = code
        }})
        // #endif
    }

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

        computeUUID()
    })
    onShow(() => {
        checkMicroUpdate()
    })
    onHide(() => {
    })
</script>
