<template>
  <div class="revenue-statistics">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">收入统计</h1>
        <p class="page-description">深入分析收入趋势，优化盈利策略</p>
        
        <div class="page-actions">
          <el-select
            v-model="revenueType"
            @change="handleTypeChange"
            style="width: 120px"
          >
            <el-option label="总收入" value="total" />
            <el-option label="净收入" value="net" />
            <el-option label="毛利润" value="gross" />
          </el-select>
          
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
          
          <el-button-group>
            <el-button 
              :type="viewMode === 'chart' ? 'primary' : 'default'"
              @click="viewMode = 'chart'"
            >
              <el-icon><TrendCharts /></el-icon>
              图表视图
            </el-button>
            <el-button 
              :type="viewMode === 'table' ? 'primary' : 'default'"
              @click="viewMode = 'table'"
            >
              <el-icon><Grid /></el-icon>
              表格视图
            </el-button>
          </el-button-group>
          
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

      <!-- 收入指标卡片 -->
      <div class="revenue-metrics" v-loading="metricsLoading">
        <div class="metric-card primary">
          <div class="metric-icon">
            <el-icon size="32"><Money /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">总收入</div>
            <div class="metric-value">{{ formatCurrency(metrics.totalRevenue) }}</div>
            <div class="metric-trend" :class="metrics.revenueTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.revenueTrend >= 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
              {{ Math.abs(metrics.revenueTrend) }}% vs 上期
            </div>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon">
            <el-icon size="32"><Wallet /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">净收入</div>
            <div class="metric-value">{{ formatCurrency(metrics.netRevenue) }}</div>
            <div class="metric-trend" :class="metrics.netTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.netTrend >= 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
              {{ Math.abs(metrics.netTrend) }}% vs 上期
            </div>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon">
            <el-icon size="32"><PieChart /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">利润率</div>
            <div class="metric-value">{{ formatPercentage(metrics.profitMargin) }}</div>
            <div class="metric-trend" :class="metrics.marginTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.marginTrend >= 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
              {{ Math.abs(metrics.marginTrend) }}% vs 上期
            </div>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-icon">
            <el-icon size="32"><DataAnalysis /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">平均订单价值</div>
            <div class="metric-value">{{ formatCurrency(metrics.avgOrderValue) }}</div>
            <div class="metric-trend" :class="metrics.aovTrend >= 0 ? 'up' : 'down'">
              <el-icon><component :is="metrics.aovTrend >= 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
              {{ Math.abs(metrics.aovTrend) }}% vs 上期
            </div>
          </div>
        </div>
      </div>

      <!-- 图表视图 -->
      <div v-show="viewMode === 'chart'" class="chart-view">
        <!-- 收入趋势图表 -->
        <div class="chart-section">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>收入趋势分析</span>
                <div class="chart-controls">
                  <el-switch
                    v-model="compareMode"
                    inline-prompt
                    active-text="对比"
                    inactive-text="单期"
                    @change="loadRevenueChart"
                  />
                  <el-radio-group v-model="chartPeriod" @change="handlePeriodChange">
                    <el-radio-button label="7d">7天</el-radio-button>
                    <el-radio-button label="30d">30天</el-radio-button>
                    <el-radio-button label="90d">90天</el-radio-button>
                    <el-radio-button label="1y">1年</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            
            <LineChart
              :data="revenueChartData"
              height="400px"
              :loading="revenueChartLoading"
            />
          </el-card>
        </div>

        <!-- 分析图表网格 -->
        <div class="analysis-charts">
          <!-- 收入来源分布 -->
          <div class="chart-item">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>收入来源分布</span>
                  <el-select
                    v-model="sourceMetric"
                    @change="loadSourceChart"
                    size="small"
                    style="width: 100px"
                  >
                    <el-option label="按产品" value="product" />
                    <el-option label="按分类" value="category" />
                    <el-option label="按渠道" value="channel" />
                  </el-select>
                </div>
              </template>
              
              <PieChart
                :data="sourceChartData"
                height="350px"
                :loading="sourceChartLoading"
                :radius="['30%', '70%']"
              />
            </el-card>
          </div>

          <!-- 月度收入对比 -->
          <div class="chart-item">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>月度收入对比</span>
                  <el-select
                    v-model="monthlyType"
                    @change="loadMonthlyChart"
                    size="small"
                    style="width: 100px"
                  >
                    <el-option label="总收入" value="total" />
                    <el-option label="净收入" value="net" />
                    <el-option label="利润" value="profit" />
                  </el-select>
                </div>
              </template>
              
              <BarChart
                :data="monthlyChartData"
                height="350px"
                :loading="monthlyChartLoading"
              />
            </el-card>
          </div>

          <!-- 收入预测 -->
          <div class="chart-item full-width">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>收入预测模型</span>
                  <div class="forecast-controls">
                    <el-select
                      v-model="forecastModel"
                      @change="loadForecastChart"
                      size="small"
                      style="width: 120px"
                    >
                      <el-option label="线性回归" value="linear" />
                      <el-option label="指数增长" value="exponential" />
                      <el-option label="季节性" value="seasonal" />
                    </el-select>
                    <span class="forecast-accuracy">
                      预测准确率: {{ forecastAccuracy }}%
                    </span>
                  </div>
                </div>
              </template>
              
              <LineChart
                :data="forecastChartData"
                height="350px"
                :loading="forecastChartLoading"
                :smooth="true"
              />
            </el-card>
          </div>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-show="viewMode === 'table'" class="table-view">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>详细收入数据</span>
              <div class="table-actions">
                <el-select
                  v-model="tableGroupBy"
                  @change="loadTableData"
                  style="width: 120px"
                >
                  <el-option label="按日期" value="date" />
                  <el-option label="按产品" value="product" />
                  <el-option label="按分类" value="category" />
                  <el-option label="按渠道" value="channel" />
                </el-select>
                
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索..."
                  @input="handleSearch"
                  style="width: 200px"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>
          </template>
          
          <el-table
            :data="tableData"
            v-loading="tableLoading"
            @sort-change="handleSortChange"
            stripe
            show-summary
            :summary-method="getSummaries"
          >
            <el-table-column 
              :prop="getTableColumnProp('name')" 
              :label="getTableColumnLabel()" 
              min-width="150"
              sortable
            />
            
            <el-table-column 
              prop="totalRevenue" 
              label="总收入" 
              width="120" 
              sortable
            >
              <template #default="{ row }">
                {{ formatCurrency(row.totalRevenue) }}
              </template>
            </el-table-column>
            
            <el-table-column 
              prop="netRevenue" 
              label="净收入" 
              width="120" 
              sortable
            >
              <template #default="{ row }">
                {{ formatCurrency(row.netRevenue) }}
              </template>
            </el-table-column>
            
            <el-table-column 
              prop="profit" 
              label="利润" 
              width="120" 
              sortable
            >
              <template #default="{ row }">
                <span :class="row.profit >= 0 ? 'positive' : 'negative'">
                  {{ formatCurrency(row.profit) }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column 
              prop="profitMargin" 
              label="利润率" 
              width="100" 
              sortable
            >
              <template #default="{ row }">
                <el-tag 
                  :type="getProfitMarginType(row.profitMargin)"
                  size="small"
                >
                  {{ formatPercentage(row.profitMargin) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column 
              prop="orders" 
              label="订单数" 
              width="100" 
              sortable
            >
              <template #default="{ row }">
                {{ formatNumber(row.orders) }}
              </template>
            </el-table-column>
            
            <el-table-column 
              prop="avgOrderValue" 
              label="客单价" 
              width="120" 
              sortable
            >
              <template #default="{ row }">
                {{ formatCurrency(row.avgOrderValue) }}
              </template>
            </el-table-column>
            
            <el-table-column 
              prop="growth" 
              label="增长率" 
              width="100" 
              sortable
            >
              <template #default="{ row }">
                <div class="growth-cell" :class="row.growth >= 0 ? 'positive' : 'negative'">
                  <el-icon><component :is="row.growth >= 0 ? 'CaretTop' : 'CaretBottom'" /></el-icon>
                  {{ Math.abs(row.growth) }}%
                </div>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="table-pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 收入洞察 -->
      <div class="insights-section">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>收入洞察</span>
              <el-tag type="info" size="small">AI 分析</el-tag>
            </div>
          </template>
          
          <div v-loading="insightsLoading" class="insights-content">
            <div class="insight-item" v-for="insight in insights" :key="insight.id">
              <div class="insight-icon" :class="insight.type">
                <el-icon size="20">
                  <component :is="getInsightIcon(insight.type)" />
                </el-icon>
              </div>
              <div class="insight-content">
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-description">{{ insight.description }}</div>
                <div class="insight-impact" :class="insight.impact">
                  预计影响: {{ insight.impactText }}
                </div>
              </div>
            </div>
            
            <div v-if="insights.length === 0" class="empty-insights">
              <el-empty description="暂无洞察信息" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Money,
  Wallet,
  PieChart,
  DataAnalysis,
  TrendCharts,
  Grid,
  Download,
  Search,
  CaretTop,
  CaretBottom,
  TrendUp,
  Warning,
  InfoFilled,
  CircleCheck
} from '@element-plus/icons-vue'
import { 
  getRevenueStats, 
  getTrendComparison, 
  getRankingData, 
  exportStatsReport 
} from '@/api/statistics'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils'
import type { ChartData } from '@/types'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// 响应式数据
const metricsLoading = ref(false)
const revenueChartLoading = ref(false)
const sourceChartLoading = ref(false)
const monthlyChartLoading = ref(false)
const forecastChartLoading = ref(false)
const tableLoading = ref(false)
const insightsLoading = ref(false)
const exportLoading = ref(false)

// 视图控制
const viewMode = ref<'chart' | 'table'>('chart')
const revenueType = ref('total')
const dateRange = ref<[string, string]>(['', ''])

// 图表控制
const compareMode = ref(false)
const chartPeriod = ref('30d')
const sourceMetric = ref('product')
const monthlyType = ref('total')
const forecastModel = ref('linear')
const forecastAccuracy = ref(85)

// 表格控制
const tableGroupBy = ref('date')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 指标数据
const metrics = ref({
  totalRevenue: 0,
  netRevenue: 0,
  profitMargin: 0,
  avgOrderValue: 0,
  revenueTrend: 0,
  netTrend: 0,
  marginTrend: 0,
  aovTrend: 0
})

// 图表数据
const revenueChartData = ref<ChartData>({ categories: [], series: [] })
const sourceChartData = ref<ChartData>({ categories: [], series: [] })
const monthlyChartData = ref<ChartData>({ categories: [], series: [] })
const forecastChartData = ref<ChartData>({ categories: [], series: [] })

// 表格数据
const tableData = ref<Array<{
  name: string
  totalRevenue: number
  netRevenue: number
  profit: number
  profitMargin: number
  orders: number
  avgOrderValue: number
  growth: number
}>>([])

// 洞察数据
const insights = ref<Array<{
  id: number
  type: 'trend' | 'warning' | 'opportunity' | 'achievement'
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  impactText: string
}>>([])

// 计算属性
const getTableColumnProp = (defaultProp: string) => {
  const propMap = {
    date: 'date',
    product: 'productName',
    category: 'categoryName',
    channel: 'channelName'
  }
  return propMap[tableGroupBy.value as keyof typeof propMap] || defaultProp
}

const getTableColumnLabel = () => {
  const labelMap = {
    date: '日期',
    product: '产品名称',
    category: '分类名称',
    channel: '渠道名称'
  }
  return labelMap[tableGroupBy.value as keyof typeof labelMap] || '名称'
}

// 加载收入指标
const loadRevenueMetrics = async () => {
  try {
    metricsLoading.value = true
    const params = {
      type: revenueType.value,
      ...(dateRange.value[0] && dateRange.value[1] && {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      })
    }
    
    const response = await getRevenueStats(params)
    
    if (response.success) {
      metrics.value = response.data.metrics
    }
  } catch (error) {
    console.error('Load revenue metrics error:', error)
    ElMessage.error('加载收入指标失败')
  } finally {
    metricsLoading.value = false
  }
}

// 加载收入图表
const loadRevenueChart = async () => {
  try {
    revenueChartLoading.value = true
    const response = await getTrendComparison({
      metric: 'revenue',
      period: chartPeriod.value.replace('d', 'day').replace('y', 'year'),
      compare: compareMode.value
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

// 加载收入来源图表
const loadSourceChart = async () => {
  try {
    sourceChartLoading.value = true
    const response = await getRankingData({
      type: sourceMetric.value === 'product' ? 'products' : 
            sourceMetric.value === 'category' ? 'categories' : 'channels',
      metric: 'revenue',
      period: chartPeriod.value,
      limit: 8
    })
    
    if (response.success) {
      sourceChartData.value = {
        categories: response.data.map((item: any) => item.name),
        series: [{
          name: '收入',
          data: response.data.map((item: any) => item.value)
        }]
      }
    }
  } catch (error) {
    console.error('Load source chart error:', error)
    sourceChartData.value = { categories: [], series: [] }
  } finally {
    sourceChartLoading.value = false
  }
}

// 加载月度图表
const loadMonthlyChart = async () => {
  try {
    monthlyChartLoading.value = true
    const response = await getTrendComparison({
      metric: 'revenue',
      period: 'month'
    })
    
    if (response.success) {
      monthlyChartData.value = response.data
    }
  } catch (error) {
    console.error('Load monthly chart error:', error)
    monthlyChartData.value = generateMockChartData('12m', 'revenue')
  } finally {
    monthlyChartLoading.value = false
  }
}

// 加载预测图表
const loadForecastChart = async () => {
  try {
    forecastChartLoading.value = true
    
    // 模拟预测数据
    const historical = generateMockChartData('30d', 'revenue')
    const future = generateMockChartData('30d', 'revenue', 30) // 未来30天
    
    forecastChartData.value = {
      categories: [...historical.categories, ...future.categories],
      series: [
        {
          name: '历史收入',
          data: [...historical.series[0].data, ...Array(30).fill(null)]
        },
        {
          name: '预测收入',
          data: [...Array(30).fill(null), ...future.series[0].data]
        }
      ]
    }
    
    forecastChartLoading.value = false
  } catch (error) {
    console.error('Load forecast chart error:', error)
    forecastChartData.value = { categories: [], series: [] }
    forecastChartLoading.value = false
  }
}

// 加载表格数据
const loadTableData = async () => {
  try {
    tableLoading.value = true
    const params = {
      type: tableGroupBy.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      ...(searchKeyword.value && { search: searchKeyword.value })
    }
    
    const response = await getRevenueStats(params)
    
    if (response.success) {
      tableData.value = response.data.details
      total.value = response.data.total
    }
  } catch (error) {
    console.error('Load table data error:', error)
    tableData.value = []
  } finally {
    tableLoading.value = false
  }
}

// 加载洞察数据
const loadInsights = async () => {
  try {
    insightsLoading.value = true
    
    // 模拟洞察数据
    insights.value = [
      {
        id: 1,
        type: 'trend',
        title: '收入持续增长',
        description: '过去30天收入环比增长15.2%，主要来源于电子产品类别的强劲表现',
        impact: 'positive',
        impactText: '+¥45,000预期收入'
      },
      {
        id: 2,
        type: 'warning',
        title: '利润率下降',
        description: '本月利润率相比上月下降2.8%，可能受到成本上涨和促销活动影响',
        impact: 'negative',
        impactText: '-3.2%利润率影响'
      },
      {
        id: 3,
        type: 'opportunity',
        title: '优化定价策略',
        description: '通过调整低利润产品定价，预计可提升整体利润率5-8%',
        impact: 'positive',
        impactText: '+¥28,000月收入'
      }
    ]
    
    insightsLoading.value = false
  } catch (error) {
    console.error('Load insights error:', error)
    insights.value = []
    insightsLoading.value = false
  }
}

// 生成模拟图表数据
const generateMockChartData = (period: string, type: string, offsetDays = 0): ChartData => {
  const days = period === '7d' ? 7 : 
               period === '30d' ? 30 : 
               period === '90d' ? 90 : 
               period === '12m' ? 12 : 365
  
  const categories = []
  const data = []
  
  const now = new Date()
  now.setDate(now.getDate() + offsetDays)
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    if (period === '12m') {
      date.setMonth(date.getMonth() - i)
      categories.push(date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }))
    } else {
      date.setDate(date.getDate() - i)
      categories.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))
    }
    
    const baseValue = type === 'revenue' ? 50000 : 1000
    const variance = type === 'revenue' ? 20000 : 200
    data.push(Math.floor(Math.random() * variance + baseValue))
  }
  
  return {
    categories,
    series: [{
      name: type === 'revenue' ? '收入' : '数据',
      data
    }]
  }
}

// 获取洞察图标
const getInsightIcon = (type: string) => {
  const iconMap = {
    trend: TrendUp,
    warning: Warning,
    opportunity: InfoFilled,
    achievement: CircleCheck
  }
  return iconMap[type as keyof typeof iconMap] || InfoFilled
}

// 获取利润率标签类型
const getProfitMarginType = (margin: number) => {
  if (margin >= 0.3) return 'success'
  if (margin >= 0.15) return 'warning'
  return 'danger'
}

// 表格汇总方法
const getSummaries = (param: any) => {
  const { columns, data } = param
  const sums: string[] = []
  
  columns.forEach((column: any, index: number) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    
    const values = data.map((item: any) => Number(item[column.property]))
    if (values.every((value: number) => !isNaN(value))) {
      const sum = values.reduce((prev: number, curr: number) => prev + curr, 0)
      
      if (['totalRevenue', 'netRevenue', 'profit', 'avgOrderValue'].includes(column.property)) {
        sums[index] = formatCurrency(sum)
      } else if (column.property === 'profitMargin') {
        sums[index] = formatPercentage(sum / data.length)
      } else {
        sums[index] = formatNumber(sum)
      }
    } else {
      sums[index] = '-'
    }
  })
  
  return sums
}

