import type { RouteConfig } from '@/types/router'

// 根据角色生成完整的异步路由（作为完整路由而非子路由）
export function getFullAsyncRoutesByRole(role: number): RouteConfig[] {
  // 基础路由（所有角色都有）
  const baseRoutes: RouteConfig[] = [
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

  // 产品管理路由
  const productRoutes: RouteConfig[] = [
    {
      path: 'products',
      name: 'Products',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/products/list',
      meta: {
        title: '产品管理',
        icon: 'Goods'
      },
      children: [
        {
          path: 'list',
          name: 'ProductList',
          component: () => import('@/views/products/ProductList.vue'),
          meta: {
            title: '产品列表'
          }
        },
        {
          path: 'create',
          name: 'ProductCreate',
          component: () => import('@/views/products/ProductForm.vue'),
          meta: {
            title: '创建产品'
          }
        },
        {
          path: 'edit/:id',
          name: 'ProductEdit',
          component: () => import('@/views/products/ProductForm.vue'),
          meta: {
            title: '编辑产品',
            hidden: true
          }
        }
      ]
    }
  ]

  // 计划管理路由
  const campaignRoutes: RouteConfig[] = [
    {
      path: 'campaigns',
      name: 'Campaigns',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/campaigns/list',
      meta: {
        title: '计划管理',
        icon: 'Promotion'
      },
      children: [
        {
          path: 'list',
          name: 'CampaignList',
          component: () => import('@/views/campaigns/CampaignList.vue'),
          meta: {
            title: '计划列表'
          }
        },
        {
          path: 'create',
          name: 'CampaignCreate',
          component: () => import('@/views/campaigns/CampaignForm.vue'),
          meta: {
            title: '创建计划'
          }
        },
        {
          path: 'stats',
          name: 'CampaignStats',
          component: () => import('@/views/campaigns/CampaignStats.vue'),
          meta: {
            title: '计划统计'
          }
        }
      ]
    }
  ]

  // 优惠券管理路由
  const couponRoutes: RouteConfig[] = [
    {
      path: 'coupons',
      name: 'Coupons',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/coupons/list',
      meta: {
        title: '优惠券管理',
        icon: 'Ticket'
      },
      children: [
        {
          path: 'list',
          name: 'CouponList',
          component: () => import('@/views/coupons/CouponList.vue'),
          meta: {
            title: '优惠券列表'
          }
        },
        {
          path: 'create',
          name: 'CouponCreate',
          component: () => import('@/views/coupons/CouponForm.vue'),
          meta: {
            title: '创建优惠券'
          }
        },
        {
          path: 'user-coupons',
          name: 'UserCouponList',
          component: () => import('@/views/coupons/UserCouponList.vue'),
          meta: {
            title: '用户优惠券'
          }
        }
      ]
    }
  ]

  // 授权码管理路由（仅超级管理员）
  const authCodeRoutes: RouteConfig[] = [
    {
      path: 'authcodes',
      name: 'AuthCodes',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/authcodes/list',
      meta: {
        title: '授权码管理',
        icon: 'Key'
      },
      children: [
        {
          path: 'list',
          name: 'AuthCodeList',
          component: () => import('@/views/authcodes/AuthCodeList.vue'),
          meta: {
            title: '授权码列表'
          }
        },
        {
          path: 'generate',
          name: 'AuthCodeGenerate',
          component: () => import('@/views/authcodes/AuthCodeGenerate.vue'),
          meta: {
            title: '生成授权码'
          }
        }
      ]
    }
  ]

  // 财务管理路由
  const financeRoutes: RouteConfig[] = [
    {
      path: 'finance',
      name: 'Finance',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/finance/transactions',
      meta: {
        title: '财务管理',
        icon: 'Money'
      },
      children: [
        {
          path: 'transactions',
          name: 'TransactionList',
          component: () => import('@/views/finance/TransactionList.vue'),
          meta: {
            title: '交易记录'
          }
        },
        {
          path: 'recharge',
          name: 'RechargeForm',
          component: () => import('@/views/finance/RechargeForm.vue'),
          meta: {
            title: '充值管理'
          }
        },
        {
          path: 'withdraw',
          name: 'WithdrawForm',
          component: () => import('@/views/finance/WithdrawForm.vue'),
          meta: {
            title: '提现管理'
          }
        },
        {
          path: 'stats',
          name: 'FinanceStats',
          component: () => import('@/views/finance/FinanceStats.vue'),
          meta: {
            title: '财务统计'
          }
        }
      ]
    }
  ]

  // 客户管理路由
  const customerRoutes: RouteConfig[] = [
    {
      path: 'customers',
      name: 'Customers',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/customers/list',
      meta: {
        title: '客户管理',
        icon: 'User'
      },
      children: [
        {
          path: 'list',
          name: 'CustomerList',
          component: () => import('@/views/customers/CustomerList.vue'),
          meta: {
            title: '客户列表'
          }
        }
      ]
    }
  ]

  // 系统管理路由（仅超级管理员）
  const systemRoutes: RouteConfig[] = [
    {
      path: 'system',
      name: 'System',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/system/config',
      meta: {
        title: '系统管理',
        icon: 'Setting'
      },
      children: [
        {
          path: 'config',
          name: 'SystemConfig',
          component: () => import('@/views/system/SystemConfig.vue'),
          meta: {
            title: '系统配置'
          }
        },
        {
          path: 'admins',
          name: 'AdminList',
          component: () => import('@/views/system/AdminList.vue'),
          meta: {
            title: '管理员管理'
          }
        }
      ]
    }
  ]

  // 数据统计路由
  const statisticsRoutes: RouteConfig[] = [
    {
      path: 'statistics',
      name: 'Statistics',
      component: () => import('@/layouts/RouteView.vue'),
      redirect: '/statistics/overview',
      meta: {
        title: '数据统计',
        icon: 'DataAnalysis'
      },
      children: [
        {
          path: 'overview',
          name: 'StatisticsOverview',
          component: () => import('@/views/statistics/Overview.vue'),
          meta: {
            title: '总览统计'
          }
        },
        {
          path: 'products',
          name: 'ProductStats',
          component: () => import('@/views/statistics/ProductStats.vue'),
          meta: {
            title: '产品统计'
          }
        },
        {
          path: 'revenue',
          name: 'RevenueStats',
          component: () => import('@/views/statistics/RevenueStats.vue'),
          meta: {
            title: '收入统计'
          }
        }
      ]
    }
  ]

  // 根据角色返回路由
  let routes: RouteConfig[] = [...baseRoutes]
  
  if (role === 1) {  // 超级管理员 - 所有路由
    routes.push(
      ...productRoutes,
      ...campaignRoutes,
      ...couponRoutes,
      ...authCodeRoutes,
      ...financeRoutes,
      ...customerRoutes,
      ...systemRoutes,
      ...statisticsRoutes
    )
  } else if (role === 2) {  // 管理员 - 除了系统管理和授权码管理
    routes.push(
      ...productRoutes,
      ...campaignRoutes,
      ...couponRoutes,
      ...financeRoutes,
      ...customerRoutes,
      ...statisticsRoutes
    )
  } else {  // 普通用户 - 只有查看权限
    // 只添加部分路由，且限制子路由
    routes.push(
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/layouts/RouteView.vue'),
        redirect: '/products/list',
        meta: {
          title: '产品管理',
          icon: 'Goods'
        },
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/products/ProductList.vue'),
            meta: {
              title: '产品列表'
            }
          }
        ]
      },
      {
        path: 'campaigns',
        name: 'Campaigns',
        component: () => import('@/layouts/RouteView.vue'),
        redirect: '/campaigns/list',
        meta: {
          title: '计划管理',
          icon: 'Promotion'
        },
        children: [
          {
            path: 'list',
            name: 'CampaignList',
            component: () => import('@/views/campaigns/CampaignList.vue'),
            meta: {
              title: '计划列表'
            }
          },
          {
            path: 'stats',
            name: 'CampaignStats',
            component: () => import('@/views/campaigns/CampaignStats.vue'),
            meta: {
              title: '计划统计'
            }
          }
        ]
      },
      ...statisticsRoutes
    )
  }

  return routes
}