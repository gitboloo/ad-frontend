import type { RouteRecordRaw } from 'vue-router'

/**
 * 后端菜单数据结构（与 /auth/me 返回的数据结构匹配）
 */
export interface BackendMenuItem {
  id: number
  name: string
  title: string
  path: string
  component?: string
  redirect?: string
  icon?: string
  parent_id: number
  is_hidden: number
  is_affix: number
  is_cache: number
  type: number // 1=目录 2=页面
  children?: BackendMenuItem[]
}

/**
 * 兼容旧版本的后端路由数据结构
 */
export interface BackendRoute {
  id: string
  name?: string
  title: string
  path: string
  component?: string
  redirect?: string
  icon?: string
  meta?: Record<string, any>
  children?: BackendRoute[]
}

/**
 * 动态导入组件的映射
 */
const componentMap: Record<string, () => Promise<any>> = {
  // Dashboard
  'dashboard/index': () => import('@/views/dashboard/index.vue'),
  'views/dashboard/index.vue': () => import('@/views/dashboard/index.vue'),
  
    // Products  
    'products/ProductList': () => import('@/views/products/ProductList.vue'),
    'ProductList': () => import('@/views/products/ProductList.vue'),
    'views/products/ProductList.vue': () => import('@/views/products/ProductList.vue'),
    'views/products/ProductForm.vue': () => import('@/views/products/ProductForm.vue'),  // Campaigns
  'campaigns/CampaignList': () => import('@/views/campaigns/CampaignList.vue'),
  'views/campaigns/CampaignList.vue': () => import('@/views/campaigns/CampaignList.vue'),
  'views/campaigns/CampaignForm.vue': () => import('@/views/campaigns/CampaignForm.vue'),
  'views/campaigns/CampaignStats.vue': () => import('@/views/campaigns/CampaignStats.vue'),
  
  // Coupons
  'coupons/CouponList': () => import('@/views/coupons/CouponList.vue'),
  'views/coupons/CouponList.vue': () => import('@/views/coupons/CouponList.vue'),
  'views/coupons/CouponForm.vue': () => import('@/views/coupons/CouponForm.vue'),
  'views/coupons/UserCouponList.vue': () => import('@/views/coupons/UserCouponList.vue'),
  
  // Auth Codes
  'views/authcodes/AuthCodeList.vue': () => import('@/views/authcodes/AuthCodeList.vue'),
  'views/authcodes/AuthCodeGenerate.vue': () => import('@/views/authcodes/AuthCodeGenerate.vue'),
  
  // Finance
  'finance/TransactionList': () => import('@/views/finance/TransactionList.vue'),
  'finance/RechargeForm': () => import('@/views/finance/RechargeListPage.vue'),
  'finance/RechargeListPage': () => import('@/views/finance/RechargeListPage.vue'),
  'finance/WithdrawForm': () => import('@/views/finance/WithdrawForm.vue'),
  'views/finance/TransactionList.vue': () => import('@/views/finance/TransactionList.vue'),
  'views/finance/RechargeForm.vue': () => import('@/views/finance/RechargeListPage.vue'),
  'views/finance/RechargeListPage.vue': () => import('@/views/finance/RechargeListPage.vue'),
  'views/finance/WithdrawForm.vue': () => import('@/views/finance/WithdrawForm.vue'),
  'views/finance/FinanceStats.vue': () => import('@/views/finance/FinanceStats.vue'),
  
  // Customers
  'customers/CustomerList': () => import('@/views/customers/CustomerList.vue'),
  'views/customers/CustomerList.vue': () => import('@/views/customers/CustomerList.vue'),
  'views/customers/CustomerForm.vue': () => import('@/views/customers/CustomerForm.vue'),
  'views/customers/CustomerDetail.vue': () => import('@/views/customers/CustomerDetail.vue'),
  
  // Agents
  'views/agents/AgentList.vue': () => import('@/views/agents/AgentList.vue'),
  'views/agents/WithdrawalList.vue': () => import('@/views/agents/WithdrawalList.vue'),
  
  // System
  'system/AdminList': () => import('@/views/system/AdminList.vue'),
  'system/PermissionList': () => import('@/views/system/PermissionList.vue'),
  'system/RoleList': () => import('@/views/system/RoleList.vue'),
  'system/SystemConfig': () => import('@/views/system/SystemConfig.vue'),
  'views/system/SystemConfig.vue': () => import('@/views/system/SystemConfig.vue'),
  'views/system/AdminList.vue': () => import('@/views/system/AdminList.vue'),
  'views/system/PermissionList.vue': () => import('@/views/system/PermissionList.vue'),
  'views/system/RoleList.vue': () => import('@/views/system/RoleList.vue'),
  'views/system/AdminForm.vue': () => import('@/views/system/AdminForm.vue'),
  
    // Statistics
    'statistics/Overview': () => import('@/views/statistics/Overview.vue'),
    'Overview': () => import('@/views/statistics/Overview.vue'),
    'statistics/ProductStats': () => import('@/views/statistics/ProductStats.vue'),
    'ProductStats': () => import('@/views/statistics/ProductStats.vue'),
    'statistics/RevenueStats': () => import('@/views/statistics/RevenueStats.vue'),
    'RevenueStats': () => import('@/views/statistics/RevenueStats.vue'),
  'views/statistics/Overview.vue': () => import('@/views/statistics/Overview.vue'),
  'views/statistics/ProductStats.vue': () => import('@/views/statistics/ProductStats.vue'),
  'views/statistics/RevenueStats.vue': () => import('@/views/statistics/RevenueStats.vue'),
  
  // Layout
  'Layout': () => import('@/layouts/RouteView.vue'),
  'layouts/RouteView.vue': () => import('@/layouts/RouteView.vue'),
}

