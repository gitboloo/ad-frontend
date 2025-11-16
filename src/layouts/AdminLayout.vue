<template>
  <div class="admin-layout" :class="{ 
    'is-mobile': appStore.device === 'mobile',
    'sidebar-collapsed': appStore.sidebarCollapsed 
  }">
    <!-- 侧边栏 -->
    <div
      class="sidebar-container"
      :class="{
        'sidebar-collapsed': appStore.sidebarCollapsed,
        'sidebar-mobile': appStore.device === 'mobile'
      }"
    >
      <AdminSidebar />
    </div>
    
    <!-- 移动端遮罩 -->
    <div
      v-if="appStore.device === 'mobile' && !appStore.sidebarCollapsed"
      class="mobile-overlay"
      @click="appStore.toggleSidebar"
    />
    
    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar-container">
        <AdminNavbar />
      </div>
      
      <!-- 标签页导航 -->
      <div v-if="appStore.tagsView" class="tags-view-container">
        <TagsView />
      </div>
      
      <!-- 主要内容 -->
      <div class="app-main">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
      
      <!-- 页脚 -->
      <div class="footer-container">
        <AdminFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import AdminSidebar from './components/Sidebar/index.vue'
import AdminNavbar from './components/Navbar/index.vue'
import TagsView from './components/TagsView/index.vue'
import AdminFooter from './components/Footer/index.vue'

const appStore = useAppStore()

// 缓存的视图
const cachedViews = computed(() => {
  return appStore.visitedViews.filter(view => !view.meta?.noCache).map(view => view.name)
})

// 处理窗口大小变化
const handleResize = () => {
  appStore.detectDevice()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.admin-layout {
  height: 100vh;
  display: flex;
  
  &.is-mobile {
    .main-container {
      margin-left: 0;
    }
  }
}

.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: $sidebar-width;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  z-index: 1001;
  transition: all 0.3s ease;
  
  &.sidebar-collapsed {
    width: $sidebar-collapsed-width;
  }
  
  &.sidebar-mobile {
    transform: translateX(-100%);
    
    &:not(.sidebar-collapsed) {
      transform: translateX(0);
    }
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.main-container {
  flex: 1;
  margin-left: $sidebar-width;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.admin-layout.is-mobile .main-container {
  margin-left: 0;
}

.admin-layout.sidebar-collapsed:not(.is-mobile) .main-container {
  margin-left: $sidebar-collapsed-width;
}

.navbar-container {
  position: sticky;
  top: 0;
  height: $header-height;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  z-index: 999;
}

.tags-view-container {
  height: $tags-view-height;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.app-main {
  flex: 1;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - #{$header-height} - #{$footer-height});
  overflow-x: hidden;
  
  .tags-view-container + & {
    min-height: calc(100vh - #{$header-height} - #{$tags-view-height} - #{$footer-height});
  }
}

.footer-container {
  height: $footer-height;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
}

// 过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s ease;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .admin-layout {
    &.is-mobile {
      .sidebar-container {
        &.sidebar-mobile {
          z-index: 1002;
        }
      }
    }
  }
}
</style>