import type { App } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { formatTime } from '@/utils'

/**
 * 全局插件：注册全局属性和方法
 */
export default {
  install(app: App) {
    // 注册 $formatDate 方法
    app.config.globalProperties.$formatDate = (time: string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
      return formatTime(time, format)
    }

    // 注册 $checkPermission 方法
    app.config.globalProperties.$checkPermission = (permissions: string | string[]) => {
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()

      // 如果没有传递权限数组，默认允许
      if (!permissions) {
        return true
      }

      // 转换为数组
      const permissionArray = Array.isArray(permissions) ? permissions : [permissions]

      // 管理员有所有权限
      if (userStore.isAdmin || userStore.isOperator) {
        return true
      }

      // 检查用户是否拥有任何一个所需的权限
      return permissionArray.some((permission) => {
        return permissionStore.permissionList.includes(permission)
      })
    }

    // 注册 $user 属性（当前用户信息）
    app.config.globalProperties.$user = {
      get id() {
        return useUserStore().user?.id || null
      },
      get username() {
        return useUserStore().user?.username || ''
      },
      get nickname() {
        return useUserStore().user?.nickname || ''
      },
      get avatar() {
        return useUserStore().user?.avatar || ''
      },
      get isAdmin() {
        return useUserStore().isAdmin
      },
      get isOperator() {
        return useUserStore().isOperator
      },
      get permissions() {
        return usePermissionStore().permissionList || []
      }
    }
  }
}
