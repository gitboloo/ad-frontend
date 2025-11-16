import type { RouteConfig } from '@/types/router'

// 生成动态路由配置
export function generateDynamicRoutes(role: number): RouteConfig[] {
  const routes: RouteConfig[] = []
  
  // 产品管理
  if (role <= 3) {  // 所有角色都能看到产品管理
    routes.push({
      path: '/products',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/products/list',
      children: [
        {
          path: 'list',
          name: 'ProductList',
          component: () => import('@/views/products/ProductList.vue'),
          meta: { title: '产品列表' }
        },
        ...(role <= 2 ? [{
          path: 'create',
          name: 'ProductCreate',
          component: () => import('@/views/products/ProductForm.vue'),
          meta: { title: '创建产品' }
        }, {
          path: 'edit/:id',
          name: 'ProductEdit',
          component: () => import('@/views/products/ProductForm.vue'),
          meta: { title: '编辑产品', hidden: true }
        }] : [])
      ]
    })
  }
  
  // 计划管理
  if (role <= 3) {
    routes.push({
      path: '/campaigns',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/campaigns/list',
      children: [
        {
          path: 'list',
          name: 'CampaignList',
          component: () => import('@/views/campaigns/CampaignList.vue'),
          meta: { title: '计划列表' }
        },
        ...(role <= 2 ? [{
          path: 'create',
          name: 'CampaignCreate',
          component: () => import('@/views/campaigns/CampaignForm.vue'),
          meta: { title: '创建计划' }
        }] : []),
        {
          path: 'stats',
          name: 'CampaignStats',
          component: () => import('@/views/campaigns/CampaignStats.vue'),
          meta: { title: '计划统计' }
        }
      ]
    })
  }
  
  // 优惠券管理
  if (role <= 2) {
    routes.push({
      path: '/coupons',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/coupons/list',
      children: [
        {
          path: 'list',
          name: 'CouponList',
          component: () => import('@/views/coupons/CouponList.vue'),
          meta: { title: '优惠券列表' }
        },
        {
          path: 'create',
          name: 'CouponCreate',
          component: () => import('@/views/coupons/CouponForm.vue'),
          meta: { title: '创建优惠券' }
        },
        {
          path: 'user-coupons',
          name: 'UserCouponList',
          component: () => import('@/views/coupons/UserCouponList.vue'),
          meta: { title: '用户优惠券' }
        }
      ]
    })
  }
  
  // 授权码管理（仅超级管理员）
  if (role === 1) {
    routes.push({
      path: '/authcodes',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/authcodes/list',
      children: [
        {
          path: 'list',
          name: 'AuthCodeList',
          component: () => import('@/views/authcodes/AuthCodeList.vue'),
          meta: { title: '授权码列表' }
        },
        {
          path: 'generate',
          name: 'AuthCodeGenerate',
          component: () => import('@/views/authcodes/AuthCodeGenerate.vue'),
          meta: { title: '生成授权码' }
        }
      ]
    })
  }
  
  // 财务管理
  if (role <= 2) {
    routes.push({
      path: '/finance',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/finance/transactions',
      children: [
        {
          path: 'transactions',
          name: 'TransactionList',
          component: () => import('@/views/finance/TransactionList.vue'),
          meta: { title: '交易记录' }
        },
        {
          path: 'recharge',
          name: 'RechargeForm',
          component: () => import('@/views/finance/RechargeForm.vue'),
          meta: { title: '充值管理' }
        },
        {
          path: 'withdraw',
          name: 'WithdrawForm',
          component: () => import('@/views/finance/WithdrawForm.vue'),
          meta: { title: '提现管理' }
        },
        {
          path: 'stats',
          name: 'FinanceStats',
          component: () => import('@/views/finance/FinanceStats.vue'),
          meta: { title: '财务统计' }
        }
      ]
    })
  }
  
  // 客户管理
  if (role <= 2) {
    routes.push({
      path: '/customers',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/customers/list',
      children: [
        {
          path: 'list',
          name: 'CustomerList',
          component: () => import('@/views/customers/CustomerList.vue'),
          meta: { title: '客户列表' }
        }
      ]
    })
  }
  
  // 代理商管理（仅超级管理员和运营）
  if (role <= 2) {
    routes.push({
      path: '/agents',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/agents/list',
      children: [
        {
          path: 'list',
          name: 'AgentList',
          component: () => import('@/views/agents/AgentList.vue'),
          meta: { title: '代理商列表' }
        },
        {
          path: 'withdrawals',
          name: 'WithdrawalList',
          component: () => import('@/views/agents/WithdrawalList.vue'),
          meta: { title: '提现审核' }
        }
      ]
    })
  }

  // 系统管理（仅超级管理员）
  if (role === 1) {
    routes.push({
      path: '/system',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/system/config',
      children: [
        {
          path: 'config',
          name: 'SystemConfig',
          component: () => import('@/views/system/SystemConfig.vue'),
          meta: { title: '系统配置' }
        },
        {
          path: 'admins',
          name: 'AdminList',
          component: () => import('@/views/system/AdminList.vue'),
          meta: { title: '管理员管理' }
        }
      ]
    })
  }
  
  // 数据统计
  if (role <= 3) {
    routes.push({
      path: '/statistics',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/statistics/overview',
      children: [
        {
          path: 'overview',
          name: 'StatisticsOverview',
          component: () => import('@/views/statistics/Overview.vue'),
          meta: { title: '总览统计' }
        },
        {
          path: 'products',
          name: 'ProductStats',
          component: () => import('@/views/statistics/ProductStats.vue'),
          meta: { title: '产品统计' }
        },
        {
          path: 'revenue',
          name: 'RevenueStats',
          component: () => import('@/views/statistics/RevenueStats.vue'),
          meta: { title: '收入统计' }
        }
      ]
    })
  }
  
  return routes
}