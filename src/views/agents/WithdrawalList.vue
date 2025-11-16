<template>
  <div class="withdrawal-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>提现审核</span>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-form :model="queryParams" inline>
          <el-form-item label="代理商">
            <el-select
              v-model="queryParams.agent_id"
              filterable
              clearable
              placeholder="全部"
              style="width: 200px"
            >
              <el-option
                v-for="agent in agents"
                :key="agent.id"
                :label="`${agent.real_name} (${agent.agent_code})`"
                :value="agent.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="待审核" :value="0" />
              <el-option label="审核通过" :value="1" />
              <el-option label="处理中" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="已拒绝" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
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

      <!-- 统计信息 -->
      <div class="toolbar">
        <div class="stats-info">
          <el-tag>总计: {{ pagination.total }}</el-tag>
          <el-tag type="warning" class="ml-2">待审核: {{ stats.pending }}</el-tag>
          <el-tag type="info" class="ml-2">处理中: {{ stats.processing }}</el-tag>
          <el-tag type="success" class="ml-2">已完成: {{ stats.completed }}</el-tag>
          <el-tag type="danger" class="ml-2">已拒绝: {{ stats.rejected }}</el-tag>
        </div>
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
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="代理商" min-width="150">
          <template #default="{ row }">
            <div>{{ row.agent?.real_name }}</div>
            <div class="text-gray">{{ row.agent?.agent_code }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="120">
          <template #default="{ row }">
            <span class="money-text">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="100">
          <template #default="{ row }">
            <span class="text-gray">¥{{ row.fee.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actual_amount" label="实际到账" width="120">
          <template #default="{ row }">
            <span class="money-success">¥{{ row.actual_amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="收款信息" min-width="200">
          <template #default="{ row }">
            <div><strong>{{ row.bank_name }}</strong></div>
            <div class="text-gray">{{ row.bank_account }}</div>
            <div class="text-gray">{{ row.account_name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核信息" min-width="150">
          <template #default="{ row }">
            <div v-if="row.reviewed_at">
              <div class="text-gray">{{ formatTime(row.reviewed_at) }}</div>
              <div v-if="row.rejection_reason" class="text-danger">
                {{ row.rejection_reason }}
              </div>
            </div>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 0"
              link
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              审核通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              link
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button
              v-if="row.status === 1 || row.status === 2"
              link
              type="primary"
              size="small"
              @click="handleComplete(row)"
            >
              标记完成
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      :title="reviewMode === 'approve' ? '审核通过' : '拒绝提现'"
      width="500px"
    >
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="代理商">
          <div>{{ currentWithdrawal?.agent?.real_name }}</div>
        </el-form-item>
        <el-form-item label="提现金额">
          <span class="money-text">¥{{ currentWithdrawal?.amount.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item label="实际到账">
          <span class="money-success">¥{{ currentWithdrawal?.actual_amount.toFixed(2) }}</span>
        </el-form-item>
        <el-form-item
          :label="reviewMode === 'approve' ? '备注' : '拒绝原因'"
          :required="reviewMode === 'reject'"
        >
          <el-input
            v-model="reviewForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="reviewMode === 'approve' ? '可选' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button
          :type="reviewMode === 'approve' ? 'success' : 'danger'"
          @click="submitReview"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="提现详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="currentWithdrawal">
        <el-descriptions-item label="提现ID">
          {{ currentWithdrawal.id }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentWithdrawal.status)">
            {{ getStatusText(currentWithdrawal.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="代理商" :span="2">
          {{ currentWithdrawal.agent?.real_name }} ({{ currentWithdrawal.agent?.agent_code }})
        </el-descriptions-item>
        <el-descriptions-item label="提现金额">
          <span class="money-text">¥{{ currentWithdrawal.amount.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="手续费">
          ¥{{ currentWithdrawal.fee.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="实际到账" :span="2">
          <span class="money-success">¥{{ currentWithdrawal.actual_amount.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="银行名称">
          {{ currentWithdrawal.bank_name }}
        </el-descriptions-item>
        <el-descriptions-item label="账户名">
          {{ currentWithdrawal.account_name }}
        </el-descriptions-item>
        <el-descriptions-item label="银行账号" :span="2">
          {{ currentWithdrawal.bank_account }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">
          {{ formatTime(currentWithdrawal.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="审核时间" :span="2" v-if="currentWithdrawal.reviewed_at">
          {{ formatTime(currentWithdrawal.reviewed_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间" :span="2" v-if="currentWithdrawal.completed_at">
          {{ formatTime(currentWithdrawal.completed_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="拒绝原因" :span="2" v-if="currentWithdrawal.rejection_reason">
          <span class="text-danger">{{ currentWithdrawal.rejection_reason }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2" v-if="currentWithdrawal.remark">
          {{ currentWithdrawal.remark }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { Withdrawal, Agent } from '@/types'
import {
  getWithdrawalList,
  approveWithdrawal,
  rejectWithdrawal,
  completeWithdrawal,
  getAgentList
} from '@/api/agent'

// 查询参数
const queryParams = reactive({
  agent_id: undefined as number | undefined,
  status: undefined as number | undefined,
  start_date: '',
  end_date: '',
  page: 1,
  page_size: 20
})

const dateRange = ref<[string, string] | null>(null)

// 监听日期范围变化
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    queryParams.start_date = val[0]
    queryParams.end_date = val[1]
  } else {
    queryParams.start_date = ''
    queryParams.end_date = ''
  }
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  pending: 0,
  processing: 0,
  completed: 0,
  rejected: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<Withdrawal[]>([])
const agents = ref<Agent[]>([])

// 审核对话框
const reviewDialogVisible = ref(false)
const reviewMode = ref<'approve' | 'reject'>('approve')
const currentWithdrawal = ref<Withdrawal | null>(null)
const reviewForm = reactive({
  remark: ''
})

// 详情对话框
const detailDialogVisible = ref(false)

// 获取提现列表
const fetchWithdrawalList = async () => {
  loading.value = true
  try {
    const response = await getWithdrawalList({
      ...queryParams,
      page: pagination.page,
      page_size: pagination.pageSize
    })

    if (response.data) {
      tableData.value = response.data.data || []
      pagination.total = response.data.pagination?.total || 0

      // 计算统计数据
      stats.pending = tableData.value.filter(w => w.status === 0).length
      stats.processing = tableData.value.filter(w => w.status === 1 || w.status === 2).length
      stats.completed = tableData.value.filter(w => w.status === 3).length
      stats.rejected = tableData.value.filter(w => w.status === 4).length
    }
  } catch (error) {
    ElMessage.error('获取提现列表失败')
  } finally {
    loading.value = false
  }
}

// 获取代理商列表
const fetchAgents = async () => {
  try {
    const response = await getAgentList({ status: 1, page: 1, page_size: 1000 })
    if (response.data) {
      agents.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取代理商列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchWithdrawalList()
}

// 重置
const handleReset = () => {
  queryParams.agent_id = undefined
  queryParams.status = undefined
  queryParams.start_date = ''
  queryParams.end_date = ''
  dateRange.value = null
  pagination.page = 1
  fetchWithdrawalList()
}

// 刷新
const handleRefresh = () => {
  fetchWithdrawalList()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchWithdrawalList()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchWithdrawalList()
}

// 审核通过
const handleApprove = (row: Withdrawal) => {
  currentWithdrawal.value = row
  reviewMode.value = 'approve'
  reviewForm.remark = ''
  reviewDialogVisible.value = true
}

// 拒绝
const handleReject = (row: Withdrawal) => {
  currentWithdrawal.value = row
  reviewMode.value = 'reject'
  reviewForm.remark = ''
  reviewDialogVisible.value = true
}

// 提交审核
const submitReview = async () => {
  if (!currentWithdrawal.value) return

  if (reviewMode.value === 'reject' && !reviewForm.remark) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    if (reviewMode.value === 'approve') {
      await approveWithdrawal(currentWithdrawal.value.id, reviewForm.remark)
      ElMessage.success('审核通过')
    } else {
      await rejectWithdrawal(currentWithdrawal.value.id, reviewForm.remark)
      ElMessage.success('已拒绝')
    }

    reviewDialogVisible.value = false
    fetchWithdrawalList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 标记完成
const handleComplete = (row: Withdrawal) => {
  ElMessageBox.confirm(
    `确定要将此提现标记为已完成吗？<br>实际到账金额: <strong style="color: #67C23A;">¥${row.actual_amount.toFixed(2)}</strong>`,
    '确认完成',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    try {
      await completeWithdrawal(row.id)
      ElMessage.success('标记完成成功')
      fetchWithdrawalList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// 查看详情
const handleViewDetail = (row: Withdrawal) => {
  currentWithdrawal.value = row
  detailDialogVisible.value = true
}

// 工具函数
const getStatusType = (status: number) => {
  const types = ['warning', 'primary', 'info', 'success', 'danger']
  return types[status] || ''
}

const getStatusText = (status: number) => {
  const texts = ['待审核', '审核通过', '处理中', '已完成', '已拒绝']
  return texts[status] || ''
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchWithdrawalList()
  fetchAgents()
})
</script>

<style scoped lang="scss">
.withdrawal-list-container {
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

.stats-info {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.money-text {
  color: #f56c6c;
  font-weight: bold;
}

.money-success {
  color: #67c23a;
  font-weight: bold;
}

.text-gray {
  color: #909399;
  font-size: 12px;
}

.text-danger {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.ml-2 {
  margin-left: 8px;
}
</style>
