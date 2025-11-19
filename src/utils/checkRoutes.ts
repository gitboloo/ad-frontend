// 路由检查工具
export function checkRoutesInConsole(router: any) {
  console.group('🔍 路由诊断')

  const allRoutes = router.getRoutes()
  console.log('📋 总路由数:', allRoutes.length)

  // 显示所有路由路径
  console.log('\n📌 所有路由路径:')
  allRoutes.forEach((route: any) => {
    const indent = route.path.includes('/') && route.path !== '/' ? '  ' : ''
    console.log(`${indent}${route.path} (${route.name || '未命名'})`)
  })

  // 检查关键路由
  console.log('\n🎯 关键路由检查:')
  const checkPaths = ['/products', '/products/list', '/campaigns', '/campaigns/list']
  checkPaths.forEach(path => {
    const exists = allRoutes.some((r: any) => r.path === path)
    console.log(`${exists ? '✅' : '❌'} ${path}`)
  })

  console.groupEnd()
}
