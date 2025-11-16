import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import type { RouteConfig, MenuItem } from '@/types'

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref<RouteConfig[]>([])
  const menuList = ref<MenuItem[]>([])
  const permissionList = ref<string[]>([])
  
  // 生成路由
  const generateRoutes = (roles: string[]): RouteConfig[] => {
    const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
    routes.value = constantRoutes.concat(accessedRoutes)
    return routes.value
  }
  
  // 生成菜单（优先使用后端菜单数据）
  const generateMenus = (): MenuItem[] => {
    const userStore = useUserStore()
    
    console.log('Generating menus, userStore.menus:', userStore.menus)  // 调试日志
    
    // 如果有后端返回的菜单数据，使用后端的
    if (userStore.menus && userStore.menus.length > 0) {
      menuList.value = userStore.menus
      console.log('Using backend menus:', menuList.value)  // 调试日志
      return userStore.menus
    }
    
    // 否则使用本地菜单树根据角色过滤
    const role = userStore.user?.role || ''
    const menus = filterMenusByRole(menuTree, role)
    menuList.value = menus
    console.log('Using local menus filtered by role:', role, menuList.value)  // 调试日志
    return menus
  }
  
  // 过滤异步路由
  const filterAsyncRoutes = (routes: RouteConfig[], roles: string[]): RouteConfig[] => {
    const res: RouteConfig[] = []
    
    routes.forEach(route => {
      const tmp = { ...route }
      if (hasPermission(roles, tmp)) {
        if (tmp.children) {
          tmp.children = filterAsyncRoutes(tmp.children, roles)
        }
        res.push(tmp)
      }
    })
    
    return res
  }
  
  // 检查权限
  const hasPermission = (roles: string[], route: RouteConfig): boolean => {
    if (route.meta && route.meta.roles) {
      return roles.some(role => route.meta!.roles!.includes(role))
    } else {
      return true
    }
  }
  
  // 根据角色过滤菜单
  const filterMenusByRole = (menus: MenuItem[], role: string | number): MenuItem[] => {
    // 转换角色值为数字
    const roleNum = typeof role === 'string' ? parseInt(role) : role
    
    return menus.filter(menu => {
      // 如果是超级管理员(role=1)，显示所有菜单
      if (roleNum === 1) {
        if (menu.children) {
          menu.children = filterMenusByRole(menu.children, roleNum)
        }
        return !menu.hidden
      }
      
      // 如果是管理员(role=2)，显示管理员和通用菜单
      if (roleNum === 2) {
        // 排除超级管理员专属菜单（系统管理、授权码管理）
        if (menu.id === 'system' || menu.id === 'authcodes') {
          return false
        }
        if (menu.children) {
          menu.children = filterMenusByRole(menu.children, roleNum)
        }
        return !menu.hidden
      }
      
      // 普通用户(role=3)，只显示查看类菜单
      if (roleNum === 3) {
        // 只显示特定菜单
        const allowedMenus = ['dashboard', 'products', 'campaigns', 'statistics']
        if (!allowedMenus.includes(menu.id || '')) {
          return false
        }
        if (menu.children) {
          // 过滤子菜单，只保留查看类
          menu.children = menu.children.filter(child => {
            return !child.path?.includes('create') && !child.path?.includes('edit')
          })
        }
        return !menu.hidden
      }
      
      return false
    })
  }
  
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
    generateRoutes,
    generateMenus,
    setMenus,
    setPermissions
  }
})

// 常量路由
export const constantRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      hidden: true
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Dashboard',
          affix: true
        }
      }
    ]
  }
]

