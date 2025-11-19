<template>
  <div class="recharge-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>充值管理</span>
          <el-button
            type="primary"
            @click="handleAddRecharge"
            v-if="$checkPermission(['admin'])"
          >
            新增充值
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-form :model="queryParams" inline>
          <el-form-item label="搜索">
            <el-input
              v-model="queryParams.search"
              placeholder="用户名/邮箱"
              style="width: 200px"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已失败" value="failed" />
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

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" min-width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :src="row.avatar">
                {{ row.username.charAt(0) }}
              </el-avatar>
              <div>{{ row.username }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="充值金额" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="{ row }">
            <el-tag :type="getPaymentTagType(row.paymentMethod)">
              {{ getPaymentLabel(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ $formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending' && $checkPermission(['admin'])"
              type="success"
              link
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending' && $checkPermission(['admin'])"
              type="danger"
              link
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
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

    <!-- 充值对话框 -->
    <RechargeForm
      v-model="rechargeDialogVisible"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatCurrency } from '@/utils'
import RechargeForm from './RechargeForm.vue'

interface Recharge {
  id: number
  username: string
  avatar?: string
  amount: number
  paymentMethod: 'alipay' | 'wechat' | 'bank'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

interface ListQuery {
  page: number
  pageSize: number
  search: string
  status: string
}

const loading = ref(false)
const tableData = ref<Recharge[]>([])
const total = ref(0)
const rechargeDialogVisible = ref(false)

const queryParams = reactive<ListQuery>({
  page: 1,
  pageSize: 20,
  search: '',
  status: ''
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    // TODO: 调用 API 获取充值列表
    // const res = await getRechargeList(queryParams)
    // tableData.value = res.data.items
    // total.value = res.data.total
    tableData.value = []
    total.value = 0
  } catch (error) {
    ElMessage.error('获取充值列表失败')
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
    status: ''
  })
  fetchData()
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

const handleAddRecharge = () => {
  rechargeDialogVisible.value = true
}

const handleRechargeSuccess = () => {
  fetchData()
}

const handleApprove = async (row: Recharge) => {
  try {
    await ElMessageBox.confirm(
      `确定要通过此充值申请吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    // TODO: 调用 API 通过充值申请
    ElMessage.success('通过成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = async (row: Recharge) => {
  try {
    await ElMessageBox.confirm(
      `确定要拒绝此充值申请吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    // TODO: 调用 API 拒绝充值申请
    ElMessage.success('拒绝成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const getPaymentLabel = (method: string) => {
  const labels: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行卡'
  }
  return labels[method] || method
}

const getPaymentTagType = (method: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    alipay: 'info',
    wechat: 'success',
    bank: 'warning'
  }
  return types[method] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    failed: '已失败'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}
</script>

<style scoped>
.recharge-list-container {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
