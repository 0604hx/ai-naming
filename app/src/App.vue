<script setup>
    import { useUIStore } from '@/store'
    const uiStore = useUIStore()

    const updateTheme = ({ theme }) => uiStore.setDark(theme=='dark')

    onLaunch(() => {
        // // js 监听系统主题模式,初始化的时候确定是亮色还是暗夜主题
        // const scheme = window.matchMedia('(prefers-color-scheme: dark)')
        // const info = uni.getSystemInfoSync()
        // updateTheme(info)

        uni.onThemeChange(updateTheme)
    });
    onShow(() => {
        console.log('App Show');
    });
    onHide(() => {
        console.log('App Hide');
    });
</script>
