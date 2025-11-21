import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import NProgress from 'nprogress'

import App from './App.vue'
import setupPermissionDirective from './directives/permission'
import globalPlugin from './plugins/global'

// 样式
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'nprogress/nprogress.css'
import './styles/index.scss'

const app = createApp(App)

// Pinia状态管理
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// NProgress配置
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.3
})

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
  zIndex: 3000,
})
app.use(globalPlugin)

// 设置权限指令
setupPermissionDirective(app)

app.mount('#app')

// 移除加载画面
const loading = document.getElementById('loading')
if (loading) {
  loading.style.display = 'none'
}