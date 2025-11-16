<template>
  <el-breadcrumb separator="/">
    <transition-group name="breadcrumb" tag="div">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="item.path"
        :to="item.redirect === 'noRedirect' || index === breadcrumbList.length - 1 ? '' : { path: item.path }"
      >
        {{ item.meta?.title }}
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbList = ref<any[]>([])

const getBreadcrumb = () => {
  const matched = route.matched.filter(item => item.meta?.title && item.meta.breadcrumb !== false)
  
  const first = matched[0]
  
  if (!isDashboard(first)) {
    matched.unshift({ path: '/dashboard', meta: { title: '仪表盘' } } as any)
  }
  
  breadcrumbList.value = matched.filter(item => {
    return item.meta?.title && item.meta?.breadcrumb !== false
  })
}

const isDashboard = (route: any) => {
  const name = route && route.name
  if (!name) {
    return false
  }
  return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
}

watch(
  () => route.path,
  () => {
    getBreadcrumb()
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  font-size: 14px;
  line-height: 1;
  
  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: var(--el-text-color-secondary);
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
    
    &:last-child {
      .el-breadcrumb__inner {
        color: var(--el-text-color-primary);
        cursor: text;
        
        &:hover {
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.3s ease;
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.breadcrumb-move {
  transition: all 0.3s ease;
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>