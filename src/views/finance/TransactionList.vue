<template>
  <div class="transaction-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>交易记录</h2>
        <p>管理所有用户的充值、消费、提现等交易记录</p>
      </div>
      <div class="page-actions">
        <el-dropdown @command="handleQuickAction">
          <el-button type="primary">
            快速操作
            <el-icon class="el-icon--right">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="recharge">处理充值</el-dropdown-item>
              <el-dropdown-item command="withdraw">处理提现</el-dropdown-item>
              <el-dropdown-item command="export">导出数据</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-grid">
        <StatsCard
          title="总交易额"
          :value="formatCurrency(stats.totalAmount)"
          icon="Money"
          color="#409eff"
          :trend="stats.amountGrowth > 0 ? `+${stats.amountGrowth.toFixed(1)}%` : `${stats.amountGrowth.toFixed(1)}%`"
          :trend-type="stats.amountGrowth > 0 ? 'up' : 'down'"
        />
        <StatsCard
          title="今日交易"
          :value="formatCurrency(stats.todayAmount)"
          icon="Calendar"
          color="#67c23a"
        />
        <StatsCard
          title="待处理"
          :value="stats.pendingCount"
          icon="Clock"
          color="#e6a23c"
        />
        <StatsCard
          title="交易笔数"
          :value="stats.totalTransactions"
          icon="DocumentCopy"
          color="#909399"
        />
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filters">
      <el-card>
        <div class="filter-row">
          <div class="filter-item">
            <label>用户搜索:</label>
            <el-input
              v-model="searchForm.search"
              placeholder="用户名、手机号或邮箱"
              :prefix-icon="Search"
              clearable
              style="width: 250px"
            />
          </div>
          <div class="filter-item">
            <label>交易类型:</label>
            <el-select
              v-model="searchForm.type"
              placeholder="选择类型"
              clearable
              style="width: 130px"
            >
              <el-option label="充值" value="recharge" />
              <el-option label="消费" value="consume" />
              <el-option label="退款" value="refund" />
              <el-option label="提现" value="withdraw" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>状态:</label>
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="待处理" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已失败" value="failed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>时间范围:</label>
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </div>
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleReset">
              重置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <div class="table-info">
          <span>共找到 {{ pagination.total }} 条记录</span>
        </div>
        <div class="table-actions">
          <el-button
            type="success"
            :icon="Check"
            :disabled="selectedIds.length === 0"
            @click="handleBatchApprove"
          >
            批量通过 ({{ selectedIds.length }})
          </el-button>
          <el-button
            type="danger"
            :icon="Close"
            :disabled="selectedIds.length === 0"
            @click="handleBatchReject"
          >
            批量拒绝 ({{ selectedIds.length }})
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="交易ID" width="100" sortable="custom" />
        <el-table-column prop="user.username" label="用户" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user.avatar">
                {{ row.user.username.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <div class="username">{{ row.user.username }}</div>
                <div class="user-email">{{ row.user.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" sortable="custom">
          <template #default="{ row }">
            <span :class="getAmountClass(row.type)">
              {{ formatAmount(row.amount, row.type) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="120">
          <template #default="{ row }">
            {{ formatCurrency(row.balance) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="{ row }">
            <span v-if="row.paymentMethod">
              {{ getPaymentMethodLabel(row.paymentMethod) }}
            </span>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-tooltip content="查看详情">
                <el-button
                  type="info"
                  :icon="View"
                  size="small"
                  text
                  @click="viewDetails(row)"
                />
              </el-tooltip>
              <template v-if="row.status === 'pending'">
                <el-tooltip content="通过">
                  <el-button
                    type="success"
                    :icon="Check"
                    size="small"
                    text
                    @click="handleApprove(row.id)"
                  />
                </el-tooltip>
                <el-tooltip content="拒绝">
                  <el-button
                    type="danger"
                    :icon="Close"
                    size="small"
                    text
                    @click="handleReject(row.id)"
                  />
                </el-tooltip>
              </template>
              <el-tooltip content="查看用户">
                <el-button
                  type="primary"
                  :icon="User"
                  size="small"
                  text
                  @click="viewUser(row.user.id)"
                />
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="交易详情"
      width="600px"
    >
      <div v-if="selectedTransaction" class="transaction-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="交易ID">
            {{ selectedTransaction.id }}
          </el-descriptions-item>
          <el-descriptions-item label="订单ID">
            {{ selectedTransaction.orderId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedTransaction.user.username }}
          </el-descriptions-item>
          <el-descriptions-item label="用户邮箱">
            {{ selectedTransaction.user.email }}
          </el-descriptions-item>
          <el-descriptions-item label="交易类型">
            <el-tag :type="getTypeTagType(selectedTransaction.type)">
              {{ getTypeLabel(selectedTransaction.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="交易状态">
            <el-tag :type="getStatusTagType(selectedTransaction.status)">
              {{ getStatusLabel(selectedTransaction.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="交易金额">
            <span :class="getAmountClass(selectedTransaction.type)">
              {{ formatAmount(selectedTransaction.amount, selectedTransaction.type) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="账户余额">
            {{ formatCurrency(selectedTransaction.balance) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ selectedTransaction.paymentMethod ? getPaymentMethodLabel(selectedTransaction.paymentMethod) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedTransaction.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(selectedTransaction.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" span="2">
            {{ selectedTransaction.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 如果是待处理状态，显示审核操作 -->
        <div v-if="selectedTransaction.status === 'pending'" class="review-actions">
          <el-divider />
          <div class="review-form">
            <el-form :model="reviewForm" label-width="80px">
              <el-form-item label="审核备注">
                <el-input
                  v-model="reviewForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入审核备注"
                />
              </el-form-item>
            </el-form>
            <div class="review-buttons">
              <el-button
                type="success"
                :loading="reviewLoading"
                @click="handleReview('completed')"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                :loading="reviewLoading"
                @click="handleReview('failed')"
              >
                拒绝
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 充值表单对话框 -->
    <RechargeForm
      v-model="showRechargeDialog"
      @success="handleTransactionSuccess"
    />

    <!-- 提现表单对话框 -->
    <WithdrawForm
      v-model="showWithdrawDialog"
      @success="handleTransactionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElMessage,
  ElMessageBox
} from 'element-plus'
import {
  Search,
  Refresh,
  Check,
  Close,
  View,
  User,
  ArrowDown
} from '@element-plus/icons-vue'
import StatsCard from '@/components/charts/StatsCard.vue'
import RechargeForm from './RechargeForm.vue'
import WithdrawForm from './WithdrawForm.vue'
import {
  getTransactions,
  getTransaction,
  reviewTransaction,
  batchReviewTransactions,
  getFinanceStats
} from '@/api/finance'
import type { Transaction, ListQuery } from '@/types'
import { formatDateTime, formatCurrency } from '@/utils'

// 响应式数据
const loading = ref(false)
const reviewLoading = ref(false)
const showDetailsDialog = ref(false)
const showRechargeDialog = ref(false)
const showWithdrawDialog = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const selectedIds = ref<number[]>([])

// 统计数据
const stats = reactive({
  totalAmount: 0,
  todayAmount: 0,
  pendingCount: 0,
  totalTransactions: 0,
  amountGrowth: 0
})

// 搜索表单
const searchForm = reactive({
  search: '',
  type: '',
  status: '',
  dateRange: null as [string, string] | null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref<Transaction[]>([])

// 排序
const sortConfig = reactive({
  prop: '',
  order: ''
})

// 审核表单
const reviewForm = reactive({
  remark: ''
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const { data } = await getFinanceStats()
    Object.assign(stats, {
      totalAmount: data.overview.totalAmount,
      todayAmount: data.overview.todayAmount,
      pendingCount: data.overview.pendingAmount,
      totalTransactions: data.overview.totalTransactions,
      amountGrowth: ((data.overview.todayAmount - data.overview.monthAmount) / data.overview.monthAmount) * 100 || 0
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: ListQuery & any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchForm.search || undefined,
      type: searchForm.type || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      sortBy: sortConfig.prop || undefined,
      sortOrder: sortConfig.order || undefined
    }

    const { data } = await getTransactions(params)
    tableData.value = data.items
    pagination.total = data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    search: '',
    type: '',
    status: '',
    dateRange: null
  })
  pagination.page = 1
  fetchData()
}

// 分页变化
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

// 排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortConfig.prop = prop
  sortConfig.order = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : ''
  fetchData()
}

// 选择变化
const handleSelectionChange = (selection: Transaction[]) => {
  selectedIds.value = selection
    .filter(item => item.status === 'pending')
    .map(item => item.id)
}

// 快速操作
const handleQuickAction = (command: string) => {
  switch (command) {
    case 'recharge':
      showRechargeDialog.value = true
      break
    case 'withdraw':
      showWithdrawDialog.value = true
      break
    case 'export':
      handleExport()
      break
  }
}

// 查看详情
const viewDetails = async (transaction: Transaction) => {
  try {
    const { data } = await getTransaction(transaction.id)
    selectedTransaction.value = data
    reviewForm.remark = ''
    showDetailsDialog.value = true
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看用户
const viewUser = (userId: number) => {
  // 跳转到用户详情页
  window.open(`/admin/customers/${userId}`, '_blank')
}

// 审核
const handleReview = async (status: 'completed' | 'failed') => {
  if (!selectedTransaction.value) return
  
  try {
    reviewLoading.value = true
    await reviewTransaction(selectedTransaction.value.id, {
      status,
      remark: reviewForm.remark
    })
    
    ElMessage.success('审核成功')
    showDetailsDialog.value = false
    fetchData()
    fetchStats()
  } catch (error) {
    ElMessage.error('审核失败')
  } finally {
    reviewLoading.value = false
  }
}

// 单个通过
const handleApprove = async (id: number) => {
  try {
    await reviewTransaction(id, { status: 'completed' })
    ElMessage.success('审核通过')
    fetchData()
    fetchStats()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 单个拒绝
const handleReject = async (id: number) => {
  try {
    await ElMessageBox.prompt('请输入拒绝理由', '拒绝交易', {
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝理由'
    })
    
    await reviewTransaction(id, { 
      status: 'failed', 
      remark: '理由' 
    })
    ElMessage.success('已拒绝')
    fetchData()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    await batchReviewTransactions({
      ids: selectedIds.value,
      status: 'completed'
    })
    ElMessage.success('批量审核通过')
    selectedIds.value = []
    fetchData()
    fetchStats()
  } catch (error) {
    ElMessage.error('批量操作失败')
  }
}

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedIds.value.length === 0) return
  
  try {
    const { value: remark } = await ElMessageBox.prompt(
      '请输入批量拒绝理由',
      '批量拒绝交易',
      {
        inputPattern: /.+/,
        inputErrorMessage: '请输入拒绝理由'
      }
    )
    
    await batchReviewTransactions({
      ids: selectedIds.value,
      status: 'failed',
      remark
    })
    ElMessage.success('批量拒绝成功')
    selectedIds.value = []
    fetchData()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    ElMessage.info('导出功能开发中...')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 交易成功回调
const handleTransactionSuccess = () => {
  fetchData()
  fetchStats()
}

// 工具函数
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    refund: '退款',
    withdraw: '提现'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    recharge: 'success',
    consume: 'warning',
    refund: 'info',
    withdraw: 'danger'
  }
  return types[type] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    failed: '已失败',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return types[status] || 'info'
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信',
    bank: '银行卡'
  }
  return labels[method] || method
}

const getAmountClass = (type: string) => {
  return type === 'recharge' || type === 'refund' ? 'amount-income' : 'amount-expense'
}

const formatAmount = (amount: number, type: string) => {
  const sign = (type === 'recharge' || type === 'refund') ? '+' : '-'
  return `${sign}${formatCurrency(Math.abs(amount))}`
}

// 生命周期
onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style lang="scss" scoped>
.transaction-list {
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;

    .page-title {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
      }

      p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
  }

  .search-filters {
    margin-bottom: 24px;

    .filter-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-size: 14px;
          color: #374151;
          white-space: nowrap;
        }
      }

      .filter-actions {
        margin-left: auto;
        display: flex;
        gap: 12px;
      }
    }
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .table-info {
        color: #6b7280;
        font-size: 14px;
      }

      .table-actions {
        display: flex;
        gap: 12px;
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-details {
      .username {
        font-weight: 500;
        color: #374151;
      }

      .user-email {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .amount-income {
    color: #67c23a;
    font-weight: 500;
  }

  .amount-expense {
    color: #f56c6c;
    font-weight: 500;
  }

  .text-gray {
    color: #9ca3af;
  }

  .transaction-details {
    .review-actions {
      margin-top: 20px;

      .review-form {
        .review-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .transaction-list {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .filter-row {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .filter-item {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
      }

      .filter-actions {
        margin-left: 0;
        justify-content: center;
      }
    }

    .table-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .table-actions {
        justify-content: center;
      }
    }

    .user-info {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }
  }
}
</style>