<template>
  <div v-if="!item.hidden">
    <!-- 有子菜单的情况 -->
    <el-sub-menu
      v-if="hasChildren && !onlyOneChild"
      :index="resolvePath(item.path)"
    >
      <template #title>
        <el-icon v-if="item.icon" size="18">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.title }}</span>
      </template>
      
      <SidebarItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :base-path="resolvePath(item.path)"
      />
    </el-sub-menu>
    
    <!-- 没有子菜单或只有一个子菜单的情况 -->
    <el-menu-item
      v-else
      :index="resolvePath(onlyOneChild?.path || item.path)"
      @click="handleMenuClick(onlyOneChild || item)"
    >
      <el-icon v-if="(onlyOneChild || item).icon" size="18">
        <component :is="(onlyOneChild || item).icon" />
      </el-icon>
      <template #title>
        <span>{{ (onlyOneChild || item).title }}</span>
        <el-badge
          v-if="(onlyOneChild || item).badge"
          :value="(onlyOneChild || item).badge"
          :max="99"
          class="menu-badge"
        />
      </template>
    </el-menu-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuItem } from '@/types'
import { isExternal } from '@/utils'

interface Props {
  item: MenuItem
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  basePath: ''
})

const router = useRouter()

// 是否有子菜单
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0
})

// 只有一个子菜单的情况
const onlyOneChild = computed(() => {
  if (!hasChildren.value) return null
  
  const showingChildren = props.item.children!.filter(child => !child.hidden)
  
  if (showingChildren.length === 1) {
    return showingChildren[0]
  }
  
  return null
})

// 解析路径
const resolvePath = (routePath?: string) => {
  if (!routePath) return props.basePath
  
  if (isExternal(routePath)) {
    return routePath
  }
  
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  
  return props.basePath ? `${props.basePath}/${routePath}`.replace(/\/+/g, '/') : routePath
}

// 处理菜单点击
const handleMenuClick = (item: MenuItem) => {
  if (item.path) {
    if (isExternal(item.path)) {
      window.open(item.path, '_blank')
    } else {
      router.push(item.path)
    }
  }
}

// 检查是否为外部链接
function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}
</script>

<style lang="scss" scoped>
.menu-badge {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  
  :deep(.el-badge__content) {
    border: 1px solid var(--el-bg-color);
  }
}

// 菜单项样式调整
:deep(.el-menu-item) {
  &.is-active {
    background-color: var(--el-color-primary-light-9);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--el-color-primary);
    }
  }
}

:deep(.el-sub-menu) {
  .el-sub-menu__title {
    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}
</style>