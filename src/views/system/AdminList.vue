<template>
  <div class="admin-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员列表</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="$checkPermission(['admin'])"
          >
            新建管理员
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-form :model="queryParams" inline>
          <el-form-item label="搜索">
            <el-input
              v-model="queryParams.search"
              placeholder="用户名/邮箱/昵称"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select
              v-model="queryParams.role"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="role in roleOptions"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 100px"
            >
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="inactive" />
              <el-option label="封禁" value="banned" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button
          type="danger"
          :disabled="!multipleSelection.length"
          @click="handleBatchDelete"
          v-if="$checkPermission(['admin'])"
        >
          批量删除
        </el-button>
        <div class="toolbar-right">
          <el-button circle @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar
                :size="32"
                :src="row.avatar"
                :alt="row.username"
              >
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ row.username }}</div>
                <div class="nickname" v-if="row.nickname">{{ row.nickname }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getRoleTagType(row.role)"
              size="small"
            >
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="110">
          <template #default="{ row }">
            {{ row.lastLoginTime ? $formatDate(row.lastLoginTime) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="110">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
              v-if="$checkPermission(['admin']) || $user.id === row.id"
            >
              编辑
            </el-button>
            <el-dropdown
              trigger="click"
              @command="(command) => handleCommand(command, row)"
              v-if="$checkPermission(['admin']) && $user.id !== row.id"
            >
              <el-button type="primary" link>
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="toggleStatus">
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="resetPassword">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item command="viewProfile">
                    查看资料
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
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
        <el-button type="primary" @click="handlePasswordSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 查看资料对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="管理员资料"
      width="600px"
    >
      <div class="profile-info" v-if="selectedUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ selectedUser.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleTagType(selectedUser.role)">
              {{ getRoleLabel(selectedUser.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedUser.status)">
              {{ getStatusLabel(selectedUser.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">
            {{ selectedUser.lastLoginTime ? $formatDate(selectedUser.lastLoginTime) : '从未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ $formatDate(selectedUser.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="profileDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue'
import {
  getAdminUsers,
  deleteAdminUser,
  updateAdminStatus,
  resetAdminPassword,
  getRoles
} from '@/api/system'
import type { User, ListQuery } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref<User[]>([])
const multipleSelection = ref<User[]>([])
const total = ref(0)
const passwordDialogVisible = ref(false)
const profileDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const currentUser = ref<User | null>(null)
const selectedUser = ref<User | null>(null)
const roleOptions = ref<{ value: string; label: string }[]>([])

const queryParams = reactive<ListQuery & { role?: string; status?: string }>({
  page: 1,
  pageSize: 20,
  search: '',
  role: '',
  status: ''
})

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

onMounted(async () => {
  await loadRoles()
  await fetchData()
})

const loadRoles = async () => {
  try {
    const res = await getRoles()
    roleOptions.value = res.data
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAdminUsers(queryParams)
    tableData.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取管理员列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    pageSize: 20,
    search: '',
    role: '',
    status: ''
  })
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

const handleCreate = () => {
  router.push('/system/admins/create')
}

const handleEdit = (row: User) => {
  router.push(`/system/admins/${row.id}/edit`)
}

const handleCommand = async (command: string, row: User) => {
  switch (command) {
    case 'toggleStatus':
      await handleToggleStatus(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'viewProfile':
      handleViewProfile(row)
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

const handleToggleStatus = async (row: User) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${action}管理员 ${row.username} 吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await updateAdminStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleResetPassword = (row: User) => {
  currentUser.value = row
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value || !currentUser.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await resetAdminPassword(currentUser.value!.id, passwordForm.password)
      ElMessage.success('密码重置成功')
      passwordDialogVisible.value = false
    } catch (error) {
      ElMessage.error('密码重置失败')
    }
  })
}

const handleViewProfile = (row: User) => {
  selectedUser.value = row
  profileDialogVisible.value = true
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除管理员 ${row.username} 吗？此操作不可恢复。`,
      '确认删除',
      { type: 'warning' }
    )
    
    await deleteAdminUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个管理员吗？此操作不可恢复。`,
      '确认批量删除',
      { type: 'warning' }
    )
    
    // 这里应该调用批量删除API
    const deletePromises = multipleSelection.value.map(user => 
      deleteAdminUser(user.id)
    )
    
    await Promise.all(deletePromises)
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSelectionChange = (selection: User[]) => {
  multipleSelection.value = selection
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const getRoleLabel = (role: string) => {
  const roleOption = roleOptions.value.find(r => r.value === role)
  return roleOption?.label || role
}

const getRoleTagType = (role: string) => {
  const types: Record<string, string> = {
    admin: 'danger',
    operator: 'warning',
    viewer: 'info'
  }
  return types[role] || ''
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '正常',
    inactive: '禁用',
    banned: '封禁'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'warning',
    banned: 'danger'
  }
  return types[status] || ''
}
</script>

<style scoped>
.admin-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.nickname {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.profile-info {
  margin: 20px 0;
}
</style>