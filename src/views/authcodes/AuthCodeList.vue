<template>
  <div class="authcode-list">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>授权码管理</h2>
        <p>管理系统授权码的生成、分发和使用</p>
      </div>
      <div class="page-actions">
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="showGenerateDialog = true"
        >
          生成授权码
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stats-grid">
        <StatsCard
          title="总授权码"
          :value="stats.total"
          icon="DocumentCopy"
          color="#409eff"
        />
        <StatsCard
          title="活跃授权码"
          :value="stats.active"
          icon="CircleCheck"
          color="#67c23a"
        />
        <StatsCard
          title="已使用"
          :value="stats.used"
          icon="Select"
          color="#e6a23c"
        />
        <StatsCard
          title="已过期"
          :value="stats.expired"
          icon="CircleClose"
          color="#f56c6c"
        />
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filters">
      <el-card>
        <div class="filter-row">
          <div class="filter-item">
            <label>搜索授权码:</label>
            <el-input
              v-model="searchForm.search"
              placeholder="输入授权码或描述"
              :prefix-icon="Search"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
              style="width: 300px"
            />
          </div>
          <div class="filter-item">
            <label>类型:</label>
            <el-select
              v-model="searchForm.type"
              placeholder="选择类型"
              clearable
              style="width: 150px"
            >
              <el-option label="试用版" value="trial" />
              <el-option label="专业版" value="premium" />
              <el-option label="企业版" value="enterprise" />
            </el-select>
          </div>
          <div class="filter-item">
            <label>状态:</label>
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              clearable
              style="width: 150px"
            >
              <el-option label="活跃" value="active" />
              <el-option label="已使用" value="used" />
              <el-option label="已过期" value="expired" />
              <el-option label="已禁用" value="disabled" />
            </el-select>
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
        <div class="table-actions">
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedIds.length }})
          </el-button>
          <el-button
            :icon="Download"
            @click="handleExport"
          >
            导出数据
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
        <el-table-column
          prop="code"
          label="授权码"
          width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-text class="authcode-text" @click="copyToClipboard(row.code)">
              {{ row.code }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" width="80">
          <template #default="{ row }">
            {{ row.duration }}天
          </template>
        </el-table-column>
        <el-table-column prop="maxUsers" label="用户数限制" width="100">
          <template #default="{ row }">
            {{ row.maxUsers || '无限制' }}
          </template>
        </el-table-column>
        <el-table-column prop="features" label="功能特性" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="feature in row.features.slice(0, 3)"
              :key="feature"
              size="small"
              class="feature-tag"
            >
              {{ feature }}
            </el-tag>
            <el-tag v-if="row.features.length > 3" size="small" type="info">
              +{{ row.features.length - 3 }}
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
        <el-table-column prop="usedAt" label="使用时间" width="180">
          <template #default="{ row }">
            {{ row.usedAt ? formatDateTime(row.usedAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="expiresAt" label="过期时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.expiresAt) }}
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
              <el-tooltip content="复制授权码">
                <el-button
                  type="primary"
                  :icon="CopyDocument"
                  size="small"
                  text
                  @click="copyToClipboard(row.code)"
                />
              </el-tooltip>
              <el-tooltip content="查看详情">
                <el-button
                  type="info"
                  :icon="View"
                  size="small"
                  text
                  @click="viewDetails(row)"
                />
              </el-tooltip>
              <el-tooltip content="切换状态">
                <el-button
                  :type="row.status === 'active' ? 'warning' : 'success'"
                  :icon="row.status === 'active' ? 'Lock' : 'Unlock'"
                  size="small"
                  text
                  :disabled="row.status === 'used'"
                  @click="toggleStatus(row)"
                />
              </el-tooltip>
              <el-tooltip content="删除">
                <el-button
                  type="danger"
                  :icon="Delete"
                  size="small"
                  text
                  @click="handleDelete(row.id)"
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

    <!-- 生成授权码对话框 -->
    <AuthCodeGenerate
      v-model="showGenerateDialog"
      @success="handleGenerateSuccess"
    />

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="授权码详情"
      width="600px"
    >
      <div v-if="selectedAuthCode" class="details-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="授权码">
            <el-text class="authcode-text" @click="copyToClipboard(selectedAuthCode.code)">
              {{ selectedAuthCode.code }}
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTagType(selectedAuthCode.type)">
              {{ getTypeLabel(selectedAuthCode.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedAuthCode.status)">
              {{ getStatusLabel(selectedAuthCode.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="有效期">
            {{ selectedAuthCode.duration }}天
          </el-descriptions-item>
          <el-descriptions-item label="用户数限制">
            {{ selectedAuthCode.maxUsers || '无限制' }}
          </el-descriptions-item>
          <el-descriptions-item label="使用时间">
            {{ selectedAuthCode.usedAt ? formatDateTime(selectedAuthCode.usedAt) : '未使用' }}
          </el-descriptions-item>
          <el-descriptions-item label="过期时间">
            {{ formatDateTime(selectedAuthCode.expiresAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(selectedAuthCode.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="features-section">
          <h4>功能特性</h4>
          <div class="features-list">
            <el-tag
              v-for="feature in selectedAuthCode.features"
              :key="feature"
              class="feature-tag"
            >
              {{ feature }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type TableColumnCtx
} from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  Delete,
  Download,
  CopyDocument,
  View
} from '@element-plus/icons-vue'
import StatsCard from '@/components/charts/StatsCard.vue'
import AuthCodeGenerate from './AuthCodeGenerate.vue'
import {
  getAuthCodes,
  deleteAuthCode,
  batchDeleteAuthCodes,
  updateAuthCodeStatus,
  getAuthCodeStats,
  exportAuthCodes
} from '@/api/authcodes'
import type { AuthCode, ListQuery } from '@/types'
import { formatDateTime } from '@/utils'

// 响应式数据
const loading = ref(false)
const showGenerateDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedAuthCode = ref<AuthCode | null>(null)
const selectedIds = ref<number[]>([])

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  used: 0,
  expired: 0
})

// 搜索表单
const searchForm = reactive({
  search: '',
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const tableData = ref<AuthCode[]>([])

// 排序
const sortConfig = reactive({
  prop: '',
  order: ''
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const { data } = await getAuthCodeStats()
    Object.assign(stats, data)
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
      sortBy: sortConfig.prop || undefined,
      sortOrder: sortConfig.order || undefined
    }

    const { data } = await getAuthCodes(params)
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
    status: ''
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
const handleSelectionChange = (selection: AuthCode[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 查看详情
const viewDetails = (authCode: AuthCode) => {
  selectedAuthCode.value = authCode
  showDetailsDialog.value = true
}

// 切换状态
const toggleStatus = async (authCode: AuthCode) => {
  try {
    const newStatus = authCode.status === 'active' ? 'disabled' : 'active'
    await updateAuthCodeStatus(authCode.id, newStatus)
    ElMessage.success('状态更新成功')
    fetchData()
  } catch (error) {
    ElMessage.error('状态更新失败')
  }
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个授权码吗？', '确认删除', {
      type: 'warning'
    })
    
    await deleteAuthCode(id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的授权码')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个授权码吗？`,
      '确认批量删除',
      { type: 'warning' }
    )
    
    await batchDeleteAuthCodes(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    fetchData()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    loading.value = true
    const response = await exportAuthCodes({
      type: searchForm.type || undefined,
      status: searchForm.status || undefined
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `授权码数据_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

// 生成成功回调
const handleGenerateSuccess = () => {
  fetchData()
  fetchStats()
}

// 工具函数
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    trial: '试用版',
    premium: '专业版',
    enterprise: '企业版'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    trial: 'info',
    premium: 'success',
    enterprise: 'warning'
  }
  return types[type] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '活跃',
    used: '已使用',
    expired: '已过期',
    disabled: '已禁用'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    used: 'warning',
    expired: 'info',
    disabled: 'danger'
  }
  return types[status] || 'info'
}

// 生命周期
onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style lang="scss" scoped>
.authcode-list {
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

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .authcode-text {
    font-family: 'Monaco', 'Menlo', monospace;
    cursor: pointer;
    color: #409eff;

    &:hover {
      text-decoration: underline;
    }
  }

  .feature-tag {
    margin-right: 4px;
    margin-bottom: 4px;
  }

  .details-content {
    .features-section {
      margin-top: 20px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #374151;
      }

      .features-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .authcode-list {
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
  }
}
</style>