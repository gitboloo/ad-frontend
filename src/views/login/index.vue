<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-header">
        <div class="logo">
          <el-icon size="32" color="#409eff">
            <ShoppingBag />
          </el-icon>
        </div>
        <h1 class="title">{{ appStore.title }}</h1>
        <p class="subtitle">管理员登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              记住我
            </el-checkbox>
            <el-link type="primary" @click="showForgotPassword = true">
              忘记密码？
            </el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p class="copyright">
          © 2024 {{ appStore.title }} v{{ appStore.version }}
        </p>
      </div>
    </div>
    
    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="showForgotPassword"
      title="忘记密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="forgotFormRef"
        :model="forgotForm"
        :rules="forgotRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="forgotForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showForgotPassword = false">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="forgotLoading"
            @click="handleForgotPassword"
          >
            发送重置邮件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { ShoppingBag } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { sendResetPasswordEmail } from '@/api/auth'
import { validateEmail } from '@/utils'

// 实例
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const loading = ref(false)
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const showForgotPassword = ref(false)
const forgotLoading = ref(false)
const forgotFormRef = ref<InstanceType<typeof ElForm>>()

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  remember: false
})

// 忘记密码表单
const forgotForm = reactive({
  email: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入正确的邮箱地址'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const response = await userStore.login(loginForm)
    
    if (response.code === 200) {
      ElMessage.success('登录成功')
      
      // 登录成功后获取用户信息和菜单
      await userStore.getUserInfo()
      
      // 重定向到原来要访问的页面或首页
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    }
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!forgotFormRef.value) return
  
  try {
    const valid = await forgotFormRef.value.validate()
    if (!valid) return
    
    forgotLoading.value = true
    
    const response = await sendResetPasswordEmail(forgotForm.email)
    
    if (response.success) {
      ElMessage.success('重置密码邮件已发送，请查收邮箱')
      showForgotPassword.value = false
      forgotForm.email = ''
    }
  } catch (error: any) {
    console.error('Forgot password error:', error)
    ElMessage.error(error.message || '发送邮件失败')
  } finally {
    forgotLoading.value = false
  }
}

// 组件挂载
onMounted(() => {
  // 如果已经登录，直接跳转
  if (userStore.isLoggedIn) {
    router.push('/')
  }
  
  // 应用主题
  appStore.applyTheme()
})
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  .logo {
    margin-bottom: 16px;
  }
  
  .title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }
  
  .subtitle {
    font-size: 16px;
    color: #909399;
    margin: 0;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 24px;
    
    :deep(.el-input__wrapper) {
      height: 48px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    :deep(.el-input__inner) {
      font-size: 16px;
    }
  }
  
  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  
  .copyright {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.dialog-footer {
  text-align: right;
}

// 暗色主题适配
html.dark {
  .login-wrapper {
    background: rgba(26, 26, 26, 0.95);
    
    .title {
      color: #e5eaf3;
    }
    
    .subtitle {
      color: #a3a6ad;
    }
    
    .copyright {
      color: #a3a6ad;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .login-wrapper {
    padding: 30px 20px;
  }
  
  .login-header {
    margin-bottom: 30px;
    
    .title {
      font-size: 24px;
    }
    
    .subtitle {
      font-size: 14px;
    }
  }
  
  .login-form {
    .el-form-item {
      margin-bottom: 20px;
      
      :deep(.el-input__wrapper) {
        height: 44px;
      }
    }
  }
}
</style>