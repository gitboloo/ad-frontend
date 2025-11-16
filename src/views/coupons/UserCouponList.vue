<template>
  <div class="user-coupon-list">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">用户优惠券管理</h1>
        <p class="page-description">管理用户拥有的优惠券</p>
        <div class="page-actions">
          <el-button type="primary" @click="batchAssignVisible = true">
            <el-icon><Gift /></el-icon>
            批量分配
          </el-button>
        </div>
      </div>
      
      <el-card>
        <!-- 搜索和筛选 -->
        <div class="search-container">
          <el-form :model="searchForm" inline>
            <el-form-item label="用户">
              <el-select
                v-model="searchForm.userId"
                placeholder="选择用户"
                style="width: 200px"
                filterable
                remote
                :remote-method="searchUsers"
                :loading="userSearchLoading"
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="`${user.username} (${user.email})`"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="优惠券">
              <el-select
                v-model="searchForm.couponId"
                placeholder="选择优惠券"
                style="width: 200px"
                filterable
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="coupon in couponOptions"
                  :key="coupon.id"
                  :label="coupon.name"
                  :value="coupon.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="选择状态"
                style="width: 120px"
                clearable
                @change="handleSearch"
              >
                <el-option label="未使用" value="unused" />
                <el-option label="已使用" value="used" />
                <el-option label="已过期" value="expired" />
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

        <!-- 数据表格 -->
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="user.username" label="用户名" width="120" />
          <el-table-column prop="user.email" label="用户邮箱" width="180" />
          <el-table-column prop="coupon.name" label="优惠券名称" min-width="150" />
          <el-table-column prop="coupon.code" label="优惠券代码" width="120" />
          <el-table-column prop="coupon.type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.coupon.type === 'fixed' ? 'success' : 'info'">
                {{ row.coupon.type === 'fixed' ? '固定金额' : '百分比' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="coupon.value" label="优惠值" width="100">
            <template #default="{ row }">
              {{ row.coupon.type === 'fixed' ? `¥${row.coupon.value}` : `${row.coupon.value}%` }}
            </template>
          </el-table-column>
          <el-table-column prop="coupon.validFrom" label="有效期" width="200">
            <template #default="{ row }">
              {{ formatDateRange(row.coupon.validFrom, row.coupon.validTo) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getUserCouponStatusConfig(row.status).type">
                {{ getUserCouponStatusConfig(row.status).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="usedAt" label="使用时间" width="160">
            <template #default="{ row }">
              {{ row.usedAt ? formatDate(row.usedAt) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="分配时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-popconfirm
                title="确定要撤销这个用户优惠券吗？"
                @confirm="revokeCoupon(row)"
                v-if="row.status === 'unused'"
              >
                <template #reference>
                  <el-button size="small" link type="danger">撤销</el-button>
                </template>
              </el-popconfirm>
              <span v-else class="text-gray-400">无可用操作</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 批量操作栏 -->
        <div v-if="selectedItems.length > 0" class="batch-actions">
          <el-alert
            :title="`已选择 ${selectedItems.length} 项`"
            type="info"
            :closable="false"
            show-icon
          />
          <div class="batch-buttons">
            <el-popconfirm
              title="确定要批量撤销选中的用户优惠券吗？"
              @confirm="batchRevoke"
            >
              <template #reference>
                <el-button type="danger" size="small">批量撤销</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 批量分配对话框 -->
    <el-dialog v-model="batchAssignVisible" title="批量分配优惠券" width="700px">
      <el-form :model="batchAssignForm" label-width="100px">
        <el-form-item label="选择优惠券" required>
          <el-select
            v-model="batchAssignForm.couponIds"
            placeholder="请选择优惠券"
            multiple
            style="width: 100%"
          >
            <el-option
              v-for="coupon in couponOptions"
              :key="coupon.id"
              :label="coupon.name"
              :value="coupon.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择用户" required>
          <el-select
            v-model="batchAssignForm.userIds"
            placeholder="请选择用户"
            multiple
            filterable
            remote
            :remote-method="searchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.username} (${user.email})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchAssignVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchAssignLoading" @click="handleBatchAssign">
          确认分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Gift, Search } from '@element-plus/icons-vue'
import {
  getUserCoupons,
  revokeCouponFromUser,
  batchAssignCoupons,
  getCoupons
} from '@/api/coupons'
import { formatDate, formatDateRange } from '@/utils'
import type { UserCoupon, User, Coupon } from '@/types'

const loading = ref(false)
const tableData = ref<UserCoupon[]>([])
const selectedItems = ref<UserCoupon[]>([])
const batchAssignVisible = ref(false)
const batchAssignLoading = ref(false)
const userSearchLoading = ref(false)
const userOptions = ref<User[]>([])
const couponOptions = ref<Coupon[]>([])

// 搜索表单
const searchForm = reactive({
  userId: undefined as number | undefined,
  couponId: undefined as number | undefined,
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 批量分配表单
const batchAssignForm = reactive({
  couponIds: [] as number[],
  userIds: [] as number[]
})

// 用户优惠券状态配置
const getUserCouponStatusConfig = (status: string) => {
  const configs: Record<string, { type: string; text: string }> = {
    unused: { type: 'success', text: '未使用' },
    used: { type: 'info', text: '已使用' },
    expired: { type: 'danger', text: '已过期' }
  }
  return configs[status] || { type: '', text: status }
}

// 加载用户优惠券列表
const loadUserCoupons = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await getUserCoupons(params)
    tableData.value = response.data.items
    pagination.total = response.data.total
  } catch (error) {
    console.error('Failed to load user coupons:', error)
    ElMessage.error('加载用户优惠券列表失败')
  } finally {
    loading.value = false
  }
}

// 加载优惠券选项
const loadCouponOptions = async () => {
  try {
    const response = await getCoupons({ page: 1, pageSize: 100, status: 'active' })
    couponOptions.value = response.data.items
  } catch (error) {
    console.error('Failed to load coupon options:', error)
  }
}

// 搜索用户
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }
  
  try {
    userSearchLoading.value = true
    // 这里应该调用用户搜索API
    // const response = await searchUsers({ search: query })
    // userOptions.value = response.data.items
    
    // 模拟数据
    userOptions.value = [
      { id: 1, username: 'user1', email: 'user1@example.com' },
      { id: 2, username: 'user2', email: 'user2@example.com' },
      { id: 3, username: 'user3', email: 'user3@example.com' }
    ] as User[]
  } catch (error) {
    console.error('Failed to search users:', error)
  } finally {
    userSearchLoading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadUserCoupons()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    userId: undefined,
    couponId: undefined,
    status: ''
  })
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
  loadUserCoupons()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadUserCoupons()
}

// 选择处理
const handleSelectionChange = (selection: UserCoupon[]) => {
  selectedItems.value = selection
}

// 撤销优惠券
const revokeCoupon = async (row: UserCoupon) => {
  try {
    await revokeCouponFromUser(row.id)
    ElMessage.success('撤销成功')
    loadUserCoupons()
  } catch (error) {
    console.error('Failed to revoke coupon:', error)
    ElMessage.error('撤销失败')
  }
}

// 批量撤销
const batchRevoke = async () => {
  const unusedItems = selectedItems.value.filter(item => item.status === 'unused')
  if (unusedItems.length === 0) {
    ElMessage.warning('没有可撤销的优惠券')
    return
  }
  
  try {
    await Promise.all(unusedItems.map(item => revokeCouponFromUser(item.id)))
    ElMessage.success('批量撤销成功')
    selectedItems.value = []
    loadUserCoupons()
  } catch (error) {
    console.error('Failed to batch revoke coupons:', error)
    ElMessage.error('批量撤销失败')
  }
}

// 批量分配
const handleBatchAssign = async () => {
  if (batchAssignForm.couponIds.length === 0) {
    ElMessage.warning('请选择要分配的优惠券')
    return
  }
  
  if (batchAssignForm.userIds.length === 0) {
    ElMessage.warning('请选择要分配的用户')
    return
  }
  
  try {
    batchAssignLoading.value = true
    await batchAssignCoupons(batchAssignForm)
    ElMessage.success('批量分配成功')
    batchAssignVisible.value = false
    batchAssignForm.couponIds = []
    batchAssignForm.userIds = []
    loadUserCoupons()
  } catch (error) {
    console.error('Failed to batch assign coupons:', error)
    ElMessage.error('批量分配失败')
  } finally {
    batchAssignLoading.value = false
  }
}

onMounted(() => {
  loadUserCoupons()
  loadCouponOptions()
})
</script>

<style scoped>
.user-coupon-list {
  padding: 20px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-description {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.search-container {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.batch-actions {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.text-gray-400 {
  color: var(--el-text-color-disabled);
}
</style>