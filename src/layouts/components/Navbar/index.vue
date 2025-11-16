<template>
  <div class="navbar">
    <div class="navbar-left">
      <!-- 折叠按钮 -->
      <div class="hamburger" @click="toggleSidebar">
        <el-icon size="20">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>
      
      <!-- 面包屑 -->
      <Breadcrumb v-if="appStore.breadcrumb && appStore.device !== 'mobile'" />
    </div>
    
    <div class="navbar-right">
      <!-- 搜索 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索菜单..."
          prefix-icon="Search"
          clearable
          @focus="showSearch = true"
          @blur="handleSearchBlur"
          @input="handleSearch"
        />
        
        <!-- 搜索结果 -->
        <div v-if="showSearch && searchResults.length" class="search-results">
          <div
            v-for="result in searchResults"
            :key="result.path"
            class="search-item"
            @click="handleSearchItemClick(result)"
          >
            <el-icon v-if="result.icon" size="16">
              <component :is="result.icon" />
            </el-icon>
            <span class="search-title">{{ result.title }}</span>
            <span class="search-path">{{ result.path }}</span>
          </div>
        </div>
      </div>
      
      <!-- 工具栏 -->
      <div class="toolbar">
        <!-- 全屏 -->
        <el-tooltip content="全屏" placement="bottom">
          <div class="toolbar-item" @click="toggleFullscreen">
            <el-icon size="18">
              <FullScreen />
            </el-icon>
          </div>
        </el-tooltip>
        
        <!-- 主题切换 -->
        <el-tooltip content="切换主题" placement="bottom">
          <div class="toolbar-item" @click="toggleTheme">
            <el-icon size="18">
              <Sunny v-if="appStore.theme === 'light'" />
              <Moon v-else />
            </el-icon>
          </div>
        </el-tooltip>
        
        <!-- 通知 -->
        <el-tooltip content="通知" placement="bottom">
          <div class="toolbar-item">
            <el-badge :value="notificationCount" :max="99" :hidden="notificationCount === 0">
              <el-icon size="18">
                <Bell />
              </el-icon>
            </el-badge>
          </div>
        </el-tooltip>
        
        <!-- 设置 -->
        <el-tooltip content="设置" placement="bottom">
          <div class="toolbar-item" @click="showSettings = true">
            <el-icon size="18">
              <Setting />
            </el-icon>
          </div>
        </el-tooltip>
      </div>
      
      <!-- 用户信息 -->
      <el-dropdown class="user-dropdown" @command="handleUserCommand">
        <div class="user-info">
          <el-avatar
            :size="32"
            :src="userStore.user?.avatar"
            :alt="userStore.user?.username"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <span v-if="appStore.device !== 'mobile'" class="username">
            {{ userStore.user?.nickname || userStore.user?.username }}
          </span>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 设置面板 -->
    <el-drawer
      v-model="showSettings"
      title="系统设置"
      direction="rtl"
      size="300px"
    >
      <SettingsPanel />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  Search,
  FullScreen,
  Sunny,
  Moon,
  Bell,
  Setting,
  User,
  SwitchButton
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import Breadcrumb from './Breadcrumb.vue'
import SettingsPanel from '../SettingsPanel/index.vue'
import type { MenuItem } from '@/types'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 响应式数据
const searchKeyword = ref('')
const showSearch = ref(false)
const showSettings = ref(false)
const notificationCount = ref(5) // 示例通知数量

// 搜索结果
const searchResults = computed(() => {
  if (!searchKeyword.value.trim()) return []
  
  const keyword = searchKeyword.value.toLowerCase()
  const results: MenuItem[] = []
  
  // 递归搜索菜单
  function searchMenu(menus: MenuItem[], parentPath = '') {
    menus.forEach(menu => {
      const fullPath = parentPath + (menu.path || '')
      
      if (menu.title.toLowerCase().includes(keyword)) {
        results.push({
          ...menu,
          path: fullPath
        })
      }
      
      if (menu.children) {
        searchMenu(menu.children, fullPath)
      }
    })
  }
  
  searchMenu(permissionStore.menuList)
  
  return results.slice(0, 10) // 限制结果数量
})

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 切换主题
const toggleTheme = () => {
  appStore.toggleTheme()
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 处理搜索
const handleSearch = (value: string) => {
  if (!value.trim()) {
    showSearch.value = false
  }
}

// 处理搜索失焦
const handleSearchBlur = () => {
  setTimeout(() => {
    showSearch.value = false
  }, 200)
}

// 处理搜索项点击
const handleSearchItemClick = (item: MenuItem) => {
  if (item.path) {
    router.push(item.path)
    searchKeyword.value = ''
    showSearch.value = false
  }
}

// 处理用户命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      showSettings.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    // 用户取消或出错
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--el-bg-color);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: $border-radius-base;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
  width: 240px;
  
  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 20px;
    }
  }
  
  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    border-radius: $border-radius-base;
    box-shadow: $box-shadow-light;
    z-index: 1000;
    
    .search-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
      
      .search-title {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
      
      .search-path {
        margin-left: auto;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .toolbar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}

.user-dropdown {
  cursor: pointer;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: $border-radius-base;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    
    .username {
      font-weight: 500;
      color: var(--el-text-color-primary);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .search-box {
    width: 200px;
  }
  
  .toolbar {
    gap: 4px;
    
    .toolbar-item {
      width: 32px;
      height: 32px;
    }
  }
}

@media (max-width: $breakpoint-xs) {
  .navbar {
    padding: 0 12px;
  }
  
  .navbar-left {
    gap: 12px;
  }
  
  .navbar-right {
    gap: 12px;
  }
  
  .search-box {
    width: 160px;
  }
}
</style>