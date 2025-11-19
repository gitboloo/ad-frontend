/**
 * 路由调试工具
 */

// 检查组件映射
export function debugComponentMap() {
  const componentMap: Record<string, () => Promise<any>> = {
    // Dashboard
    'dashboard/index': () => import('@/views/dashboard/index.vue'),
    'views/dashboard/index.vue': () => import('@/views/dashboard/index.vue'),
    
    // Products
    'products/ProductList': () => import('@/views/products/ProductList.vue'),
    'views/products/ProductList.vue': () => import('@/views/products/ProductList.vue'),
    'views/products/ProductForm.vue': () => import('@/views/products/ProductForm.vue'),
    
    // Campaigns
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
    'finance/RechargeForm': () => import('@/views/finance/RechargeForm.vue'),
    'finance/WithdrawForm': () => import('@/views/finance/WithdrawForm.vue'),
    'views/finance/TransactionList.vue': () => import('@/views/finance/TransactionList.vue'),
    'views/finance/RechargeForm.vue': () => import('@/views/finance/RechargeForm.vue'),
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
    'statistics/ProductStats': () => import('@/views/statistics/ProductStats.vue'),
    'statistics/RevenueStats': () => import('@/views/statistics/RevenueStats.vue'),
    'views/statistics/Overview.vue': () => import('@/views/statistics/Overview.vue'),
    'views/statistics/ProductStats.vue': () => import('@/views/statistics/ProductStats.vue'),
    'views/statistics/RevenueStats.vue': () => import('@/views/statistics/RevenueStats.vue'),
    
    // Layout
    'Layout': () => import('@/layouts/RouteView.vue'),
    'layouts/RouteView.vue': () => import('@/layouts/RouteView.vue'),
  }

  return componentMap
}

// 测试组件是否能正确加载
export async function testComponentLoader(componentPath: string) {
  const componentMap = debugComponentMap()
  console.log(`测试组件路径: ${componentPath}`)
  
  if (componentMap[componentPath]) {
    try {
      const component = await componentMap[componentPath]()
      console.log(`✓ 组件 ${componentPath} 加载成功:`, component)
      return true
    } catch (error) {
      console.error(`✗ 组件 ${componentPath} 加载失败:`, error)
      return false
    }
  } else {
    console.warn(`✗ 组件路径 ${componentPath} 不在映射表中`)
    console.log('可用的组件路径:', Object.keys(componentMap))
    return false
  }
}

// 调试菜单数据
export function debugMenuData(menus: any[]) {
  console.log('=== 菜单调试信息 ===')
  console.log('原始菜单数据:', JSON.stringify(menus, null, 2))
  
  menus.forEach((menu, index) => {
    console.log(`菜单 ${index + 1}: ${menu.title}`)
    console.log(`  - ID: ${menu.id}`)
    console.log(`  - 名称: ${menu.name}`)  
    console.log(`  - 路径: ${menu.path}`)
    console.log(`  - 组件: ${menu.component || '无'}`)
    console.log(`  - 类型: ${menu.type} (1=目录, 2=页面)`)
    console.log(`  - 隐藏: ${menu.is_hidden ? '是' : '否'}`)
    
    if (menu.children && menu.children.length > 0) {
      console.log(`  - 子菜单 (${menu.children.length}个):`)
      menu.children.forEach((child: any, childIndex: number) => {
        console.log(`    ${childIndex + 1}. ${child.title}`)
        console.log(`       路径: ${child.path}`)
        console.log(`       组件: ${child.component || '无'}`)
        console.log(`       隐藏: ${child.is_hidden ? '是' : '否'}`)
      })
    }
    console.log('---')
  })
}

// 全局暴露调试函数
if (typeof window !== 'undefined') {
  (window as any).routeDebug = {
    testComponent: testComponentLoader,
    debugMenus: debugMenuData,
    componentMap: debugComponentMap()
  }
}