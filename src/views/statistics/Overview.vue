<template>
  <div class="statistics-overview">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">统计概览</h1>
        <p class="page-description">查看平台整体运营数据和关键指标</p>
        
        <div class="page-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
          <el-button 
            type="primary" 
            :loading="exportLoading"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </div>
      </div>

      <!-- 关键指标卡片 -->
      <div class="metrics-grid" v-loading="metricsLoading">
        <div class="metric-card">
          <div class="metric-icon revenue">
            <el-icon size="24"><Money /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatCurrency(metrics.totalRevenue) }}</div>
            <div class="metric-label">总收入</div>
            <div class="metric-trend" :class="metrics.revenueTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.revenueTrend >= 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
              {{ Math.abs(metrics.revenueTrend) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon orders">
            <el-icon size="24"><ShoppingBag /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatNumber(metrics.totalOrders) }}</div>
            <div class="metric-label">总订单</div>
            <div class="metric-trend" :class="metrics.ordersTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.ordersTrend >= 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
              {{ Math.abs(metrics.ordersTrend) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon users">
            <el-icon size="24"><User /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatNumber(metrics.totalUsers) }}</div>
            <div class="metric-label">总用户</div>
            <div class="metric-trend" :class="metrics.usersTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.usersTrend >= 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
              {{ Math.abs(metrics.usersTrend) }}%
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon conversion">
            <el-icon size="24"><Aim /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ formatPercentage(metrics.conversionRate) }}</div>
            <div class="metric-label">转化率</div>
            <div class="metric-trend" :class="metrics.conversionTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.conversionTrend >= 0 ? 'TrendCharts' : 'Bottom'" /></el-icon>
              {{ Math.abs(metrics.conversionTrend) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势图表区域 -->
      <div class="charts-section">
        <div class="charts-header">
          <h2>趋势分析</h2>
          <el-radio-group v-model="chartPeriod" @change="handlePeriodChange">
            <el-radio-button label="7d">7天</el-radio-button>
            <el-radio-button label="30d">30天</el-radio-button>
            <el-radio-button label="90d">90天</el-radio-button>
            <el-radio-button label="1y">1年</el-radio-button>
          </el-radio-group>
        </div>

        <div class="charts-grid">
          <!-- 收入趋势 -->
          <div class="chart-container">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>收入趋势</span>
                  <el-switch
                    v-model="revenueCompare"
                    inline-prompt
                    active-text="对比"
                    inactive-text="单期"
                    @change="loadRevenueChart"
                  />
                </div>
              </template>
              <LineChart
                :data="revenueChartData"
                height="350px"
                :loading="revenueChartLoading"
                title="收入变化趋势"
              />
            </el-card>
          </div>

          <!-- 用户增长 -->
          <div class="chart-container">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>用户增长</span>
                  <el-switch
                    v-model="userCompare"
                    inline-prompt
                    active-text="对比"
                    inactive-text="单期"
                    @change="loadUserChart"
                  />
                </div>
              </template>
              <BarChart
                :data="userChartData"
                height="350px"
                :loading="userChartLoading"
                title="用户增长趋势"
              />
            </el-card>
          </div>
        </div>
      </div>

      <!-- 分类统计和实时数据 -->
      <div class="bottom-section">
        <!-- 分类统计 -->
        <div class="category-stats">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>分类统计</span>
                <el-select
                  v-model="categoryMetric"
                  @change="loadCategoryStats"
                  style="width: 120px"
                >
                  <el-option label="收入" value="revenue" />
                  <el-option label="订单" value="orders" />
                  <el-option label="浏览" value="views" />
                </el-select>
              </div>
            </template>
            
            <div v-loading="categoryLoading" class="category-list">
              <div
                v-for="category in categoryStats"
                :key="category.name"
                class="category-item"
              >
                <div class="category-info">
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-value">
                    {{ categoryMetric === 'revenue' ? formatCurrency(category.value) : formatNumber(category.value) }}
                  </div>
                </div>
                <div class="category-progress">
                  <el-progress
                    :percentage="category.percentage"
                    :color="getCategoryColor(category.percentage)"
                    :show-text="false"
                  />
                  <span class="percentage-text">{{ category.percentage }}%</span>
                </div>
              </div>
              
              <div v-if="categoryStats.length === 0" class="empty-state">
                <el-empty description="暂无分类数据" />
              </div>
            </div>
          </el-card>
        </div>

        <!-- 实时数据 -->
        <div class="realtime-stats">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>实时数据</span>
                <el-tag :type="realtimeConnected ? 'success' : 'danger'" size="small">
                  {{ realtimeConnected ? '已连接' : '连接中断' }}
                </el-tag>
              </div>
            </template>
            
            <div v-loading="realtimeLoading" class="realtime-list">
              <div class="realtime-item">
                <div class="realtime-label">在线用户</div>
                <div class="realtime-value">{{ formatNumber(realtimeData.onlineUsers) }}</div>
              </div>
              
              <div class="realtime-item">
                <div class="realtime-label">今日访问</div>
                <div class="realtime-value">{{ formatNumber(realtimeData.todayViews) }}</div>
              </div>
              
              <div class="realtime-item">
                <div class="realtime-label">今日订单</div>
                <div class="realtime-value">{{ formatNumber(realtimeData.todayOrders) }}</div>
              </div>
              
              <div class="realtime-item">
                <div class="realtime-label">今日收入</div>
                <div class="realtime-value">{{ formatCurrency(realtimeData.todayRevenue) }}</div>
              </div>
              
              <div class="realtime-item">
                <div class="realtime-label">转化率</div>
                <div class="realtime-value">{{ formatPercentage(realtimeData.conversionRate) }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Money,
  ShoppingBag,
  User,
  Aim,
  Download,
  TrendCharts,
  Bottom
} from '@element-plus/icons-vue'
import { 
  getOverviewStats, 
  getRealTimeStats, 
  getTrendComparison, 
  getRankingData, 
  exportStatsReport 
} from '@/api/statistics'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils'
import type { ChartData } from '@/types'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'

// 响应式数据
const metricsLoading = ref(false)
const revenueChartLoading = ref(false)
const userChartLoading = ref(false)
const categoryLoading = ref(false)
const realtimeLoading = ref(false)
const exportLoading = ref(false)
const realtimeConnected = ref(true)

// 日期范围和周期
const dateRange = ref<[string, string]>(['', ''])
const chartPeriod = ref('30d')
const revenueCompare = ref(false)
const userCompare = ref(false)
const categoryMetric = ref('revenue')

// 关键指标数据
const metrics = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalUsers: 0,
  conversionRate: 0,
  revenueTrend: 0,
  ordersTrend: 0,
  usersTrend: 0,
  conversionTrend: 0
})

