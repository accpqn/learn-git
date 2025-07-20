import App from './App.vue'
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia';
import uviewPlus from 'uview-plus'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
    // #endif

// #ifdef VUE3
export function createApp() {
    const app = createSSRApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use(uviewPlus)

    return {
        app,
        pinia
    }
}
// #endif