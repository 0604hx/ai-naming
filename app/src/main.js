import { createSSRApp } from 'vue'
import App from './App.vue'
import router, { routeInterceptor } from './router'
// import 'virtual:uno.css'

import Layout from '@C/layout.vue'

import './theme/app.css'
import './theme/tailwind-mini.css'

import * as Pinia from 'pinia'
// @docs https://github.com/dishait/pinia-plugin-unistorage?tab=readme-ov-file#readme
import { createUnistorage } from 'pinia-plugin-unistorage'

export function createApp() {
    const app = createSSRApp(App)
    const store = Pinia.createPinia()
    store.use(createUnistorage())
    app.use(router)
    app.use(routeInterceptor)
    app.use(store)

    app.component('Layout', Layout)
    return { app }
}
