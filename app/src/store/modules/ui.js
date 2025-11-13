import { defineStore } from 'pinia';

const defaultPriColor = "#3c63dd"

export const darkTheme = 'dark'
export const lightTheme = 'light'
export const defaultTheme = 'auto'

/**
 * 目前仅支持随系统自动切换
 */
export const uiThemes = [
    { label:"浅色", value: lightTheme },
    { label:"深色", value: darkTheme },
    { label:"跟随系统", value: defaultTheme }
]

export const useUIStore = defineStore('ui', {
    state:()=>({
        dark: false,
        theme: defaultTheme,
        modBg: false,                //是否启用模块背景色
        color: defaultPriColor,
        largeFont: false
    }),
    actions: {
        setDark (v){
            if(this.dark == v)  return

            this.dark = v
        },
        setColor (v){
            this.color = v
        }
    },
    unistorage: true
})