// 异步路由
export const asyncRoutes: RouteConfig[] = [
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/products/list',
    meta: {
      title: '产品管理',
      icon: 'Goods',
      roles: ['admin', 'operator']
    },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/products/ProductList.vue'),
        meta: {
          title: '产品列表',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'create',
        name: 'ProductCreate',
        component: () => import('@/views/products/ProductForm.vue'),
        meta: {
          title: '创建产品',
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'edit/:id',
        name: 'ProductEdit',
        component: () => import('@/views/products/ProductForm.vue'),
        meta: {
          title: '编辑产品',
          hidden: true,
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'detail/:id',
        name: 'ProductDetail',
        component: () => import('@/views/products/ProductDetail.vue'),
        meta: {
          title: '产品详情',
          hidden: true,
          roles: ['admin', 'operator', 'viewer']
        }
      }
    ]
  },
  {
    path: '/campaigns',
    name: 'Campaigns',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/campaigns/list',
    meta: {
      title: '计划管理',
      icon: 'Promotion',
      roles: ['admin', 'operator']
    },
    children: [
      {
        path: 'list',
        name: 'CampaignList',
        component: () => import('@/views/campaigns/CampaignList.vue'),
        meta: {
          title: '计划列表',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'create',
        name: 'CampaignCreate',
        component: () => import('@/views/campaigns/CampaignForm.vue'),
        meta: {
          title: '创建计划',
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'edit/:id',
        name: 'CampaignEdit',
        component: () => import('@/views/campaigns/CampaignForm.vue'),
        meta: {
          title: '编辑计划',
          hidden: true,
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'stats',
        name: 'CampaignStats',
        component: () => import('@/views/campaigns/CampaignStats.vue'),
        meta: {
          title: '计划统计',
          roles: ['admin', 'operator', 'viewer']
        }
      }
    ]
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/coupons/list',
    meta: {
      title: '优惠券管理',
      icon: 'Ticket',
      roles: ['admin', 'operator']
    },
    children: [
      {
        path: 'list',
        name: 'CouponList',
        component: () => import('@/views/coupons/CouponList.vue'),
        meta: {
          title: '优惠券列表',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'create',
        name: 'CouponCreate',
        component: () => import('@/views/coupons/CouponForm.vue'),
        meta: {
          title: '创建优惠券',
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'edit/:id',
        name: 'CouponEdit',
        component: () => import('@/views/coupons/CouponForm.vue'),
        meta: {
          title: '编辑优惠券',
          hidden: true,
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'user-coupons',
        name: 'UserCouponList',
        component: () => import('@/views/coupons/UserCouponList.vue'),
        meta: {
          title: '用户优惠券',
          roles: ['admin', 'operator', 'viewer']
        }
      }
    ]
  },
  {
    path: '/authcodes',
    name: 'AuthCodes',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/authcodes/list',
    meta: {
      title: '授权码管理',
      icon: 'Key',
      roles: ['admin']
    },
    children: [
      {
        path: 'list',
        name: 'AuthCodeList',
        component: () => import('@/views/authcodes/AuthCodeList.vue'),
        meta: {
          title: '授权码列表',
          roles: ['admin']
        }
      },
      {
        path: 'generate',
        name: 'AuthCodeGenerate',
        component: () => import('@/views/authcodes/AuthCodeGenerate.vue'),
        meta: {
          title: '生成授权码',
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/finance',
    name: 'Finance',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/finance/transactions',
    meta: {
      title: '财务管理',
      icon: 'Money',
      roles: ['admin', 'operator']
    },
    children: [
      {
        path: 'transactions',
        name: 'TransactionList',
        component: () => import('@/views/finance/TransactionList.vue'),
        meta: {
          title: '交易记录',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'recharge',
        name: 'RechargeForm',
        component: () => import('@/views/finance/RechargeForm.vue'),
        meta: {
          title: '充值管理',
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'withdraw',
        name: 'WithdrawForm',
        component: () => import('@/views/finance/WithdrawForm.vue'),
        meta: {
          title: '提现管理',
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'stats',
        name: 'FinanceStats',
        component: () => import('@/views/finance/FinanceStats.vue'),
        meta: {
          title: '财务统计',
          roles: ['admin', 'operator', 'viewer']
        }
      }
    ]
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/customers/list',
    meta: {
      title: '客户管理',
      icon: 'User',
      roles: ['admin', 'operator']
    },
    children: [
      {
        path: 'list',
        name: 'CustomerList',
        component: () => import('@/views/customers/CustomerList.vue'),
        meta: {
          title: '客户列表',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'edit/:id',
        name: 'CustomerEdit',
        component: () => import('@/views/customers/CustomerForm.vue'),
        meta: {
          title: '编辑客户',
          hidden: true,
          roles: ['admin', 'operator']
        }
      },
      {
        path: 'detail/:id',
        name: 'CustomerDetail',
        component: () => import('@/views/customers/CustomerDetail.vue'),
        meta: {
          title: '客户详情',
          hidden: true,
          roles: ['admin', 'operator', 'viewer']
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/system/config',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      roles: ['admin']
    },
    children: [
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: {
          title: '系统配置',
          roles: ['admin']
        }
      },
      {
        path: 'admins',
        name: 'AdminList',
        component: () => import('@/views/system/AdminList.vue'),
        meta: {
          title: '管理员管理',
          roles: ['admin']
        }
      },
      {
        path: 'admin/create',
        name: 'AdminCreate',
        component: () => import('@/views/system/AdminForm.vue'),
        meta: {
          title: '创建管理员',
          hidden: true,
          roles: ['admin']
        }
      },
      {
        path: 'admin/edit/:id',
        name: 'AdminEdit',
        component: () => import('@/views/system/AdminForm.vue'),
        meta: {
          title: '编辑管理员',
          hidden: true,
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/layouts/RouteView.vue'),
    redirect: '/statistics/overview',
    meta: {
      title: '数据统计',
      icon: 'DataAnalysis',
      roles: ['admin', 'operator', 'viewer']
    },
    children: [
      {
        path: 'overview',
        name: 'StatisticsOverview',
        component: () => import('@/views/statistics/Overview.vue'),
        meta: {
          title: '总览统计',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'products',
        name: 'ProductStats',
        component: () => import('@/views/statistics/ProductStats.vue'),
        meta: {
          title: '产品统计',
          roles: ['admin', 'operator', 'viewer']
        }
      },
      {
        path: 'revenue',
        name: 'RevenueStats',
        component: () => import('@/views/statistics/RevenueStats.vue'),
        meta: {
          title: '收入统计',
          roles: ['admin', 'operator', 'viewer']
        }
      }
    ]
  }
]

// 菜单树
export const menuTree: MenuItem[] = [
  {
    id: 'dashboard',
    title: '仪表盘',
    path: '/dashboard',
    icon: 'Dashboard',
    roles: ['admin', 'operator', 'viewer']
  },
  {
    id: 'products',
    title: '产品管理',
    icon: 'Goods',
    roles: ['admin', 'operator'],
    children: [
      {
        id: 'product-list',
        title: '产品列表',
        path: '/products/list',
        roles: ['admin', 'operator', 'viewer']
      },
      {
        id: 'product-create',
        title: '创建产品',
        path: '/products/create',
        roles: ['admin', 'operator']
      }
    ]
  },
  {
    id: 'campaigns',
    title: '计划管理',
    icon: 'Promotion',
    roles: ['admin', 'operator'],
    children: [
      {
        id: 'campaign-list',
        title: '计划列表',
        path: '/campaigns/list',
        roles: ['admin', 'operator', 'viewer']
      },
      {
        id: 'campaign-create',
        title: '创建计划',
        path: '/campaigns/create',
        roles: ['admin', 'operator']
      },
      {
        id: 'campaign-stats',
        title: '计划统计',
        path: '/campaigns/stats',
        roles: ['admin', 'operator', 'viewer']
      }
    ]
  },
  {
    id: 'coupons',
    title: '优惠券管理',
    icon: 'Ticket',
    roles: ['admin', 'operator'],
    children: [
      {
        id: 'coupon-list',
        title: '优惠券列表',
        path: '/coupons/list',
        roles: ['admin', 'operator', 'viewer']
      },
      {
        id: 'coupon-create',
        title: '创建优惠券',
        path: '/coupons/create',
        roles: ['admin', 'operator']
      },
      {
        id: 'user-coupon-list',
        title: '用户优惠券',
        path: '/coupons/user-coupons',
        roles: ['admin', 'operator', 'viewer']
      }
    ]
  },
  {
    id: 'authcodes',
    title: '授权码管理',
    icon: 'Key',
    roles: ['admin'],
    children: [
      {
        id: 'authcode-list',
        title: '授权码列表',
        path: '/authcodes/list',
        roles: ['admin']
      },
      {
        id: 'authcode-generate',
        title: '生成授权码',
        path: '/authcodes/generate',
        roles: ['admin']
      }
    ]
  },
  {
    id: 'finance',
    title: '财务管理',
    icon: 'Money',
    roles: ['admin', 'operator'],
    children: [
      {
        id: 'transaction-list',
        title: '交易记录',
        path: '/finance/transactions',
        roles: ['admin', 'operator', 'viewer']
      },
      {
        id: 'recharge-form',
        title: '充值管理',
        path: '/finance/recharge',
        roles: ['admin', 'operator']
      },
      {
        id: 'withdraw-form',
        title: '提现管理',
        path: '/finance/withdraw',
        roles: ['admin', 'operator']
      },
      {
        id: 'finance-stats',
        title: '财务统计',
        path: '/finance/stats',
        roles: ['admin', 'operator', 'viewer']
      }
    ]
  },
  {
    id: 'customers',
    title: '客户管理',
    icon: 'User',
    roles: ['admin', 'operator'],
    children: [
      {
        id: 'customer-list',
        title: '客户列表',
        path: '/customers/list',
        roles: ['admin', 'operator', 'viewer']
      }
    ]
  },
  {
    id: 'system',
    title: '系统管理',
    icon: 'Setting',
    roles: ['admin'],
    children: [
      {
        id: 'system-config',
        title: '系统配置',
        path: '/system/config',
        roles: ['admin']
      },
      {
        id: 'admin-list',
        title: '管理员管理',
        path: '/system/admins',
        roles: ['admin']
      }
    ]
  },
  {
    id: 'statistics',
    title: '数据统计',
    icon: 'DataAnalysis',
    roles: ['admin', 'operator', 'viewer'],
    children: [
      {
        id: 'statistics-overview',
        title: '总览统计',
        path: '/statistics/overview',
        roles: ['admin', 'operator', 'viewer']
      },
      {
        id: 'product-stats',
        title: '产品统计',
        path: '/statistics/products',
        roles: ['admin', 'operator', 'viewer']
      },
      {
        id: 'revenue-stats',
        title: '收入统计',
        path: '/statistics/revenue',
        roles: ['admin', 'operator', 'viewer']
      }
    ]
  }
]