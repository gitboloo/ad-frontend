<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo" :class="{ collapsed: appStore.sidebarCollapsed }">
        <el-icon size="32" color="#409eff">
          <ShoppingBag />
        </el-icon>
        <transition name="fade">
          <h1 v-show="!appStore.sidebarCollapsed" class="title">
            {{ appStore.title.split(' ')[0] }}
          </h1>
        </transition>
      </div>
    </div>
    
    <div class="sidebar-content">
      <el-scrollbar class="scrollbar">
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          :unique-opened="true"
          :collapse-transition="false"
          mode="vertical"
          background-color="var(--el-bg-color)"
          text-color="var(--el-text-color-primary)"
          active-text-color="var(--el-color-primary)"
        >
          <SidebarItem
            v-for="route in menuList"
            :key="route.id"
            :item="route"
            :base-path="route.path || ''"
          />
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ShoppingBag } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 菜单列表
const menuList = computed(() => {
  const menus = permissionStore.menuList || []
  console.log('Sidebar menuList computed, count:', menus.length)
  // 添加详细的菜单结构日志
  menus.forEach((menu, index) => {
    console.log(`Menu ${index}:`, {
      id: menu.id,
      title: menu.title,
      path: menu.path,
      children: menu.children?.map(child => ({
        id: child.id,
        title: child.title,
        path: child.path
      }))
    })
  })
  return menus
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
}

.sidebar-header {
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  
  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s ease;
    
    &.collapsed {
      justify-content: center;
    }
    
    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
      white-space: nowrap;
    }
  }
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  
  .scrollbar {
    height: 100%;
    
    :deep(.el-scrollbar__view) {
      height: 100%;
    }
  }
  
  .el-menu {
    border-right: none;
    height: 100%;
    
    &:not(.el-menu--collapse) {
      width: $sidebar-width;
    }
    
    &.el-menu--collapse {
      width: $sidebar-collapsed-width;
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>