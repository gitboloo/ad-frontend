import { useUserStore } from '@/stores/user'
import type { User } from '@/types'

// 权限配置
export const PERMISSIONS = {
  // 产品管理
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',
  
  // 计划管理
  CAMPAIGN_VIEW: 'campaign:view',
  CAMPAIGN_CREATE: 'campaign:create',
  CAMPAIGN_EDIT: 'campaign:edit',
  CAMPAIGN_DELETE: 'campaign:delete',
  CAMPAIGN_START: 'campaign:start',
  CAMPAIGN_PAUSE: 'campaign:pause',
  
  // 优惠券管理
  COUPON_VIEW: 'coupon:view',
  COUPON_CREATE: 'coupon:create',
  COUPON_EDIT: 'coupon:edit',
  COUPON_DELETE: 'coupon:delete',
  
  // 授权码管理
  AUTHCODE_VIEW: 'authcode:view',
  AUTHCODE_CREATE: 'authcode:create',
  AUTHCODE_DELETE: 'authcode:delete',
  
  // 财务管理
  FINANCE_VIEW: 'finance:view',
  FINANCE_RECHARGE: 'finance:recharge',
  FINANCE_WITHDRAW: 'finance:withdraw',
  FINANCE_APPROVE: 'finance:approve',
  
  // 客户管理
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_EDIT: 'customer:edit',
  CUSTOMER_BAN: 'customer:ban',
  
  // 系统管理
  SYSTEM_CONFIG: 'system:config',
  ADMIN_MANAGE: 'admin:manage',
  
  // 数据统计
  STATS_VIEW: 'stats:view',
  STATS_EXPORT: 'stats:export'
}

// 角色权限映射
export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),
  operator: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.CAMPAIGN_CREATE,
    PERMISSIONS.CAMPAIGN_EDIT,
    PERMISSIONS.CAMPAIGN_START,
    PERMISSIONS.CAMPAIGN_PAUSE,
    PERMISSIONS.COUPON_VIEW,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_EDIT,
    PERMISSIONS.AUTHCODE_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_EDIT,
    PERMISSIONS.STATS_VIEW
  ],
  viewer: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.COUPON_VIEW,
    PERMISSIONS.AUTHCODE_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.STATS_VIEW
  ]
}

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(permission: string): boolean {
  const userStore = useUserStore()
  const user = userStore.user
  
  if (!user) return false
  
  // 管理员拥有所有权限
  if (user.role === 'admin') return true
  
  // 检查角色权限
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * 检查用户是否有任一权限
 */
export function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(permission))
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(permission))
}

/**
 * 检查用户角色
 */
export function hasRole(role: string): boolean {
  const userStore = useUserStore()
  return userStore.user?.role === role
}

/**
 * 检查用户是否有任一角色
 */
export function hasAnyRole(roles: string[]): boolean {
  const userStore = useUserStore()
  return roles.includes(userStore.user?.role || '')
}

/**
 * 权限指令
 */
export const permissionDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { value } = binding
    
    if (value) {
      const hasAuth = Array.isArray(value) 
        ? hasAnyPermission(value)
        : hasPermission(value)
      
      if (!hasAuth) {
        el.style.display = 'none'
      }
    }
  },
  
  updated(el: HTMLElement, binding: any) {
    const { value } = binding
    
    if (value) {
      const hasAuth = Array.isArray(value) 
        ? hasAnyPermission(value)
        : hasPermission(value)
      
      el.style.display = hasAuth ? '' : 'none'
    }
  }
}

/**
 * 角色指令
 */
export const roleDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { value } = binding
    
    if (value) {
      const hasAuth = Array.isArray(value)
        ? hasAnyRole(value)
        : hasRole(value)
      
      if (!hasAuth) {
        el.style.display = 'none'
      }
    }
  },
  
  updated(el: HTMLElement, binding: any) {
    const { value } = binding
    
    if (value) {
      const hasAuth = Array.isArray(value)
        ? hasAnyRole(value)
        : hasRole(value)
      
      el.style.display = hasAuth ? '' : 'none'
    }
  }
}

/**
 * 权限检查工具类
 */
export class PermissionChecker {
  private user: User | null = null
  
  constructor(user?: User) {
    if (user) {
      this.user = user
    } else {
      const userStore = useUserStore()
      this.user = userStore.user
    }
  }
  
  /**
   * 更新用户信息
   */
  setUser(user: User) {
    this.user = user
    return this
  }
  
  /**
   * 检查权限
   */
  can(permission: string): boolean {
    if (!this.user) return false
    
    if (this.user.role === 'admin') return true
    
    const rolePermissions = ROLE_PERMISSIONS[this.user.role] || []
    return rolePermissions.includes(permission)
  }
  
  /**
   * 检查任一权限
   */
  canAny(permissions: string[]): boolean {
    return permissions.some(permission => this.can(permission))
  }
  
  /**
   * 检查所有权限
   */
  canAll(permissions: string[]): boolean {
    return permissions.every(permission => this.can(permission))
  }
  
  /**
   * 检查角色
   */
  is(role: string): boolean {
    return this.user?.role === role
  }
  
  /**
   * 检查任一角色
   */
  isAny(roles: string[]): boolean {
    return roles.includes(this.user?.role || '')
  }
  
  /**
   * 是否为管理员
   */
  isAdmin(): boolean {
    return this.user?.role === 'admin'
  }
  
  /**
   * 是否为操作员
   */
  isOperator(): boolean {
    return this.user?.role === 'operator'
  }
  
  /**
   * 是否为查看者
   */
  isViewer(): boolean {
    return this.user?.role === 'viewer'
  }
}

// 导出常用函数
export {
  hasPermission as can,
  hasAnyPermission as canAny,
  hasAllPermissions as canAll,
  hasRole as is,
  hasAnyRole as isAny
}