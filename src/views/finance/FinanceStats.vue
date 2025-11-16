<template>
  <div class="finance-stats">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>财务统计</h2>
        <p>实时监控平台财务状况和交易数据</p>
      </div>
      <div class="page-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <el-button :icon="Refresh" @click="refreshData">刷新数据</el-button>
        <el-button type="primary" :icon="Download" @click="exportReport">
          导出报表
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="stats-cards">
      <div class="stats-grid">
        <StatsCard
          title="总收入"
          :value="formatCurrency(stats.overview.totalIncome)"
          icon="Money"
          color="#16a34a"
          :trend="stats.overview.incomeGrowth > 0 ? `+${stats.overview.incomeGrowth.toFixed(1)}%` : `${stats.overview.incomeGrowth.toFixed(1)}%`"
          :trend-type="stats.overview.incomeGrowth > 0 ? 'up' : 'down'"
        />
        <StatsCard
          title="总支出"
          :value="formatCurrency(stats.overview.totalExpense)"
          icon="Wallet"
          color="#dc2626"
          :trend="stats.overview.expenseGrowth > 0 ? `+${stats.overview.expenseGrowth.toFixed(1)}%` : `${stats.overview.expenseGrowth.toFixed(1)}%`"
          :trend-type="stats.overview.expenseGrowth > 0 ? 'up' : 'down'"
        />
        <StatsCard
          title="净利润"
          :value="formatCurrency(stats.overview.netProfit)"
          icon="TrendCharts"
          color="#2563eb"
          :trend="stats.overview.profitGrowth > 0 ? `+${stats.overview.profitGrowth.toFixed(1)}%` : `${stats.overview.profitGrowth.toFixed(1)}%`"
          :trend-type="stats.overview.profitGrowth > 0 ? 'up' : 'down'"
        />
        <StatsCard
          title="活跃用户"
          :value="stats.overview.activeUsers"
          icon="User"
          color="#7c3aed"
        />
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="24">
        <!-- 收入支出趋势 -->
        <el-col :span="24" :lg="16">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>收入支出趋势</span>
                <div class="chart-controls">
                  <el-radio-group v-model="incomeExpenseTimeRange" size="small" @change="fetchIncomeExpenseData">
                    <el-radio-button value="7d">7天</el-radio-button>
                    <el-radio-button value="30d">30天</el-radio-button>
                    <el-radio-button value="90d">90天</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <LineChart
                :data="incomeExpenseChartData"
                :loading="chartsLoading.incomeExpense"
                height="350px"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 交易类型分布 -->
        <el-col :span="24" :lg="8">
          <el-card class="chart-card">
            <template #header>
              <span>交易类型分布</span>
            </template>
            <div class="chart-container">
              <div class="transaction-types">
                <div
                  v-for="item in stats.transactionTypes"
                  :key="item.type"
                  class="type-item"
                >
                  <div class="type-info">
                    <div class="type-label">{{ getTypeLabel(item.type) }}</div>
                    <div class="type-amount">{{ formatCurrency(item.amount) }}</div>
                    <div class="type-count">{{ item.count }} 笔</div>
                  </div>
                  <div class="type-progress">
                    <el-progress
                      :percentage="item.percentage"
                      :color="getTypeColor(item.type)"
                      :show-text="false"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="24" style="margin-top: 24px">
        <!-- 支付方式统计 -->
        <el-col :span="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>支付方式统计</span>
            </template>
            <div class="chart-container">
              <BarChart
                :data="paymentMethodChartData"
                :loading="chartsLoading.paymentMethod"
                height="300px"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 用户余额分布 -->
        <el-col :span="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <span>用户余额分布</span>
            </template>
            <div class="chart-container">
              <div class="balance-distribution">
                <div
                  v-for="item in stats.balanceDistribution"
                  :key="item.range"
                  class="balance-item"
                >
                  <div class="balance-range">{{ item.range }}</div>
                  <div class="balance-users">{{ item.users }} 用户</div>
                  <div class="balance-bar">
                    <div 
                      class="balance-progress"
                      :style="{ width: `${item.percentage}%` }"
                    ></div>
                  </div>
                  <div class="balance-percentage">{{ item.percentage }}%</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详细统计表格 -->
    <div class="stats-tables">
      <el-row :gutter="24">
        <!-- 近期交易 -->
        <el-col :span="24" :lg="12">
          <el-card>
            <template #header>
              <div class="table-header">
                <span>近期交易</span>
                <el-button type="primary" text @click="$router.push('/finance/transactions')">
                  查看全部
                </el-button>
              </div>
            </template>
            <el-table
              :data="stats.recentTransactions"
              style="width: 100%"
              max-height="400"
            >
              <el-table-column prop="user.username" label="用户" width="100" />
              <el-table-column prop="type" label="类型" width="80">
                <template #default="{ row }">
                  <el-tag :type="getTypeTagType(row.type)" size="small">
                    {{ getTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="{ row }">
                  <span :class="getAmountClass(row.type)">
                    {{ formatAmount(row.amount, row.type) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="时间" min-width="120">
                <template #default="{ row }">
                  {{ formatDateTime(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 热门用户 -->
        <el-col :span="24" :lg="12">
          <el-card>
            <template #header>
              <div class="table-header">
                <span>交易活跃用户</span>
                <el-button type="primary" text @click="$router.push('/customers')">
                  查看全部
                </el-button>
              </div>
            </template>
            <div class="top-users">
              <div
                v-for="(user, index) in stats.topUsers"
                :key="user.id"
                class="user-item"
              >
                <div class="user-rank">{{ index + 1 }}</div>
                <div class="user-avatar">
                  <el-avatar :size="32" :src="user.avatar">
                    {{ user.username.charAt(0) }}
                  </el-avatar>
                </div>
                <div class="user-info">
                  <div class="username">{{ user.username }}</div>
                  <div class="user-stats">
                    <span>交易: {{ user.transactionCount }}笔</span>
                    <span>金额: {{ formatCurrency(user.totalAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 实时提醒 -->
    <el-card class="alerts-card" v-if="stats.alerts && stats.alerts.length > 0">
      <template #header>
        <span>系统提醒</span>
      </template>
      <div class="alerts-list">
        <el-alert
          v-for="alert in stats.alerts"
          :key="alert.id"
          :title="alert.title"
          :type="alert.type"
          :description="alert.description"
          show-icon
          :closable="false"
          style="margin-bottom: 12px"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import StatsCard from '@/components/charts/StatsCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import {
  getFinanceStats,
  getIncomeExpenseReport,
  getPaymentMethodStats,
  exportFinanceReport
} from '@/api/finance'
import type { Transaction } from '@/types'
import { formatDateTime, formatCurrency } from '@/utils'

// 响应式数据
const dateRange = ref<[string, string] | null>(null)
const incomeExpenseTimeRange = ref('30d')

// 图表加载状态
const chartsLoading = reactive({
  incomeExpense: false,
  paymentMethod: false
})

// 统计数据
const stats = reactive({
  overview: {
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    activeUsers: 0,
    incomeGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0
  },
  transactionTypes: [] as any[],
  balanceDistribution: [] as any[],
  recentTransactions: [] as Transaction[],
  topUsers: [] as any[],
  alerts: [] as any[]
})

// 图表数据
const incomeExpenseChartData = ref({
  categories: [],
  series: []
})

const paymentMethodChartData = ref({
  categories: [],
  series: []
})

// 获取核心统计数据
const fetchStats = async () => {
  try {
    const params = {
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }

    const { data } = await getFinanceStats(params)
    
    // 更新统计数据
    Object.assign(stats.overview, {
      totalIncome: data.overview.totalAmount * 0.8, // 模拟收入占比
      totalExpense: data.overview.totalAmount * 0.2, // 模拟支出占比
      netProfit: data.overview.totalAmount * 0.6,
      activeUsers: data.overview.totalTransactions,
      incomeGrowth: Math.random() * 20 - 10, // 模拟增长率
      expenseGrowth: Math.random() * 15 - 7.5,
      profitGrowth: Math.random() * 25 - 12.5
    })

    // 交易类型分布（模拟数据）
    stats.transactionTypes = [
      { type: 'recharge', amount: data.overview.totalAmount * 0.4, count: 120, percentage: 40 },
      { type: 'consume', amount: data.overview.totalAmount * 0.35, count: 890, percentage: 35 },
      { type: 'withdraw', amount: data.overview.totalAmount * 0.15, count: 45, percentage: 15 },
      { type: 'refund', amount: data.overview.totalAmount * 0.1, count: 23, percentage: 10 }
    ]

    // 用户余额分布（模拟数据）
    stats.balanceDistribution = [
      { range: '0-100元', users: 150, percentage: 30 },
      { range: '100-500元', users: 200, percentage: 40 },
      { range: '500-1000元', users: 80, percentage: 16 },
      { range: '1000-5000元', users: 50, percentage: 10 },
      { range: '5000元以上', users: 20, percentage: 4 }
    ]

    // 近期交易
    stats.recentTransactions = data.recent || []

    // 活跃用户（模拟数据）
    stats.topUsers = [
      { id: 1, username: 'user001', avatar: '', transactionCount: 25, totalAmount: 5600 },
      { id: 2, username: 'user002', avatar: '', transactionCount: 22, totalAmount: 4800 },
      { id: 3, username: 'user003', avatar: '', transactionCount: 18, totalAmount: 3900 },
      { id: 4, username: 'user004', avatar: '', transactionCount: 15, totalAmount: 3200 },
      { id: 5, username: 'user005', avatar: '', transactionCount: 12, totalAmount: 2800 }
    ]

    // 系统提醒（模拟数据）
    stats.alerts = [
      {
        id: 1,
        type: 'warning',
        title: '待处理提现申请',
        description: '当前有 3 笔提现申请待审核，请及时处理'
      }
    ]

  } catch (error) {
    ElMessage.error('获取统计数据失败')
    console.error('获取统计数据失败:', error)
  }
}

// 获取收入支出趋势数据
const fetchIncomeExpenseData = async () => {
  chartsLoading.incomeExpense = true
  try {
    const days = parseInt(incomeExpenseTimeRange.value)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const { data } = await getIncomeExpenseReport({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      groupBy: days <= 7 ? 'day' : days <= 30 ? 'day' : 'week'
    })

    incomeExpenseChartData.value = {
      categories: data.income.map((item: any) => item.date),
      series: [
        {
          name: '收入',
          data: data.income.map((item: any) => item.amount),
          color: '#16a34a'
        },
        {
          name: '支出',
          data: data.expense.map((item: any) => item.amount),
          color: '#dc2626'
        },
        {
          name: '净利润',
          data: data.net.map((item: any) => item.amount),
          color: '#2563eb'
        }
      ]
    }
  } catch (error) {
    console.error('获取收入支出数据失败:', error)
  } finally {
    chartsLoading.incomeExpense = false
  }
}

// 获取支付方式统计
const fetchPaymentMethodStats = async () => {
  chartsLoading.paymentMethod = true
  try {
    const params = {
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }

    const { data } = await getPaymentMethodStats(params)

    paymentMethodChartData.value = {
      categories: data.methods.map((item: any) => getPaymentMethodLabel(item.method)),
      series: [
        {
          name: '交易金额',
          data: data.methods.map((item: any) => item.amount),
          color: '#409eff'
        }
      ]
    }
  } catch (error) {
    console.error('获取支付方式统计失败:', error)
  } finally {
    chartsLoading.paymentMethod = false
  }
}

// 日期变化处理
const handleDateChange = () => {
  fetchStats()
  fetchIncomeExpenseData()
  fetchPaymentMethodStats()
}

// 刷新数据
const refreshData = () => {
  fetchStats()
  fetchIncomeExpenseData()
  fetchPaymentMethodStats()
}

// 导出报表
const exportReport = async () => {
  try {
    const params = {
      type: 'income-expense',
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      format: 'excel'
    }

    const response = await exportFinanceReport(params)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `财务报表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('报表导出成功')
  } catch (error) {
    ElMessage.error('报表导出失败')
  }
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

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    recharge: '#16a34a',
    consume: '#f59e0b',
    refund: '#06b6d4',
    withdraw: '#dc2626'
  }
  return colors[type] || '#6b7280'
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
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
  // 设置默认日期范围（最近30天）
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)
  
  dateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ]

  refreshData()
})
</script>

<style lang="scss" scoped>
.finance-stats {
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

    .page-actions {
      display: flex;
      align-items: center;
      gap: 12px;
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

  .charts-section {
    margin-bottom: 24px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        min-height: 300px;
      }
    }

    .transaction-types {
      .type-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
          border-bottom: none;
        }

        .type-info {
          flex: 1;

          .type-label {
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
          }

          .type-amount {
            font-size: 18px;
            font-weight: 600;
            color: #16a34a;
            margin-bottom: 2px;
          }

          .type-count {
            font-size: 12px;
            color: #6b7280;
          }
        }

        .type-progress {
          width: 100px;
          margin-left: 16px;
        }
      }
    }

    .balance-distribution {
      .balance-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
          border-bottom: none;
        }

        .balance-range {
          width: 100px;
          font-weight: 500;
          color: #374151;
        }

        .balance-users {
          width: 80px;
          color: #6b7280;
          font-size: 14px;
        }

        .balance-bar {
          flex: 1;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          margin: 0 12px;
          position: relative;

          .balance-progress {
            height: 100%;
            background: linear-gradient(90deg, #16a34a, #22c55e);
            border-radius: 4px;
            transition: width 0.3s ease;
          }
        }

        .balance-percentage {
          width: 40px;
          text-align: right;
          font-size: 14px;
          color: #6b7280;
        }
      }
    }
  }

  .stats-tables {
    margin-bottom: 24px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .top-users {
      .user-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f3f4f6;

        &:last-child {
          border-bottom: none;
        }

        .user-rank {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
          font-weight: 600;
          color: #374151;
          margin-right: 12px;
        }

        .user-avatar {
          margin-right: 12px;
        }

        .user-info {
          flex: 1;

          .username {
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
          }

          .user-stats {
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }
  }

  .alerts-card {
    .alerts-list {
      .el-alert {
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .amount-income {
    color: #16a34a;
    font-weight: 500;
  }

  .amount-expense {
    color: #dc2626;
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .finance-stats {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .page-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .chart-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .transaction-types .type-item {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .balance-item {
      flex-wrap: wrap;
      gap: 8px;

      .balance-range,
      .balance-users {
        width: auto;
      }

      .balance-bar {
        order: 3;
        width: 100%;
        margin: 0;
      }
    }
  }
}
</style>