// 事件处理
const handleTypeChange = () => {
  loadRevenueMetrics()
}

const handleDateRangeChange = () => {
  loadRevenueMetrics()
  loadRevenueChart()
  loadTableData()
}

const handlePeriodChange = () => {
  loadRevenueChart()
  loadSourceChart()
}

const handleSearch = () => {
  currentPage.value = 1
  loadTableData()
}

const handleSortChange = () => {
  loadTableData()
}

const handlePageChange = () => {
  loadTableData()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadTableData()
}

// 导出报表
const handleExport = async () => {
  try {
    exportLoading.value = true
    
    const params = {
      type: 'revenue' as const,
      format: 'excel' as const,
      period: chartPeriod.value,
      ...(dateRange.value[0] && dateRange.value[1] && {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      })
    }
    
    const response = await exportStatsReport(params)
    
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `收入统计_${new Date().toISOString().slice(0, 10)}.xlsx`
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

// 初始化
const initData = async () => {
  await Promise.all([
    loadRevenueMetrics(),
    loadRevenueChart(),
    loadSourceChart(),
    loadMonthlyChart(),
    loadTableData(),
    loadInsights()
  ])
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.revenue-statistics {
  .page-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .revenue-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .metric-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }

    &.primary {
      &::before {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
      .metric-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    &.success {
      &::before {
        background: linear-gradient(90deg, #56ab2f 0%, #a8e6cf 100%);
      }
      .metric-icon {
        background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
      }
    }

    &.warning {
      &::before {
        background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
      }
      .metric-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
    }

    &.info {
      &::before {
        background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      }
      .metric-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }

    .metric-icon {
      width: 72px;
      height: 72px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .metric-content {
      flex: 1;

      .metric-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
        font-weight: 500;
      }

      .metric-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        line-height: 1.2;
      }

      .metric-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
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

  .chart-view {
    margin-bottom: 32px;
  }

  .chart-section {
    margin-bottom: 24px;
  }

  .analysis-charts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    .chart-item {
      &.full-width {
        grid-column: 1 / -1;
      }
    }

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

    .chart-controls,
    .table-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .forecast-controls {
      display: flex;
      gap: 12px;
      align-items: center;

      .forecast-accuracy {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .table-view {
    margin-bottom: 32px;

    .positive {
      color: var(--el-color-success);
    }

    .negative {
      color: var(--el-color-danger);
    }

    .growth-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .table-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .insights-section {
    .insights-content {
      .insight-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 20px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
        }

        .insight-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.trend {
            background-color: var(--el-color-success-light-9);
            color: var(--el-color-success);
          }

          &.warning {
            background-color: var(--el-color-warning-light-9);
            color: var(--el-color-warning);
          }

          &.opportunity {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
          }

          &.achievement {
            background-color: var(--el-color-success-light-9);
            color: var(--el-color-success);
          }
        }

        .insight-content {
          flex: 1;

          .insight-title {
            font-weight: 600;
            font-size: 16px;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          }

          .insight-description {
            color: var(--el-text-color-regular);
            line-height: 1.6;
            margin-bottom: 8px;
          }

          .insight-impact {
            font-size: 13px;
            font-weight: 500;

            &.positive {
              color: var(--el-color-success);
            }

            &.negative {
              color: var(--el-color-danger);
            }

            &.neutral {
              color: var(--el-text-color-secondary);
            }
          }
        }
      }

      .empty-insights {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .revenue-statistics {
    .page-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .revenue-metrics {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .metric-card {
      padding: 20px;
      flex-direction: column;
      text-align: center;

      .metric-icon {
        width: 64px;
        height: 64px;
      }

      .metric-content .metric-value {
        font-size: 28px;
      }
    }

    .analysis-charts {
      gap: 16px;
    }

    .card-header {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;

      .chart-controls,
      .table-actions {
        justify-content: center;
      }
    }

    .insight-item {
      flex-direction: column;

      .insight-icon {
        align-self: flex-start;
      }
    }
  }
}
</style>