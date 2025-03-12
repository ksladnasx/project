import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { useUserStore } from './store'
import axiosService from './utils/axios-test'


// 创建Vue应用实例
const app = createApp(App)
// 创建Pinia实例
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)
// 挂载到全局属性
app.config.globalProperties.$http = axiosService

// 如果localStorage中有用户信息，则初始化用户
const userStore = useUserStore()
userStore.updatUser()

// 挂载应用
app.mount('#app')