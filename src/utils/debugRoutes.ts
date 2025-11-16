// 路由调试工具
export function debugRoutes(router: any) {
  console.group('🔍 路由诊断信息')
  
  // 获取所有路由
  const routes = router.getRoutes()
  
  // 按路径分组显示
  console.log('📋 所有注册的路由:')
  routes.forEach((route: any) => {
    console.log(`  ${route.path} => ${route.name || '(unnamed)'}`)
    if (route.children) {
      route.children.forEach((child: any) => {
        console.log(`    └─ ${child.path} => ${child.name || '(unnamed)'}`)
      })
    }
  })
  
  // 显示当前路由
  console.log('\n📍 当前路由:', router.currentRoute.value.fullPath)
  
  // 显示匹配的路由
  const matched = router.currentRoute.value.matched
  console.log('\n✅ 匹配的路由链:')
  matched.forEach((m: any, index: number) => {
    console.log(`  ${index + 1}. ${m.path} => ${m.name}`)
  })
  
  console.groupEnd()
  
  return routes
}

// 检查路由是否存在
export function checkRouteExists(router: any, path: string): boolean {
  const routes = router.getRoutes()
  return routes.some((route: any) => {
    if (route.path === path) return true
    // 检查完整路径
    const fullPath = route.path.startsWith('/') ? route.path : `/${route.path}`
    return fullPath === path
  })
}

// 获取路由树结构
export function getRouteTree(router: any): any {
  const routes = router.getRoutes()
  const tree: any = {}
  
  routes.forEach((route: any) => {
    const path = route.path
    if (!tree[path]) {
      tree[path] = {
        name: route.name,
        component: route.component?.name || 'Unknown',
        children: []
      }
    }
  })
  
  return tree
}