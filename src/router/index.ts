import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { usePermissionStore, constantRoutes } from '@/stores/permission'
import { useAppStore } from '@/stores/app'
import { generateDynamicRoutes } from './dynamicRoutes'
import { debugRoutes } from '@/utils/debugRoutes'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 白名单路由（不需要登录）
const whiteList = ['/login', '/404', '/401']

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 开始进度条
  NProgress.start()
  
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const appStore = useAppStore()
  
  // 设置页面标题
  document.title = getPageTitle(to.meta?.title)
  
  if (userStore.token) {
    if (to.path === '/login') {
      // 已登录用户访问登录页，重定向到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 检查用户信息是否存在
      if (!userStore.user) {
        try {
          // 获取用户信息
          await userStore.getUserInfo()
          console.log('After getUserInfo, user role:', userStore.user?.role)
          console.log('After getUserInfo, menus:', userStore.menus)
          
          // 根据用户角色生成动态路由
          const userRole = userStore.user?.role || 3
          const dynamicRoutes = generateDynamicRoutes(userRole)
          
          // 添加动态路由（作为独立的顶级路由）
          dynamicRoutes.forEach(route => {
            router.addRoute(route)
          })
          
          console.log('Routes added for role', userRole, ':', dynamicRoutes.map(r => r.path))
          console.log('Current routes:', router.getRoutes().map(r => r.path))
          
          // 调试路由信息
          debugRoutes(router)
          
          // 生成菜单
          permissionStore.generateMenus()
          console.log('After generateMenus, menuList:', permissionStore.menuList)
          
          // 确保添加路由已完成
          next({ ...to, replace: true })
        } catch (error) {
          // 获取用户信息失败，清除token并跳转到登录页
          userStore.resetState()
          ElMessage.error('获取用户信息失败，请重新登录')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        // 用户信息存在，检查权限
        if (hasPermission(userStore.user.role, to)) {
          next()
        } else {
          // 没有权限，跳转到403页面
          next({ path: '/401' })
          NProgress.done()
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      // 其他没有访问权限的页面将重定向到登录页面
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
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
      affix: to.meta.affix
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