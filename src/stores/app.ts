import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SystemConfig } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const title = ref<string>('广告平台管理系统')
  const version = ref<string>('1.0.0')
  const collapsed = ref<boolean>(false)
  const device = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
  const theme = ref<'light' | 'dark'>('light')
  const primaryColor = ref<string>('#409eff')
  const language = ref<string>('zh-cn')
  const loading = ref<boolean>(false)
  const systemConfig = ref<SystemConfig | null>(null)
  
  // 侧边栏
  const sidebarCollapsed = ref<boolean>(false)
  const sidebarWidth = ref<number>(240)
  
  // 标签页
  const tagsView = ref<boolean>(true)
  const visitedViews = ref<Array<{
    path: string
    name: string
    title: string
    affix?: boolean
  }>>([])
  
  // 面包屑
  const breadcrumb = ref<boolean>(true)
  
  // 初始化应用
  const initializeApp = (): void => {
    // 检测设备类型
    detectDevice()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    
    // 从环境变量获取应用信息
    title.value = import.meta.env.VITE_APP_TITLE || '广告平台管理系统'
    version.value = import.meta.env.VITE_APP_VERSION || '1.0.0'
    
    // 从localStorage恢复设置
    restoreSettings()
  }
  
  // 检测设备类型
  const detectDevice = (): void => {
    const width = window.innerWidth
    if (width < 768) {
      device.value = 'mobile'
      sidebarCollapsed.value = true
    } else if (width < 1024) {
      device.value = 'tablet'
      sidebarCollapsed.value = true
    } else {
      device.value = 'desktop'
      sidebarCollapsed.value = false
    }
  }
  
  // 处理窗口大小变化
  const handleResize = (): void => {
    detectDevice()
  }
  
  // 恢复设置
  const restoreSettings = (): void => {
    try {
      const settings = localStorage.getItem('app-settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        theme.value = parsed.theme || 'light'
        primaryColor.value = parsed.primaryColor || '#409eff'
        language.value = parsed.language || 'zh-cn'
        sidebarCollapsed.value = parsed.sidebarCollapsed ?? false
        tagsView.value = parsed.tagsView ?? true
        breadcrumb.value = parsed.breadcrumb ?? true
      }
    } catch (error) {
      console.error('Failed to restore settings:', error)
    }
  }
  
  // 保存设置
  const saveSettings = (): void => {
    try {
      const settings = {
        theme: theme.value,
        primaryColor: primaryColor.value,
        language: language.value,
        sidebarCollapsed: sidebarCollapsed.value,
        tagsView: tagsView.value,
        breadcrumb: breadcrumb.value
      }
      localStorage.setItem('app-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }
  
  // 切换侧边栏
  const toggleSidebar = (): void => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    saveSettings()
  }
  
  // 切换主题
  const toggleTheme = (): void => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    applyTheme()
    saveSettings()
  }
  
  // 应用主题
  const applyTheme = (): void => {
    const html = document.documentElement
    if (theme.value === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  // 设置主题颜色
  const setPrimaryColor = (color: string): void => {
    primaryColor.value = color
    const html = document.documentElement
    html.style.setProperty('--el-color-primary', color)
    saveSettings()
  }
  
  // 设置语言
  const setLanguage = (lang: string): void => {
    language.value = lang
    saveSettings()
  }
  
  // 设置加载状态
  const setLoading = (isLoading: boolean): void => {
    loading.value = isLoading
  }
  
  // 添加访问的视图
  const addVisitedView = (view: {
    path: string
    name: string
    title: string
    affix?: boolean
  }): void => {
    const exists = visitedViews.value.find(v => v.path === view.path)
    if (!exists) {
      visitedViews.value.push(view)
    }
  }
  
  // 删除访问的视图
  const delVisitedView = (path: string): void => {
    const index = visitedViews.value.findIndex(v => v.path === path)
    if (index !== -1) {
      visitedViews.value.splice(index, 1)
    }
  }
  
  // 删除其他视图
  const delOthersViews = (path: string): void => {
    visitedViews.value = visitedViews.value.filter(v => v.path === path || v.affix)
  }
  
  // 删除所有视图
  const delAllViews = (): void => {
    visitedViews.value = visitedViews.value.filter(v => v.affix)
  }
  
  // 设置系统配置
  const setSystemConfig = (config: SystemConfig): void => {
    systemConfig.value = config
  }
  
  return {
    // 状态
    title,
    version,
    collapsed,
    device,
    theme,
    primaryColor,
    language,
    loading,
    systemConfig,
    sidebarCollapsed,
    sidebarWidth,
    tagsView,
    visitedViews,
    breadcrumb,
    
    // 方法
    initializeApp,
    detectDevice,
    handleResize,
    restoreSettings,
    saveSettings,
    toggleSidebar,
    toggleTheme,
    applyTheme,
    setPrimaryColor,
    setLanguage,
    setLoading,
    addVisitedView,
    delVisitedView,
    delOthersViews,
    delAllViews,
    setSystemConfig
  }
}, {
  persist: {
    key: 'app-store',
    storage: localStorage,
    paths: ['theme', 'primaryColor', 'language', 'sidebarCollapsed', 'tagsView', 'breadcrumb']
  }
})