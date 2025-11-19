import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { transformMenusForDisplay, type BackendMenuItem, type MenuItem } from '@/utils/routeTransform'

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref<RouteConfig[]>([])
  const menuList = ref<MenuItem[]>([])
  const permissionList = ref<string[]>([])
  
  // 注意：路由生成现在完全在 router/index.ts 中处理
  
  // 生成菜单（完全使用后端菜单数据）
  const generateMenus = (): MenuItem[] => {
    const userStore = useUserStore()

    console.log('Generating menus from backend data:', userStore.menus)

    // 使用后端返回的菜单数据
    if (userStore.menus && userStore.menus.length > 0) {
      const visibleMenus = transformMenusForDisplay(userStore.menus as BackendMenuItem[])
      menuList.value = visibleMenus
      console.log('Generated menus:', visibleMenus.length, 'items')
      return visibleMenus
    }

    console.warn('No menu data found from backend')
    menuList.value = []
    return []
  }

  // 注意：filterHiddenMenus 函数已移动到 routeTransform.ts 工具文件中
  
  // 注意：权限过滤逻辑现在由后端处理，前端只需要显示后端返回的菜单
  
  // 设置菜单数据（从后端获取）
  const setMenus = (menus: MenuItem[]): void => {
    menuList.value = menus
  }
  
  // 设置权限列表
  const setPermissions = (permissions: string[]): void => {
    permissionList.value = permissions
  }
  
  return {
    routes,
    menuList,
    permissionList,
    generateMenus,
    setMenus,
    setPermissions
  }
})

// 注意：所有路由和菜单配置现在都来自后端，不再需要前端硬编码