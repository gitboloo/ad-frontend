<template>
  <div class="settings-content">
    <!-- 主题设置 -->
    <div class="setting-group">
      <h3 class="group-title">主题设置</h3>
      <div class="setting-item">
        <span class="setting-label">主题模式</span>
        <el-switch
          v-model="isDark"
          inactive-text="浅色"
          active-text="深色"
          @change="toggleTheme"
        />
      </div>
      <div class="setting-item">
        <span class="setting-label">主题色</span>
        <div class="color-picker-wrapper">
          <el-color-picker
            v-model="primaryColor"
            show-alpha
            @change="changePrimaryColor"
          />
        </div>
      </div>
    </div>
    
    <!-- 布局设置 -->
    <div class="setting-group">
      <h3 class="group-title">布局设置</h3>
      <div class="setting-item">
        <span class="setting-label">侧边栏折叠</span>
        <el-switch
          v-model="sidebarCollapsed"
          @change="toggleSidebar"
        />
      </div>
      <div class="setting-item">
        <span class="setting-label">标签页导航</span>
        <el-switch
          v-model="tagsView"
          @change="toggleTagsView"
        />
      </div>
      <div class="setting-item">
        <span class="setting-label">面包屑导航</span>
        <el-switch
          v-model="breadcrumb"
          @change="toggleBreadcrumb"
        />
      </div>
    </div>
    
    <!-- 功能设置 -->
    <div class="setting-group">
      <h3 class="group-title">功能设置</h3>
      <div class="setting-item">
        <span class="setting-label">页面缓存</span>
        <el-switch v-model="pageCache" />
      </div>
      <div class="setting-item">
        <span class="setting-label">动画效果</span>
        <el-switch v-model="animation" />
      </div>
      <div class="setting-item">
        <span class="setting-label">水印</span>
        <el-switch v-model="watermark" />
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="setting-actions">
      <el-button type="primary" @click="saveSettings">
        保存设置
      </el-button>
      <el-button @click="resetSettings">
        重置设置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 响应式数据
const pageCache = ref(true)
const animation = ref(true)
const watermark = ref(false)

// 计算属性
const isDark = computed({
  get: () => appStore.theme === 'dark',
  set: (value) => value
})

const sidebarCollapsed = computed({
  get: () => appStore.sidebarCollapsed,
  set: (value) => value
})

const tagsView = computed({
  get: () => appStore.tagsView,
  set: (value) => value
})

const breadcrumb = computed({
  get: () => appStore.breadcrumb,
  set: (value) => value
})

const primaryColor = computed({
  get: () => appStore.primaryColor,
  set: (value) => value
})

// 方法
const toggleTheme = () => {
  appStore.toggleTheme()
}

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleTagsView = (value: boolean) => {
  appStore.tagsView = value
  appStore.saveSettings()
}

const toggleBreadcrumb = (value: boolean) => {
  appStore.breadcrumb = value
  appStore.saveSettings()
}

const changePrimaryColor = (color: string) => {
  if (color) {
    appStore.setPrimaryColor(color)
  }
}

const saveSettings = () => {
  appStore.saveSettings()
  ElMessage.success('设置已保存')
}

const resetSettings = () => {
  // 重置到默认设置
  appStore.theme = 'light'
  appStore.primaryColor = '#409eff'
  appStore.sidebarCollapsed = false
  appStore.tagsView = true
  appStore.breadcrumb = true
  pageCache.value = true
  animation.value = true
  watermark.value = false
  
  appStore.applyTheme()
  appStore.setPrimaryColor('#409eff')
  appStore.saveSettings()
  
  ElMessage.success('设置已重置')
}
</script>

<style lang="scss" scoped>
.settings-content {
  padding: 0 4px;
  
  .setting-group {
    margin-bottom: 32px;
    
    .group-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      
      .setting-label {
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
      
      .color-picker-wrapper {
        display: flex;
        align-items: center;
      }
    }
  }
  
  .setting-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 32px;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>