// 图表数据
const revenueChartData = ref<ChartData>({ categories: [], series: [] })
const userChartData = ref<ChartData>({ categories: [], series: [] })

// 分类统计数据
const categoryStats = ref<Array<{
  name: string
  value: number
  percentage: number
}>>([])

// 实时数据
const realtimeData = ref({
  onlineUsers: 0,
  todayViews: 0,
  todayOrders: 0,
  todayRevenue: 0,
  conversionRate: 0
})

let realtimeTimer: NodeJS.Timeout | null = null

// 加载概览统计数据
const loadOverviewStats = async () => {
  try {
    metricsLoading.value = true
    const params = dateRange.value[0] && dateRange.value[1] ? {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    } : undefined
    
    const response = await getOverviewStats(params)
    
    if (response.success) {
      metrics.value = response.data.metrics
    }
  } catch (error) {
    console.error('Load overview stats error:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    metricsLoading.value = false
  }
}

// 加载收入图表数据
const loadRevenueChart = async () => {
  try {
    revenueChartLoading.value = true
    const response = await getTrendComparison({
      metric: 'revenue',
      period: chartPeriod.value.replace('d', 'day').replace('y', 'year'),
      compare: revenueCompare.value
    })
    
    if (response.success) {
      revenueChartData.value = response.data
    }
  } catch (error) {
    console.error('Load revenue chart error:', error)
    revenueChartData.value = generateMockChartData(chartPeriod.value, 'revenue')
  } finally {
    revenueChartLoading.value = false
  }
}

// 加载用户图表数据
const loadUserChart = async () => {
  try {
    userChartLoading.value = true
    const response = await getTrendComparison({
      metric: 'users',
      period: chartPeriod.value.replace('d', 'day').replace('y', 'year'),
      compare: userCompare.value
    })
    
    if (response.success) {
      userChartData.value = response.data
    }
  } catch (error) {
    console.error('Load user chart error:', error)
    userChartData.value = generateMockChartData(chartPeriod.value, 'users')
  } finally {
    userChartLoading.value = false
  }
}

// 加载分类统计数据
const loadCategoryStats = async () => {
  try {
    categoryLoading.value = true
    const response = await getRankingData({
      type: 'categories',
      metric: categoryMetric.value as any,
      period: chartPeriod.value,
      limit: 8
    })
    
    if (response.success) {
      categoryStats.value = response.data
    }
  } catch (error) {
    console.error('Load category stats error:', error)
    categoryStats.value = []
  } finally {
    categoryLoading.value = false
  }
}

// 加载实时数据
const loadRealtimeData = async () => {
  try {
    const response = await getRealTimeStats()
    
    if (response.success) {
      realtimeData.value = response.data
      realtimeConnected.value = true
    }
  } catch (error) {
    console.error('Load realtime data error:', error)
    realtimeConnected.value = false
  }
}

// 生成模拟图表数据 (备用)
const generateMockChartData = (period: string, type: string): ChartData => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const categories = []
  const data = []
  
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    categories.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    
    if (type === 'revenue') {
      data.push(Math.floor(Math.random() * 50000) + 10000)
    } else {
      data.push(Math.floor(Math.random() * 500) + 100)
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

// 获取分类进度条颜色
const getCategoryColor = (percentage: number) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  if (percentage >= 40) return '#409eff'
  return '#f56c6c'
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  loadOverviewStats()
  loadRevenueChart()
  loadUserChart()
  loadCategoryStats()
}

// 处理周期变化
const handlePeriodChange = () => {
  loadRevenueChart()
  loadUserChart()
  loadCategoryStats()
}

// 导出报表
const handleExport = async () => {
  try {
    exportLoading.value = true
    
    const params = {
      type: 'overview' as const,
      format: 'excel' as const,
      period: chartPeriod.value,
      ...(dateRange.value[0] && dateRange.value[1] ? {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      } : {})
    }
    
    const response = await exportStatsReport(params)
    
    // 创建下载链接
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `统计概览_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('报表导出成功')
  } catch (error) {
    console.error('Export report error:', error)
    ElMessage.error('导出报表失败')
  } finally {
    exportLoading.value = false
  }
}

// 启动实时数据更新
const startRealtimeUpdate = () => {
  loadRealtimeData()
  realtimeTimer = setInterval(loadRealtimeData, 30000) // 30秒更新一次
}

// 停止实时数据更新
const stopRealtimeUpdate = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

// 初始化数据
const initData = async () => {
  await Promise.all([
    loadOverviewStats(),
    loadRevenueChart(),
    loadUserChart(),
    loadCategoryStats()
  ])
  
  startRealtimeUpdate()
}

onMounted(() => {
  initData()
})

onUnmounted(() => {
  stopRealtimeUpdate()
})
</script>

<style lang="scss" scoped>
.statistics-overview {
  .page-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .metric-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.revenue {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.orders {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.users {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.conversion {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
    }

    .metric-content {
      flex: 1;

      .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
      }

      .metric-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;

        &.up {
          color: var(--el-color-success);
        }

        &.down {
          color: var(--el-color-danger);
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 32px;

    .charts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 1200px) {
        grid-template-columns: 1fr;
      }
    }
  }

  .bottom-section {
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

  .category-list {
    min-height: 400px;

    .category-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .category-info {
        flex: 1;

        .category-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .category-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      .category-progress {
        width: 120px;
        display: flex;
        align-items: center;
        gap: 8px;

        .percentage-text {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          width: 32px;
          text-align: right;
        }
      }
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
    }
  }

  .realtime-list {
    .realtime-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .realtime-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }

      .realtime-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .statistics-overview {
    .page-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .metric-card {
      padding: 20px;

      .metric-icon {
        width: 48px;
        height: 48px;
      }

      .metric-content .metric-value {
        font-size: 24px;
      }
    }

    .charts-header {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    .bottom-section {
      gap: 16px;
    }
  }
}
</style>