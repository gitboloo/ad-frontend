<template>
  <div class="customer-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="$checkPermission(['admin', 'operator'])"
          >
            新建客户
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-form :model="queryParams" inline>
          <el-form-item label="搜索">
            <el-input
              v-model="queryParams.search"
              placeholder="用户名/邮箱/手机号"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="客户等级">
            <el-select
              v-model="queryParams.level"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="青铜" value="bronze" />
              <el-option label="白银" value="silver" />
              <el-option label="黄金" value="gold" />
              <el-option label="钻石" value="diamond" />
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
                :src="row.profile?.avatar"
                :alt="row.username"
              >
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="username">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="company" label="公司" width="120" />
        <el-table-column prop="level" label="等级" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getLevelTagType(row.level)"
              size="small"
            >
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100">
          <template #default="{ row }">
            <span class="balance">¥{{ row.balance?.toFixed(2) || '0.00' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalSpent" label="总消费" width="100">
          <template #default="{ row }">
            <span class="spent">¥{{ row.totalSpent?.toFixed(2) || '0.00' }}</span>
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
        <el-table-column prop="registeredAt" label="注册时间" width="110">
          <template #default="{ row }">
            {{ $formatDate(row.registeredAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveAt" label="最后活跃" width="110">
          <template #default="{ row }">
            {{ row.lastActiveAt ? $formatDate(row.lastActiveAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
              v-if="$checkPermission(['admin', 'operator'])"
            >
              编辑
            </el-button>
            <el-dropdown
              trigger="click"
              @command="(command) => handleCommand(command, row)"
            >
              <el-button type="primary" link>
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    command="toggleStatus"
                    :disabled="!$checkPermission(['admin', 'operator'])"
                  >
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="resetPassword"
                    :disabled="!$checkPermission(['admin', 'operator'])"
                  >
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="adjustBalance"
                    :disabled="!$checkPermission(['admin', 'operator'])"
                  >
                    调整余额
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="delete"
                    divided
                    :disabled="!$checkPermission(['admin'])"
                  >
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

    <!-- 余额调整对话框 -->
    <el-dialog
      v-model="balanceDialogVisible"
      title="调整余额"
      width="400px"
    >
      <el-form
        ref="balanceFormRef"
        :model="balanceForm"
        :rules="balanceRules"
        label-width="80px"
      >
        <el-form-item label="调整金额" prop="amount">
          <el-input
            v-model.number="balanceForm.amount"
            placeholder="正数为增加，负数为减少"
            type="number"
            step="0.01"
          >
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input
            v-model="balanceForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="balanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBalanceSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue'
import {
  getCustomers,
  deleteCustomer,
  batchDeleteCustomers,
  updateCustomerStatus,
  resetCustomerPassword,
  adjustCustomerBalance
} from '@/api/customers'
import type { Customer, ListQuery } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const tableData = ref<Customer[]>([])
const multipleSelection = ref<Customer[]>([])
const total = ref(0)
const balanceDialogVisible = ref(false)
const balanceFormRef = ref<FormInstance>()
const currentCustomer = ref<Customer | null>(null)

const queryParams = reactive<ListQuery & { level?: string; status?: string }>({
  page: 1,
  pageSize: 20,
  search: '',
  level: '',
  status: ''
})

const balanceForm = reactive({
  amount: 0,
  reason: ''
})

const balanceRules: FormRules = {
  amount: [
    { required: true, message: '请输入调整金额', trigger: 'blur' },
    { type: 'number', message: '请输入有效的数字', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入调整原因', trigger: 'blur' },
    { min: 2, max: 200, message: '原因长度为2-200个字符', trigger: 'blur' }
  ]
}

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCustomers(queryParams)
    tableData.value = res.data.items
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取客户列表失败')
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
    level: '',
    status: ''
  })
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

const handleCreate = () => {
  router.push('/customers/create')
}

const handleView = (row: Customer) => {
  router.push(`/customers/${row.id}`)
}

const handleEdit = (row: Customer) => {
  router.push(`/customers/${row.id}/edit`)
}

const handleCommand = async (command: string, row: Customer) => {
  switch (command) {
    case 'toggleStatus':
      await handleToggleStatus(row)
      break
    case 'resetPassword':
      await handleResetPassword(row)
      break
    case 'adjustBalance':
      handleAdjustBalance(row)
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

const handleToggleStatus = async (row: Customer) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    const action = newStatus === 'active' ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${action}客户 ${row.username} 吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await updateCustomerStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleResetPassword = async (row: Customer) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置客户 ${row.username} 的密码吗？系统将发送新密码到客户邮箱。`,
      '确认重置密码',
      { type: 'warning' }
    )
    
    await resetCustomerPassword(row.id)
    ElMessage.success('密码重置成功，新密码已发送到客户邮箱')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
    }
  }
}

const handleAdjustBalance = (row: Customer) => {
  currentCustomer.value = row
  balanceForm.amount = 0
  balanceForm.reason = ''
  balanceDialogVisible.value = true
}

const handleBalanceSubmit = async () => {
  if (!balanceFormRef.value || !currentCustomer.value) return
  
  await balanceFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      await adjustCustomerBalance(currentCustomer.value!.id, balanceForm)
      ElMessage.success('余额调整成功')
      balanceDialogVisible.value = false
      fetchData()
    } catch (error) {
      ElMessage.error('余额调整失败')
    }
  })
}

const handleDelete = async (row: Customer) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除客户 ${row.username} 吗？此操作不可恢复。`,
      '确认删除',
      { type: 'warning' }
    )
    
    await deleteCustomer(row.id)
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
      `确定要删除选中的 ${multipleSelection.value.length} 个客户吗？此操作不可恢复。`,
      '确认批量删除',
      { type: 'warning' }
    )
    
    const ids = multipleSelection.value.map(item => item.id)
    await batchDeleteCustomers(ids)
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSelectionChange = (selection: Customer[]) => {
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

const getLevelLabel = (level: string) => {
  const labels: Record<string, string> = {
    bronze: '青铜',
    silver: '白银',
    gold: '黄金',
    diamond: '钻石'
  }
  return labels[level] || level
}

const getLevelTagType = (level: string) => {
  const types: Record<string, string> = {
    bronze: '',
    silver: 'info',
    gold: 'warning',
    diamond: 'success'
  }
  return types[level] || ''
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
.customer-list-container {
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
  gap: 8px;
}

.username {
  font-weight: 500;
}

.balance, .spent {
  font-weight: 600;
  color: var(--el-color-success);
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>