import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/utils/request'
import type { User, ApiResponse } from '@/types'
import { usePermissionStore } from '@/stores/permission'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const menus = ref<any[]>([])  // 存储后端返回的菜单
  const remember = ref<boolean>(false)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 1)  // 1 = super admin
  const isOperator = computed(() => user.value?.role === 2)  // 2 = admin
  const isViewer = computed(() => user.value?.role === 3)  // 3 = user
  
  // 登录
  const login = async (loginForm: {
    account: string
    password: string
    remember?: boolean
  }): Promise<ApiResponse<{ token: string; admin: User }>> => {
    try {
      const response = await request.post<{ token: string; admin: User }>('/admin/auth/login', loginForm)

      if (response.code === 200 && response.data) {
        token.value = response.data.token
        user.value = response.data.admin  // 后端返回的是 admin 字段
        remember.value = loginForm.remember || false

        // 登录成功后立即获取用户信息、角色、菜单和权限
        await getUserInfo()
      }

      return response
    } catch (error) {
      throw error
    }
  }
  
  // 退出登录
  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        await request.post('/admin/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = ''
      user.value = null
      permissions.value = []
      remember.value = false
    }
  }
  
  // 获取用户信息
  const getUserInfo = async (): Promise<void> => {
    if (!token.value) return

    try {
      const response = await request.get<any>('/admin/auth/me')
      if (response.code === 200 && response.data) {
        // 后端返回的数据结构: { admin, roles, menus, permissions }
        user.value = response.data.admin

        // 保存角色信息
        if (response.data.roles && response.data.roles.length > 0) {
          user.value.roles = response.data.roles
        }

        // 保存菜单信息
        if (response.data.menus) {
          // 对菜单进行稳定排序（按 id 排序，深度递归）
          const sortMenusRecursive = (menuList: any[]): any[] => {
            if (!Array.isArray(menuList)) return menuList
            
            const sorted = [...menuList].sort((a, b) => {
              const aId = typeof a.id === 'number' ? a.id : parseInt(a.id)
              const bId = typeof b.id === 'number' ? b.id : parseInt(b.id)
              return aId - bId
            })
            
            return sorted.map(menu => ({
              ...menu,
              children: menu.children ? sortMenusRecursive(menu.children) : undefined
            }))
          }
          
          menus.value = sortMenusRecursive(response.data.menus)
          
          // 不需要在这里调用 setMenus，因为 permissionStore.generateMenus() 会从 userStore.menus 读取
          // 菜单的转换和设置会在路由初始化时通过 generateMenus 完成
        }

        // 保存权限信息
        if (response.data.permissions) {
          // 后端返回的是字符串数组，直接使用
          permissions.value = response.data.permissions
          console.log('Permissions loaded:', permissions.value)
        }
      }
    } catch (error) {
      console.error('Get user info error:', error)
      // 如果获取用户信息失败，可能是token过期，清除登录状态
      await logout()
    }
  }
  
  // 获取用户权限
  const getUserPermissions = async (): Promise<void> => {
    if (!token.value) return
    
    try {
      const response = await request.get<string[]>('/admin/auth/permissions')
      if (response.code === 200 && response.data) {
        permissions.value = response.data
      }
    } catch (error) {
      console.error('Get user permissions error:', error)
      // 权限获取失败不影响使用，暂时忽略
    }
  }
  
  // 获取用户菜单
  const getUserMenus = async (): Promise<void> => {
    if (!token.value) return
    
    try {
      const response = await request.get<any[]>('/admin/auth/menus')
      console.log('Menu response:', response)  // 调试日志
      if (response.code === 200 && response.data) {
        // 将菜单数据存储在user store中
        menus.value = response.data
        console.log('Menus stored:', menus.value)  // 调试日志
        
        // 菜单的转换和设置会在路由初始化时通过 permissionStore.generateMenus() 完成
        // 不需要在这里直接调用 setMenus
      }
    } catch (error) {
      console.error('Get user menus error:', error)
      // 菜单获取失败不影响使用，使用默认菜单
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (userInfo: Partial<User>): Promise<boolean> => {
    try {
      const response = await request.put<User>('/admin/auth/profile', userInfo)
      if (response.success) {
        user.value = response.data
        return true
      }
      return false
    } catch (error) {
      console.error('Update user info error:', error)
      return false
    }
  }
  
  // 修改密码
  const changePassword = async (passwordForm: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<boolean> => {
    try {
      const response = await request.put('/admin/auth/password', passwordForm)
      return response.success
    } catch (error) {
      console.error('Change password error:', error)
      return false
    }
  }
  
  // 上传头像
  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const response = await request.upload<{ url: string }>('/admin/auth/avatar', file)
      if (response.success) {
        if (user.value) {
          user.value.avatar = response.data.url
        }
        return response.data.url
      }
      return null
    } catch (error) {
      console.error('Upload avatar error:', error)
      return null
    }
  }
  
  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (isAdmin.value) return true
    return permissions.value.includes(permission)
  }
  
  // 检查多个权限（任一）
  const hasAnyPermission = (perms: string[]): boolean => {
    if (isAdmin.value) return true
    return perms.some(permission => permissions.value.includes(permission))
  }
  
  // 检查多个权限（全部）
  const hasAllPermissions = (perms: string[]): boolean => {
    if (isAdmin.value) return true
    return perms.every(permission => permissions.value.includes(permission))
  }
  
  // 检查角色
  const hasRole = (role: string): boolean => {
    return user.value?.role === role
  }
  
  // 重置状态
  const resetState = (): void => {
    token.value = ''
    user.value = null
    permissions.value = []
    menus.value = []
    remember.value = false
  }
  
  return {
    // 状态
    token,
    user,
    permissions,
    menus,
    remember,
    
    // 计算属性
    isLoggedIn,
    isAdmin,
    isOperator,
    isViewer,
    
    // 方法
    login,
    logout,
    getUserInfo,
    getUserPermissions,
    updateUserInfo,
    changePassword,
    uploadAvatar,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    resetState
  }
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'user', 'remember']
  }
})