/**
 * 将后端路由数据转换为 Vue Router 路由配置
 * @param backendRoutes 后端返回的路由数据
 * @returns Vue Router 路由配置数组
 */
export function transformBackendRoutes(backendRoutes: BackendRoute[]): RouteRecordRaw[] {
  if (!backendRoutes || backendRoutes.length === 0) {
    return []
  }

  return backendRoutes.map(route => transformSingleRoute(route))
}

/**
 * 转换单个路由
 * @param route 后端路由数据
 * @returns Vue Router 路由配置
 */
function transformSingleRoute(route: BackendRoute): RouteRecordRaw {
  const vueRoute: any = {
    path: route.path,
    name: route.name || route.id,
    meta: {
      title: route.title,
      icon: route.icon,
      ...route.meta
    }
  }

  // 设置组件
  if (route.component) {
    const componentLoader = componentMap[route.component]
    if (componentLoader) {
      vueRoute.component = componentLoader
    } else {
      console.warn(`组件 ${route.component} 未在 componentMap 中定义`)
      // 使用默认错误组件
      vueRoute.component = componentMap['layouts/RouteView.vue'] || (() => Promise.resolve({
        template: '<div>组件未找到: ' + route.component + '</div>'
      }))
    }
  }

  // 设置重定向
  if (route.redirect) {
    vueRoute.redirect = route.redirect
  }

  // 递归处理子路由
  if (route.children && route.children.length > 0) {
    vueRoute.children = route.children.map(child => transformSingleRoute(child))
  }

  return vueRoute as RouteRecordRaw
}

/**
 * 将后端菜单数据转换为 Vue Router 路由配置（新版本，适配 /auth/me 接口）
 * 自动过滤隐藏的菜单项，防止隐藏路由被注册
 * @param menus 后端返回的菜单数据
 * @returns Vue Router 路由配置数组（只包含非隐藏的路由）
 */
export function transformMenusToRoutes(menus: BackendMenuItem[]): RouteRecordRaw[] {
  if (!menus || menus.length === 0) {
    return []
  }

  // 先过滤隐藏的菜单项，再转换为路由
  const visibleMenus = filterVisibleMenusForRoutes(menus)
  
  const routes = visibleMenus.map(menu => transformMenuToRoute(menu))
  
  return routes
}

/**
 * 过滤可见的菜单项用于路由注册（递归处理子菜单）
 * @param menus 菜单数据
 * @returns 过滤后的可见菜单数据
 */
function filterVisibleMenusForRoutes(menus: BackendMenuItem[]): BackendMenuItem[] {
  return menus
    .filter(menu => menu.is_hidden === 0) // 只保留非隐藏菜单
    .map(menu => {
      if (menu.children && menu.children.length > 0) {
        return {
          ...menu,
          children: filterVisibleMenusForRoutes(menu.children)
        }
      }
      return menu
    })
    .filter(menu => {
      // 如果是目录类型且所有子菜单都被隐藏，则也隐藏父菜单
      if (menu.type === 1 && menu.children) {
        return menu.children.length > 0
      }
      return true
    })
}

/**
 * 转换单个菜单为路由
 * @param menu 后端菜单数据
 * @returns Vue Router 路由配置
 */
