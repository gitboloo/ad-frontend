<template>
  <div class="dashboard">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">仪表盘</h1>
        <p class="page-description">欢迎回来，{{ userStore.user?.nickname || userStore.user?.username }}！</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <StatsCard
          title="总产品数"
          :value="dashboardStats.overview.totalProducts"
          icon="Goods"
          color="#409eff"
          trend="+12%"
          trend-type="up"
        />
        <StatsCard
          title="活跃计划"
          :value="dashboardStats.overview.totalCampaigns"
          icon="Promotion"
          color="#67c23a"
          trend="+8%"
          trend-type="up"
        />
        <StatsCard
          title="注册用户"
          :value="dashboardStats.overview.totalUsers"
          icon="User"
          color="#e6a23c"
          :trend="dashboardStats.overview.userGrowth + '%'"
          :trend-type="dashboardStats.overview.userGrowth > 0 ? 'up' : 'down'"
        />
        <StatsCard
          title="今日收入"
          :value="formatCurrency(dashboardStats.overview.todayRevenue)"
          icon="Money"
          color="#f56c6c"
          :trend="dashboardStats.overview.revenueGrowth + '%'"
          :trend-type="dashboardStats.overview.revenueGrowth > 0 ? 'up' : 'down'"
        />
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-container">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>收入趋势</span>
                <el-radio-group v-model="revenueChartPeriod" size="small" @change="loadRevenueChart">
                  <el-radio-button label="7d">7天</el-radio-button>
                  <el-radio-button label="30d">30天</el-radio-button>
                  <el-radio-button label="90d">90天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <LineChart
              :data="revenueChartData"
              height="300px"
              :loading="revenueChartLoading"
            />
          </el-card>
        </div>
        
        <div class="chart-container">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>用户增长</span>
                <el-radio-group v-model="userChartPeriod" size="small" @change="loadUserChart">
                  <el-radio-button label="7d">7天</el-radio-button>
                  <el-radio-button label="30d">30天</el-radio-button>
                  <el-radio-button label="90d">90天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <BarChart
              :data="userChartData"
              height="300px"
              :loading="userChartLoading"
            />
          </el-card>
        </div>
      </div>
      
      <!-- 活动和数据 -->
      <div class="bottom-grid">
        <div class="activities-container">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
                <el-link type="primary" @click="router.push('/activities')">查看全部</el-link>
              </div>
            </template>
            <div v-loading="activitiesLoading" class="activities-list">
              <div
                v-for="activity in activities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="`activity-${activity.status}`">
                  <el-icon size="16">
                    <component :is="getActivityIcon(activity.type)" />
                  </el-icon>
                </div>
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</div>
                </div>
              </div>
              <div v-if="activities.length === 0" class="empty-state">
                暂无活动记录
              </div>
            </div>
          </el-card>
        </div>
        
        <div class="quick-stats-container">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>快速统计</span>
                <el-link type="primary" @click="router.push('/statistics')">详细统计</el-link>
              </div>
            </template>
            <div class="quick-stats">
              <div class="stat-item">
                <div class="stat-label">月收入</div>
                <div class="stat-value">{{ formatCurrency(dashboardStats.overview.monthlyRevenue) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">总收入</div>
                <div class="stat-value">{{ formatCurrency(dashboardStats.overview.totalRevenue) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ formatNumber(Math.floor(dashboardStats.overview.totalUsers * 0.7)) }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">转化率</div>
                <div class="stat-value">{{ formatPercentage(0.034) }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  UserFilled,
  ShoppingBag,
  Bell,
  TrendCharts
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getDashboardStats, getRecentActivities } from '@/api/dashboard'
import { formatCurrency, formatNumber, formatPercentage, formatRelativeTime } from '@/utils'
import type { DashboardStats, Activity, ChartData } from '@/types'
import StatsCard from '@/components/charts/StatsCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const activitiesLoading = ref(false)
const revenueChartLoading = ref(false)
const userChartLoading = ref(false)
const revenueChartPeriod = ref('30d')
const userChartPeriod = ref('30d')

// 仪表盘数据
const dashboardStats = ref<DashboardStats>({
  overview: {
    totalProducts: 0,
    totalCampaigns: 0,
    totalUsers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    userGrowth: 0
  },
  charts: {
    revenueChart: { categories: [], series: [] },
    userChart: { categories: [], series: [] },
    campaignChart: { categories: [], series: [] }
  },
  activities: []
})

const activities = ref<Activity[]>([])
const revenueChartData = ref<ChartData>({ categories: [], series: [] })
const userChartData = ref<ChartData>({ categories: [], series: [] })

// 获取活动图标
const getActivityIcon = (type: string) => {
  const icons = {
    user_register: UserFilled,
    campaign_create: TrendCharts,
    order_complete: ShoppingBag,
    system_alert: Bell
  }
  return icons[type as keyof typeof icons] || User
}

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    loading.value = true
    const response = await getDashboardStats()
    
    if (response.success) {
      dashboardStats.value = response.data
      revenueChartData.value = response.data.charts.revenueChart
      userChartData.value = response.data.charts.userChart
      activities.value = response.data.activities.slice(0, 8) // 只显示前8条
    }
  } catch (error) {
    console.error('Load dashboard data error:', error)
    ElMessage.error('加载仪表盘数据失败')
  } finally {
    loading.value = false
  }
}

// 加载收入图表数据
const loadRevenueChart = async (period = revenueChartPeriod.value) => {
  try {
    revenueChartLoading.value = true
    // 这里可以调用具体的API获取不同时期的数据
    // 暂时使用模拟数据
    setTimeout(() => {
      revenueChartData.value = generateMockChartData(period, 'revenue')
      revenueChartLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Load revenue chart error:', error)
    revenueChartLoading.value = false
  }
}

// 加载用户图表数据
const loadUserChart = async (period = userChartPeriod.value) => {
  try {
    userChartLoading.value = true
    // 这里可以调用具体的API获取不同时期的数据
    // 暂时使用模拟数据
    setTimeout(() => {
      userChartData.value = generateMockChartData(period, 'user')
      userChartLoading.value = false
    }, 500)
  } catch (error) {
    console.error('Load user chart error:', error)
    userChartLoading.value = false
  }
}

// 生成模拟图表数据
const generateMockChartData = (period: string, type: string): ChartData => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const categories = []
  const data = []
  
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    categories.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    
    if (type === 'revenue') {
      data.push(Math.floor(Math.random() * 10000) + 5000)
    } else {
      data.push(Math.floor(Math.random() * 100) + 20)
    }
  }
  
  return {
    categories,
    series: [{
      name: type === 'revenue' ? '收入' : '新增用户',
      data
    }]
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    loadDashboardData(),
    loadRevenueChart(),
    loadUserChart()
  ])
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  }
  
  .bottom-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    
    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-weight: 600;
      font-size: 16px;
    }
  }
  
  .activities-list {
    min-height: 300px;
    
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
      
      .activity-icon {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.activity-info {
          background-color: var(--el-color-info-light-9);
          color: var(--el-color-info);
        }
        
        &.activity-success {
          background-color: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
        
        &.activity-warning {
          background-color: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }
        
        &.activity-error {
          background-color: var(--el-color-error-light-9);
          color: var(--el-color-error);
        }
      }
      
      .activity-content {
        flex: 1;
        
        .activity-title {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }
        
        .activity-description {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }
        
        .activity-time {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }
    }
    
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .quick-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    
    .stat-item {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
      background-color: var(--el-fill-color-extra-light);
      
      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    .stats-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    
    .charts-grid {
      gap: 16px;
    }
    
    .bottom-grid {
      gap: 16px;
    }
    
    .quick-stats {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }
}
</style>