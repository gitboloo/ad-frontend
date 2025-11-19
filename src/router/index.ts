import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useAppStore } from '@/stores/app'
import { transformMenusToRoutes, type BackendMenuItem } from '@/utils/routeTransform'
import type { RouteRecordRaw } from 'vue-router'

// 常量路由（不需要权限）
const constantRoutes: RouteRecordRaw[] = [
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
      },
      {
        path: 'debug/route-test',
        name: 'RouteTest',
        component: () => import('@/views/debug/RouteTest.vue'),
        meta: {
          title: '路由调试',
          hidden: false
        }
      },
      {
        path: 'debug/component-test',
        name: 'ComponentTest',
        component: () => import('@/views/debug/ComponentTest.vue'),
        meta: {
          title: '组件测试',
          hidden: false
        }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 白名单路由（不需要登录）
const whiteList = ['/login', '/404', '/401']

// 标记动态路由是否已添加
let isRoutesAdded = false
// 路由注册完成的 Promise
let routesReadyPromise: Promise<void> | null = null
let resolveRoutesReady: (() => void) | null = null

// 路由前置守卫 - 使用现代 async/await 风格，避免 next() 回调问题
router.beforeEach(async (to, from) => {
  // 开始进度条
  NProgress.start()
  
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()
  
  // 设置页面标题
  document.title = getPageTitle(to.meta?.title as string)
  
  try {
    // 未登录的情况
    if (!userStore.token) {
      // 白名单内的路由允许访问
      if (whiteList.includes(to.path)) {
        return true
      }
      // 其他路由重定向到登录
      return `/login?redirect=${to.path}`
    }

    // 已登录用户访问登录页，重定向到首页
    if (to.path === '/login') {
      return { path: '/' }
    }

    // 检查路由是否已注册
    let needsRegister = false

    // 情况1：用户信息不存在，需要获取
    if (!userStore.user) {
      try {
        await userStore.getUserInfo()
        needsRegister = !isRoutesAdded && userStore.menus.length > 0
      } catch (error) {
        console.error('❌ 获取用户信息失败:', error)
        userStore.resetState()
        isRoutesAdded = false
        ElMessage.error('获取用户信息失败，请重新登录')
        return `/login?redirect=${to.path}`
      }
    } else {
      // 情况2：用户信息存在，检查路由是否已注册
      needsRegister = !isRoutesAdded && userStore.menus.length > 0
    }

    // 如果需要注册路由，执行注册
    if (needsRegister) {
      console.log('⚠️ 用户信息已存在但路由未注册，现在注册...')
      
      try {
        // 转换菜单为路由
        const menuRoutes = transformMenusToRoutes(userStore.menus as BackendMenuItem[])
        
        console.log('📌 转换后的菜单路由:', menuRoutes.map(r => ({ name: r.name, path: r.path, children: r.children?.length || 0 })))
        
        // 添加动态路由
        menuRoutes.forEach(route => {
          if (route.name !== 'Dashboard' && route.name !== 'dashboard') {
            console.log(`➕ 注册路由: ${String(route.name)} -> ${route.path}, 子路由数: ${route.children?.length || 0}`)
            if (route.children && route.children.length > 0) {
              route.children.forEach(child => {
                console.log(`  └─ 子路由: ${String(child.name)} -> ${child.path}, 有组件: ${!!child.component}`)
              })
            }
            router.addRoute('Layout', route)
          }
        })
        
        // 标记路由已添加
        isRoutesAdded = true
        
        console.log('✅ 已注册动态路由，当前所有路由:', router.getRoutes().length, '条')
        
        // 生成菜单
        permissionStore.generateMenus()
        
        // 关键：路由注册后，使用 push 重新导航以确保路由表已更新
        console.log('🔄 重新导航到:', to.path)
        NProgress.done()
        // 返回 false 中止当前导航，然后使用 router.push() 重新导航
        setTimeout(() => {
          router.push(to.fullPath)
        }, 0)
        return false
      } catch (error) {
        console.error('❌ 动态路由注册失败:', error)
        return '/dashboard'
      }
    } else if (isRoutesAdded) {
      // 路由已注册，放行
      console.log('✓ 路由已注册，放行访问:', to.path)
      return true
    } else {
      // 菜单数据未加载
      console.log('⏳ 菜单数据未加载或路由未注册，访问:', to.path)
      return true
    }
  } finally {
    NProgress.done()
  }
})

// 路由后置守卫
router.afterEach((to) => {
  // 结束进度条
  NProgress.done()
  
  // 添加到访问历史
  const appStore = useAppStore()
  if (to.meta?.title && to.path !== '/login') {
    appStore.addVisitedView({
      path: to.path,
      name: to.name as string,
      title: to.meta.title as string,
      affix: to.meta.affix as boolean
    })
  }
})

// 检查路由权限
function hasPermission(role: string, route: any): boolean {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(role) || role === 'admin'
  } else {
    return true
  }
}

// 生成页面标题
function getPageTitle(pageTitle?: string): string {
  const appStore = useAppStore()
  const title = appStore.title
  
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return title
}

// 动态添加404路由
const addErrorRoutes = () => {
  router.addRoute({
    path: '/401',
    name: '401',
    component: () => import('@/views/error/401.vue'),
    meta: {
      hidden: true
    }
  })
  
  router.addRoute({
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      hidden: true
    }
  })
  
  router.addRoute({
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true
    }
  })
}

// 添加错误路由
addErrorRoutes()

export default router