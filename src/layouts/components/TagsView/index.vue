<template>
  <div class="tags-view">
    <el-scrollbar class="tags-scrollbar">
      <div class="tags-wrapper">
        <el-tag
          v-for="tag in visitedViews"
          :key="tag.path"
          :class="{ active: isActive(tag) }"
          :closable="!tag.affix"
          @click="navigateToTag(tag)"
          @close="closeTag(tag)"
        >
          {{ tag.title }}
        </el-tag>
      </div>
    </el-scrollbar>
    
    <!-- 右键菜单 -->
    <el-dropdown
      trigger="contextmenu"
      @command="handleCommand"
    >
      <div class="context-menu-trigger" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon>
            刷新页面
          </el-dropdown-item>
          <el-dropdown-item command="close">
            <el-icon><Close /></el-icon>
            关闭标签
          </el-dropdown-item>
          <el-dropdown-item command="closeOthers">
            <el-icon><CircleClose /></el-icon>
            关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="closeAll">
            <el-icon><FolderDelete /></el-icon>
            关闭所有
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Refresh, Close, CircleClose, FolderDelete } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const visitedViews = computed(() => appStore.visitedViews)

const isActive = (tag: any) => {
  return tag.path === route.path
}

const navigateToTag = (tag: any) => {
  router.push(tag.path)
}

const closeTag = (tag: any) => {
  appStore.delVisitedView(tag.path)
  if (isActive(tag)) {
    const lastTag = visitedViews.value[visitedViews.value.length - 1]
    if (lastTag) {
      router.push(lastTag.path)
    } else {
      router.push('/')
    }
  }
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'refresh':
      router.go(0)
      break
    case 'close':
      closeTag({ path: route.path })
      break
    case 'closeOthers':
      appStore.delOthersViews(route.path)
      break
    case 'closeAll':
      appStore.delAllViews()
      router.push('/')
      break
  }
}
</script>

<style lang="scss" scoped>
.tags-view {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--el-bg-color);
  position: relative;
  
  .tags-scrollbar {
    flex: 1;
    
    .tags-wrapper {
      display: flex;
      gap: 8px;
      
      .el-tag {
        cursor: pointer;
        border: 1px solid var(--el-border-color-light);
        
        &.active {
          background-color: var(--el-color-primary);
          color: white;
          border-color: var(--el-color-primary);
        }
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
  
  .context-menu-trigger {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
}
</style>