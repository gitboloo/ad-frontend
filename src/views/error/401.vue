<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">401</div>
      <div class="error-title">访问被拒绝</div>
      <div class="error-description">
        抱歉，您没有权限访问此页面
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          返回首页
        </el-button>
        <el-button @click="logout">
          重新登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  router.push('/')
}

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  
  .error-container {
    text-align: center;
    color: white;
    
    .error-code {
      font-size: 120px;
      font-weight: bold;
      margin-bottom: 20px;
      opacity: 0.8;
    }
    
    .error-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .error-description {
      font-size: 16px;
      margin-bottom: 32px;
      opacity: 0.9;
    }
    
    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}
</style>