function transformMenuToRoute(menu: BackendMenuItem): RouteRecordRaw {
  
  const route: any = {
    name: menu.name,
    path: menu.path,
    meta: {
      title: menu.title,
      hidden: menu.is_hidden === 1,
      affix: menu.is_affix === 1,
      cache: menu.is_cache === 1,
    }
  }

  // 添加图标
  if (menu.icon) {
    route.meta.icon = menu.icon
  }

  // 处理组件路径
  if (menu.component) {
    // 直接查找组件映射（支持后端返回的格式）
    let componentLoader = componentMap[menu.component]
    if (componentLoader) {
      route.component = componentLoader
    } else {
      // 尝试添加 views/ 前缀的格式
      const viewsPath = `views/${menu.component}.vue`
      componentLoader = componentMap[viewsPath]
      if (componentLoader) {
        route.component = componentLoader
      } else {
        // 尝试去掉可能存在的扩展名后再匹配
        const cleanPath = menu.component.replace(/\.vue$/, '')
        componentLoader = componentMap[cleanPath]
        if (componentLoader) {
          route.component = componentLoader
        } else {
          // 尝试从组件路径中提取文件名进行匹配
          const fileName = menu.component.split('/').pop()
          if (fileName && componentMap[fileName]) {
            route.component = componentMap[fileName]
          } else {
            console.warn(`组件未找到: ${menu.component} (菜单: ${menu.title})`)
          }
        }
      }
    }
  } else if (menu.type === 1) {
    // 目录类型，使用 RouteView 布局
    route.component = componentMap['layouts/RouteView.vue']
  }

  // 处理重定向
  if (menu.redirect) {
    route.redirect = menu.redirect
  }

  // 处理子路由
  if (menu.children && menu.children.length > 0) {
    route.children = menu.children.map(child => transformMenuToRoute(child))
  }

  return route as RouteRecordRaw
}

/**
 * 过滤隐藏的路由（用于侧边栏显示）
 * @param routes 路由配置数组
 * @returns 过滤后的路由配置数组
 */
export function filterHiddenRoutes(routes: BackendRoute[]): BackendRoute[] {
  return routes
    .filter(route => !route.meta?.hidden)
    .map(route => {
      if (route.children && route.children.length > 0) {
        return {
          ...route,
          children: filterHiddenRoutes(route.children)
        }
      }
      return route
    })
}

/**
 * 过滤隐藏的菜单项（用于侧边栏显示）
 * @param menus 菜单配置数组
 * @returns 过滤后的菜单配置数组
 */
export function filterHiddenMenus(menus: BackendMenuItem[]): BackendMenuItem[] {
  return menus
    .filter(menu => menu.is_hidden === 0) // 只保留非隐藏的菜单
    .map(menu => {
      if (menu.children && menu.children.length > 0) {
        return {
          ...menu,
          children: filterHiddenMenus(menu.children)
        }
      }
      return menu
    })
}

/**
 * 前端菜单显示格式
 */
export interface MenuItem {
  id: string
  name: string
  title: string
  path: string
  icon?: string
  hidden: boolean
  children?: MenuItem[]
}

/**
 * 将后端菜单转换为前端菜单格式（用于侧边栏显示）
 * @param menus 后端菜单数据
 * @returns 前端菜单格式
 */
export function transformMenusForDisplay(menus: BackendMenuItem[]): MenuItem[] {
  // 先过滤隐藏菜单，再转换格式
  const visibleMenus = filterHiddenMenus(menus)
  
  // 注意：菜单顺序已在 userStore 中按 id 排序
  return visibleMenus.map(menu => ({
    id: menu.id.toString(),
    name: menu.name,
    title: menu.title,
    path: menu.path,
    icon: menu.icon,
    hidden: false, // 已经通过 filterHiddenMenus 过滤,所以都是可见的
    children: menu.children ? transformMenusForDisplay(menu.children) : undefined
  }))
}

/**
 * 扁平化路由（用于权限检查）
 * @param routes 路由配置数组
 * @param parent 父路由路径
 * @returns 扁平化的路由路径数组
 */
export function flattenRoutes(routes: BackendRoute[], parent = ''): string[] {
  const paths: string[] = []
  
  routes.forEach(route => {
    const fullPath = parent ? `${parent}/${route.path}` : route.path
    paths.push(fullPath)
    
    if (route.children && route.children.length > 0) {
      paths.push(...flattenRoutes(route.children, fullPath))
    }
  })
  
  return paths
}
