<template>
  <div class="admin-footer">
    <div class="footer-content">
      <span class="copyright">
        © 2024 {{ appStore.title }} v{{ appStore.version }}
      </span>
      <div class="footer-links">
        <el-link href="#" type="primary" :underline="false">帮助文档</el-link>
        <el-divider direction="vertical" />
        <el-link href="#" type="primary" :underline="false">意见反馈</el-link>
        <el-divider direction="vertical" />
        <el-link href="#" type="primary" :underline="false">关于我们</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.admin-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: var(--el-bg-color);
  
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 1200px;
    padding: 0 16px;
    
    .copyright {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
    
    .footer-links {
      display: flex;
      align-items: center;
      gap: 0;
      
      .el-link {
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .admin-footer {
    .footer-content {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }
}
</style>