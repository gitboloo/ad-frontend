<template>
  <div class="customer-detail-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>客户详情</span>
          <div class="header-actions">
            <el-button
              type="primary"
              @click="handleEdit"
              v-if="$checkPermission(['admin', 'operator'])"
            >
              编辑客户
            </el-button>
            <el-button @click="handleBack">返回列表</el-button>
          </div>
        </div>
      </template>

      <div class="customer-info" v-if="customerData">
        <!-- 基本信息 -->
        <div class="info-section">
          <h3>基本信息</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="avatar-section">
                <el-avatar
                  :size="120"
                  :src="customerData.profile?.avatar"
                  :alt="customerData.username"
                >
                  {{ customerData.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <div class="user-name">{{ customerData.username }}</div>
                <el-tag
                  :type="getStatusTagType(customerData.status)"
                  size="large"
                >
                  {{ getStatusLabel(customerData.status) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="18">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="info-item">
                    <label>用户ID</label>
                    <span>{{ customerData.id }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>邮箱</label>
                    <span>{{ customerData.email || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>手机号</label>
                    <span>{{ customerData.phone || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>真实姓名</label>
                    <span>{{ customerData.realName || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>公司</label>
                    <span>{{ customerData.company || '-' }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>行业</label>
                    <span>{{ getIndustryLabel(customerData.industry) }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>客户等级</label>
                    <el-tag :type="getLevelTagType(customerData.level)">
                      {{ getLevelLabel(customerData.level) }}
                    </el-tag>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>注册时间</label>
                    <span>{{ $formatDate(customerData.registeredAt) }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <label>最后活跃</label>
                    <span>{{ customerData.lastActiveAt ? $formatDate(customerData.lastActiveAt) : '从未登录' }}</span>
                  </div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </div>

        <!-- 财务信息 -->
        <div class="info-section">
          <h3>财务信息</h3>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card balance">
                <div class="stat-value">¥{{ customerData.balance?.toFixed(2) || '0.00' }}</div>
                <div class="stat-label">账户余额</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card spent">
                <div class="stat-value">¥{{ customerData.totalSpent?.toFixed(2) || '0.00' }}</div>
                <div class="stat-label">累计消费</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-value">{{ transactionStats.count || 0 }}</div>
                <div class="stat-label">交易次数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-value">{{ orderStats.count || 0 }}</div>
                <div class="stat-label">订单数量</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 个人资料 -->
        <div class="info-section" v-if="customerData.profile">
          <h3>个人资料</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label>性别</label>
                <span>{{ getGenderLabel(customerData.profile.gender) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>生日</label>
                <span>{{ customerData.profile.birthday || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>年龄</label>
                <span>{{ getAge(customerData.profile.birthday) }}</span>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="info-item">
                <label>地址</label>
                <span>{{ getFullAddress(customerData.profile.address) }}</span>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="info-item">
                <label>偏好标签</label>
                <div class="preferences">
                  <el-tag
                    v-for="preference in customerData.profile.preferences"
                    :key="preference"
                    type="info"
                    size="small"
                    class="preference-tag"
                  >
                    {{ getPreferenceLabel(preference) }}
                  </el-tag>
                  <span v-if="!customerData.profile.preferences?.length">暂无偏好标签</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 操作记录 -->
        <div class="info-section">
          <h3>操作记录</h3>
          <el-tabs v-model="activeTab">
            <!-- 交易记录 -->
            <el-tab-pane label="交易记录" name="transactions">
              <el-table
                v-loading="transactionLoading"
                :data="transactions"
                stripe
                height="300"
              >
                <el-table-column prop="id" label="交易ID" width="100" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getTransactionTagType(row.type)" size="small">
                      {{ getTransactionLabel(row.type) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="120">
                  <template #default="{ row }">
                    <span :class="{ 'amount-negative': row.amount < 0, 'amount-positive': row.amount > 0 }">
                      ¥{{ Math.abs(row.amount).toFixed(2) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="balance" label="余额" width="120">
                  <template #default="{ row }">
                    ¥{{ row.balance?.toFixed(2) || '0.00' }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getTransactionStatusTagType(row.status)" size="small">
                      {{ getTransactionStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="时间" width="120">
                  <template #default="{ row }">
                    {{ $formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container" v-if="transactions.length">
                <el-pagination
                  v-model:current-page="transactionQuery.page"
                  :total="transactionTotal"
                  :page-size="transactionQuery.pageSize"
                  layout="prev, pager, next"
                  @current-change="handleTransactionPageChange"
                  small
                />
              </div>
            </el-tab-pane>

            <!-- 订单记录 -->
            <el-tab-pane label="订单记录" name="orders">
              <el-table
                v-loading="orderLoading"
                :data="orders"
                stripe
                height="300"
              >
                <el-table-column prop="id" label="订单ID" width="120" />
                <el-table-column prop="productName" label="产品" min-width="150" />
                <el-table-column prop="amount" label="订单金额" width="120">
                  <template #default="{ row }">
                    ¥{{ row.amount?.toFixed(2) || '0.00' }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getOrderStatusTagType(row.status)" size="small">
                      {{ getOrderStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="下单时间" width="120">
                  <template #default="{ row }">
                    {{ $formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container" v-if="orders.length">
                <el-pagination
                  v-model:current-page="orderQuery.page"
                  :total="orderTotal"
                  :page-size="orderQuery.pageSize"
                  layout="prev, pager, next"
                  @current-change="handleOrderPageChange"
                  small
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getCustomer,
  getCustomerTransactions,
  getCustomerOrders
} from '@/api/customers'
import type { Customer, Transaction, ListQuery } from '@/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const transactionLoading = ref(false)
const orderLoading = ref(false)
const activeTab = ref('transactions')

const customerId = route.params.id as string
const customerData = ref<Customer | null>(null)
const transactions = ref<Transaction[]>([])
const orders = ref<any[]>([])
const transactionTotal = ref(0)
const orderTotal = ref(0)

const transactionStats = ref({ count: 0 })
const orderStats = ref({ count: 0 })

const transactionQuery = reactive<ListQuery>({
  page: 1,
  pageSize: 10
})

const orderQuery = reactive<ListQuery>({
  page: 1,
  pageSize: 10
})

onMounted(async () => {
  await loadCustomer()
  await loadTransactions()
  await loadOrders()
})

const loadCustomer = async () => {
  try {
    loading.value = true
    const res = await getCustomer(customerId)
    customerData.value = res.data
  } catch (error) {
    ElMessage.error('加载客户信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadTransactions = async () => {
  try {
    transactionLoading.value = true
    const res = await getCustomerTransactions(customerId, transactionQuery)
    transactions.value = res.data.items
    transactionTotal.value = res.data.total
    transactionStats.value.count = res.data.total
  } catch (error) {
    console.error('Failed to load transactions:', error)
  } finally {
    transactionLoading.value = false
  }
}

const loadOrders = async () => {
  try {
    orderLoading.value = true
    const res = await getCustomerOrders(customerId, orderQuery)
    orders.value = res.data.items
    orderTotal.value = res.data.total
    orderStats.value.count = res.data.total
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    orderLoading.value = false
  }
}

const handleTransactionPageChange = (page: number) => {
  transactionQuery.page = page
  loadTransactions()
}

const handleOrderPageChange = (page: number) => {
  orderQuery.page = page
  loadOrders()
}

const handleEdit = () => {
  router.push(`/customers/${customerId}/edit`)
}

const handleBack = () => {
  router.push('/customers')
}

// 辅助函数
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

const getIndustryLabel = (industry?: string) => {
  const labels: Record<string, string> = {
    internet: '互联网',
    ecommerce: '电商',
    finance: '金融',
    education: '教育',
    healthcare: '医疗',
    manufacturing: '制造业',
    catering: '餐饮',
    realestate: '房地产',
    tourism: '旅游',
    other: '其他'
  }
  return industry ? labels[industry] || industry : '-'
}

const getGenderLabel = (gender?: string) => {
  const labels: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return gender ? labels[gender] || gender : '-'
}

const getAge = (birthday?: string) => {
  if (!birthday) return '-'
  
  const birth = new Date(birthday)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  
  return age > 0 && age < 150 ? `${age}岁` : '-'
}

const getFullAddress = (address?: any) => {
  if (!address) return '-'
  
  const { province, city, district, detail } = address
  const parts = [province, city, district, detail].filter(Boolean)
  return parts.length ? parts.join(' ') : '-'
}

const getPreferenceLabel = (preference: string) => {
  const labels: Record<string, string> = {
    digital: '数码产品',
    fashion: '服装时尚',
    food: '美食餐饮',
    travel: '旅游出行',
    sports: '运动健身',
    home: '家居生活',
    baby: '母婴用品',
    education: '教育培训',
    finance: '金融理财',
    health: '医疗健康'
  }
  return labels[preference] || preference
}

const getTransactionLabel = (type: string) => {
  const labels: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    refund: '退款',
    withdraw: '提现'
  }
  return labels[type] || type
}

const getTransactionTagType = (type: string) => {
  const types: Record<string, string> = {
    recharge: 'success',
    consume: 'warning',
    refund: 'info',
    withdraw: 'danger'
  }
  return types[type] || ''
}

const getTransactionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return labels[status] || status
}

const getTransactionStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return types[status] || ''
}

const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    processing: '处理中',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return labels[status] || status
}

const getOrderStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    processing: 'info',
    completed: 'success',
    cancelled: 'info',
    refunded: 'danger'
  }
  return types[status] || ''
}
</script>

<style scoped>
.customer-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.info-section {
  margin-bottom: 40px;
}

.info-section h3 {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-name {
  margin: 15px 0 10px;
  font-size: 18px;
  font-weight: 600;
}

.info-item {
  margin-bottom: 15px;
}

.info-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.info-item span {
  color: var(--el-text-color-primary);
}

.stat-card {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--el-color-primary);
}

.stat-card.balance .stat-value {
  color: var(--el-color-success);
}

.stat-card.spent .stat-value {
  color: var(--el-color-warning);
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.preferences {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preference-tag {
  margin: 0;
}

.amount-positive {
  color: var(--el-color-success);
}

.amount-negative {
  color: var(--el-color-danger);
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}
</style>