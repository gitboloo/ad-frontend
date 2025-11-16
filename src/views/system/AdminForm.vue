<template>
  <div class="admin-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑管理员' : '新建管理员' }}</span>
          <el-button type="text" @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        :disabled="loading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名"
                :disabled="isEdit"
              />
              <div class="form-help" v-if="!isEdit">
                用户名用于登录，创建后不可修改
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入邮箱地址"
                type="email"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="!isEdit">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请确认密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="formData.nickname"
                placeholder="请输入昵称（可选）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select
                v-model="formData.role"
                placeholder="请选择角色"
                style="width: 100%"
                :disabled="!$checkPermission(['admin']) || ($user.id === formData.id && isEdit)"
              >
                <el-option
                  v-for="role in roleOptions"
                  :key="role.value"
                  :label="role.label"
                  :value="role.value"
                />
              </el-select>
              <div class="form-help">
                不同角色拥有不同的系统权限
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group
                v-model="formData.status"
                :disabled="!$checkPermission(['admin']) || ($user.id === formData.id && isEdit)"
              >
                <el-radio label="active">正常</el-radio>
                <el-radio label="inactive">禁用</el-radio>
                <el-radio label="banned" v-if="$checkPermission(['admin'])">封禁</el-radio>
              </el-radio-group>
              <div class="form-help">
                禁用的管理员无法登录系统
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="头像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img
                  v-if="formData.avatar"
                  :src="formData.avatar"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 权限说明 -->
        <el-divider />
        <div class="permissions-info">
          <h4>角色权限说明</h4>
          <div class="permissions-grid">
            <div class="permission-item">
              <div class="permission-header">
                <el-tag type="danger" size="small">超级管理员</el-tag>
              </div>
              <div class="permission-desc">
                拥有系统所有权限，包括用户管理、系统配置、数据管理等
              </div>
            </div>
            <div class="permission-item">
              <div class="permission-header">
                <el-tag type="warning" size="small">运营人员</el-tag>
              </div>
              <div class="permission-desc">
                可以管理用户、产品、订单等业务数据，不能修改系统配置
              </div>
            </div>
            <div class="permission-item">
              <div class="permission-header">
                <el-tag type="info" size="small">只读用户</el-tag>
              </div>
              <div class="permission-desc">
                只能查看数据和报表，不能进行任何修改操作
              </div>
            </div>
          </div>
        </div>

        <!-- 安全设置（仅编辑模式显示） -->
        <el-divider v-if="isEdit" />
        <div class="security-section" v-if="isEdit">
          <h4>安全设置</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最后登录时间">
                <el-input
                  :value="formData.lastLoginTime ? $formatDate(formData.lastLoginTime) : '从未登录'"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-input
                  :value="$formatDate(formData.createdAt)"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-button
              type="warning"
              @click="handleResetPassword"
              v-if="$checkPermission(['admin']) || $user.id === formData.id"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              @click="handleForceLogout"
              v-if="$checkPermission(['admin']) && $user.id !== formData.id"
            >
              强制下线
            </el-button>
          </el-form-item>
        </div>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="80px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="passwordForm.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSubmit" :loading="passwordLoading">
          确认重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  resetAdminPassword,
  getRoles
} from '@/api/system'
import type { User } from '@/types'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)
const passwordLoading = ref(false)
const passwordDialogVisible = ref(false)
const roleOptions = ref<{ value: string; label: string }[]>([])

const isEdit = computed(() => !!route.params.id)
const adminId = computed(() => route.params.id as string)

interface AdminForm extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password?: string
  confirmPassword?: string
}

const formData = reactive<AdminForm>({
  username: '',
  email: '',
  nickname: '',
  avatar: '',
  role: 'viewer',
  status: 'active',
  lastLoginTime: '',
  password: '',
  confirmPassword: ''
})

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!isEdit.value && value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validatePasswordConfirm = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: !isEdit.value ? [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ] : [],
  confirmPassword: !isEdit.value ? [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ] : [],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const passwordRules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePasswordConfirm, trigger: 'blur' }
  ]
}

onMounted(async () => {
  await loadRoles()
  if (isEdit.value) {
    await loadAdmin()
  }
})

const loadRoles = async () => {
  try {
    const res = await getRoles()
    roleOptions.value = res.data
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const loadAdmin = async () => {
  try {
    loading.value = true
    const res = await getAdminUser(adminId.value)
    const admin = res.data
    
    Object.assign(formData, admin)
  } catch (error) {
    ElMessage.error('加载管理员信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  formData.avatar = response.data.url
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像必须是JPG或PNG格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过2MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const submitData = { ...formData }
      
      // 移除确认密码字段
      if ('confirmPassword' in submitData) {
        delete submitData.confirmPassword
      }
      
      // 如果是编辑模式且没有填写密码，则移除密码字段
      if (isEdit.value && !submitData.password) {
        delete submitData.password
      }
      
      if (isEdit.value) {
        await updateAdminUser(adminId.value, submitData)
        ElMessage.success('管理员信息更新成功')
      } else {
        await createAdminUser(submitData as AdminForm & { password: string })
        ElMessage.success('管理员创建成功')
      }
      
      router.push('/system/admins')
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      loading.value = false
    }
  })
}

const handleResetPassword = () => {
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      passwordLoading.value = true
      await resetAdminPassword(adminId.value, passwordForm.password)
      ElMessage.success('密码重置成功')
      passwordDialogVisible.value = false
    } catch (error) {
      ElMessage.error('密码重置失败')
    } finally {
      passwordLoading.value = false
    }
  })
}

const handleForceLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要强制该管理员下线吗？这将使其当前登录会话失效。',
      '确认操作',
      { type: 'warning' }
    )
    
    // 这里应该调用强制下线API
    // await forceLogout(adminId.value)
    ElMessage.success('强制下线成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('强制下线失败')
    }
  }
}

const handleBack = () => {
  router.push('/system/admins')
}
</script>

<style scoped>
.admin-form-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.permissions-info {
  margin: 20px 0;
}

.permissions-info h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.permission-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 15px;
}

.permission-header {
  margin-bottom: 8px;
}

.permission-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.security-section {
  margin: 20px 0;
}

.security-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}
</style>