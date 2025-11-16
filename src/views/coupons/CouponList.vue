<template>
  <div class="coupon-list">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">优惠券管理</h1>
        <p class="page-description">管理系统优惠券</p>
        <div class="page-actions">
          <el-button type="primary" @click="router.push('/coupons/create')">
            <el-icon><Plus /></el-icon>
            创建优惠券
          </el-button>
        </div>
      </div>
      
      <el-card>
        <!-- 搜索和筛选 -->
        <div class="search-container">
          <el-form :model="searchForm" inline>
            <el-form-item label="关键词">
              <el-input
                v-model="searchForm.search"
                placeholder="搜索优惠券名称或代码"
                style="width: 200px"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-select
                v-model="searchForm.type"
                placeholder="选择类型"
                style="width: 120px"
                clearable
                @change="handleSearch"
              >
                <el-option label="固定金额" value="fixed" />
                <el-option label="百分比" value="percentage" />
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
                <el-option label="激活" value="active" />
                <el-option label="停用" value="inactive" />
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
        <el-table v-loading="loading" :data="tableData" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="优惠券名称" min-width="150" />
          <el-table-column prop="code" label="优惠券代码" width="150" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'fixed' ? 'success' : 'info'">
                {{ row.type === 'fixed' ? '固定金额' : '百分比' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="优惠值" width="100">
            <template #default="{ row }">
              {{ row.type === 'fixed' ? `¥${row.value}` : `${row.value}%` }}
            </template>
          </el-table-column>
          <el-table-column prop="minAmount" label="最低消费" width="100">
            <template #default="{ row }">
              {{ row.minAmount ? `¥${row.minAmount}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="usageLimit" label="使用限制" width="100">
            <template #default="{ row }">
              {{ row.usageLimit || '无限制' }}
            </template>
          </el-table-column>
          <el-table-column prop="usedCount" label="已使用" width="80" />
          <el-table-column prop="validFrom" label="有效期" width="200">
            <template #default="{ row }">
              {{ formatDateRange(row.validFrom, row.validTo) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusConfig(row.status, 'coupon').type">
                {{ getStatusConfig(row.status, 'coupon').text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="editCoupon(row)">
                编辑
              </el-button>
              <el-button size="small" link type="info" @click="assignCoupon(row)">
                分配
              </el-button>
              <el-button
                size="small"
                link
                :type="row.status === 'active' ? 'warning' : 'success'"
                @click="toggleStatus(row)"
              >
                {{ row.status === 'active' ? '停用' : '启用' }}
              </el-button>
              <el-popconfirm
                title="确定要删除这个优惠券吗？"
                @confirm="deleteCoupon(row)"
              >
                <template #reference>
                  <el-button size="small" link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 分配优惠券对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配优惠券" width="600px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="优惠券">
          <el-input :value="assignForm.couponName" readonly />
        </el-form-item>
        <el-form-item label="选择用户" required>
          <el-select
            v-model="assignForm.userIds"
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
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assignLoading" @click="handleAssign">
          确认分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getCoupons,
  deleteCoupon as apiDeleteCoupon,
  updateCouponStatus,
  assignCouponToUser
} from '@/api/coupons'
import { formatDateRange, getStatusConfig } from '@/utils'
import type { Coupon, User } from '@/types'

const router = useRouter()
const loading = ref(false)
const tableData = ref<Coupon[]>([])
const assignDialogVisible = ref(false)
const assignLoading = ref(false)
const userSearchLoading = ref(false)
const userOptions = ref<User[]>([])

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

// 分配表单
const assignForm = reactive({
  couponId: 0,
  couponName: '',
  userIds: [] as number[]
})

// 加载优惠券列表
const loadCoupons = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await getCoupons(params)
    tableData.value = response.data.items
    pagination.total = response.data.total
  } catch (error) {
    console.error('Failed to load coupons:', error)
    ElMessage.error('加载优惠券列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadCoupons()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    search: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
  loadCoupons()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadCoupons()
}

// 编辑优惠券
const editCoupon = (row: Coupon) => {
  router.push(`/coupons/edit/${row.id}`)
}

// 删除优惠券
const deleteCoupon = async (row: Coupon) => {
  try {
    await apiDeleteCoupon(row.id)
    ElMessage.success('删除成功')
    loadCoupons()
  } catch (error) {
    console.error('Failed to delete coupon:', error)
    ElMessage.error('删除失败')
  }
}

// 切换状态
const toggleStatus = async (row: Coupon) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '启用' : '停用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}这个优惠券吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    await updateCouponStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    loadCoupons()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to update coupon status:', error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 分配优惠券
const assignCoupon = (row: Coupon) => {
  assignForm.couponId = row.id
  assignForm.couponName = row.name
  assignForm.userIds = []
  assignDialogVisible.value = true
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
      { id: 2, username: 'user2', email: 'user2@example.com' }
    ] as User[]
  } catch (error) {
    console.error('Failed to search users:', error)
  } finally {
    userSearchLoading.value = false
  }
}

// 确认分配
const handleAssign = async () => {
  if (assignForm.userIds.length === 0) {
    ElMessage.warning('请选择要分配的用户')
    return
  }
  
  try {
    assignLoading.value = true
    await assignCouponToUser({
      couponId: assignForm.couponId,
      userIds: assignForm.userIds
    })
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
  } catch (error) {
    console.error('Failed to assign coupon:', error)
    ElMessage.error('分配失败')
  } finally {
    assignLoading.value = false
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.coupon-list {
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>