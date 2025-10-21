import { defineStore } from 'pinia';

const defaultPriColor = "#3c63dd"

export const useUIStore = defineStore('ui', {
    state:()=>({
        dark: false,
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
