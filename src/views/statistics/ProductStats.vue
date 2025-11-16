<template>
  <div class="product-statistics">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">产品统计</h1>
        <p class="page-description">分析产品表现，优化产品策略</p>
        
        <div class="page-actions">
          <el-select
            v-model="selectedCategory"
            clearable
            placeholder="选择分类"
            @change="handleCategoryChange"
            style="width: 150px"
          >
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
          
          <el-select
            v-model="selectedProduct"
            clearable
            placeholder="选择产品"
            @change="handleProductChange"
            style="width: 200px"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
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
          
          <el-button 
            type="primary" 
            :loading="exportLoading"
            @click="handleExport"
          >
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>

      <!-- 产品概览指标 -->
      <div class="product-metrics" v-loading="metricsLoading">
        <div class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon"><Goods /></el-icon>
            <span class="metric-title">总产品数</span>
          </div>
          <div class="metric-value">{{ formatNumber(productMetrics.totalProducts) }}</div>
          <div class="metric-change" :class="productMetrics.productsChange >= 0 ? 'positive' : 'negative'">
            <el-icon><component :is="productMetrics.productsChange >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            {{ Math.abs(productMetrics.productsChange) }}%
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon"><View /></el-icon>
            <span class="metric-title">总浏览量</span>
          </div>
          <div class="metric-value">{{ formatNumber(productMetrics.totalViews) }}</div>
          <div class="metric-change" :class="productMetrics.viewsChange >= 0 ? 'positive' : 'negative'">
            <el-icon><component :is="productMetrics.viewsChange >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            {{ Math.abs(productMetrics.viewsChange) }}%
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon"><ShoppingCart /></el-icon>
            <span class="metric-title">总销量</span>
          </div>
          <div class="metric-value">{{ formatNumber(productMetrics.totalSales) }}</div>
          <div class="metric-change" :class="productMetrics.salesChange >= 0 ? 'positive' : 'negative'">
            <el-icon><component :is="productMetrics.salesChange >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            {{ Math.abs(productMetrics.salesChange) }}%
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <el-icon class="metric-icon"><TrendCharts /></el-icon>
            <span class="metric-title">平均转化率</span>
          </div>
          <div class="metric-value">{{ formatPercentage(productMetrics.avgConversionRate) }}</div>
          <div class="metric-change" :class="productMetrics.conversionChange >= 0 ? 'positive' : 'negative'">
            <el-icon><component :is="productMetrics.conversionChange >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
            {{ Math.abs(productMetrics.conversionChange) }}%
          </div>
        </div>
      </div>

      <!-- 产品表现图表 -->
      <div class="charts-section">
        <div class="charts-tabs">
          <el-tabs v-model="activeChartTab" @tab-change="handleTabChange">
            <el-tab-pane label="销售趋势" name="sales">
              <div class="chart-container">
                <div class="chart-header">
                  <h3>销售趋势分析</h3>
                  <el-radio-group v-model="salesPeriod" @change="loadSalesChart">
                    <el-radio-button label="7d">7天</el-radio-button>
                    <el-radio-button label="30d">30天</el-radio-button>
                    <el-radio-button label="90d">90天</el-radio-button>
                  </el-radio-group>
                </div>
                <LineChart
                  :data="salesChartData"
                  height="400px"
                  :loading="salesChartLoading"
                  title="产品销售趋势"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="浏览分析" name="views">
              <div class="chart-container">
                <div class="chart-header">
                  <h3>浏览量分析</h3>
                  <el-radio-group v-model="viewsPeriod" @change="loadViewsChart">
                    <el-radio-button label="7d">7天</el-radio-button>
                    <el-radio-button label="30d">30天</el-radio-button>
                    <el-radio-button label="90d">90天</el-radio-button>
                  </el-radio-group>
                </div>
                <BarChart
                  :data="viewsChartData"
                  height="400px"
                  :loading="viewsChartLoading"
                  title="产品浏览量分析"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="分类对比" name="category">
              <div class="chart-container">
                <div class="chart-header">
                  <h3>分类表现对比</h3>
                  <el-select
                    v-model="categoryMetric"
                    @change="loadCategoryChart"
                    style="width: 120px"
                  >
                    <el-option label="销量" value="sales" />
                    <el-option label="收入" value="revenue" />
                    <el-option label="浏览" value="views" />
                  </el-select>
                </div>
                <div class="category-chart-wrapper">
                  <PieChart
                    :data="categoryChartData"
                    height="400px"
                    :loading="categoryChartLoading"
                    title="分类表现分布"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 产品排行榜和详细数据 -->
      <div class="bottom-section">
        <!-- 产品排行榜 -->
        <div class="product-rankings">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>产品排行榜</span>
                <el-select
                  v-model="rankingMetric"
                  @change="loadProductRankings"
                  style="width: 100px"
                >
                  <el-option label="销量" value="sales" />
                  <el-option label="收入" value="revenue" />
                  <el-option label="浏览" value="views" />
                </el-select>
              </div>
            </template>
            
            <div v-loading="rankingLoading" class="ranking-list">
              <div
                v-for="(item, index) in productRankings"
                :key="item.id"
                class="ranking-item"
                :class="{ 'top-three': index < 3 }"
              >
                <div class="ranking-position">
                  <span class="position-number" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
                </div>
                
                <div class="product-info">
                  <div class="product-image">
                    <img :src="item.image || '/placeholder-product.png'" :alt="item.name" />
                  </div>
                  <div class="product-details">
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-category">{{ item.category }}</div>
                  </div>
                </div>
                
                <div class="ranking-metrics">
                  <div class="metric-value">
                    {{ formatMetricValue(item[rankingMetric], rankingMetric) }}
                  </div>
                  <div class="metric-trend" :class="item.trend >= 0 ? 'up' : 'down'">
                    <el-icon><component :is="item.trend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
                    {{ Math.abs(item.trend) }}%
                  </div>
                </div>
              </div>
              
              <div v-if="productRankings.length === 0" class="empty-state">
                <el-empty description="暂无排行数据" />
              </div>
            </div>
          </el-card>
        </div>

        <!-- 产品详细数据表格 -->
        <div class="product-table">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>产品详细数据</span>
                <div class="table-actions">
                  <el-input
                    v-model="searchKeyword"
                    placeholder="搜索产品"
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
              :data="productTableData"
              v-loading="tableLoading"
              @sort-change="handleSortChange"
            >
              <el-table-column prop="name" label="产品名称" min-width="150">
                <template #default="{ row }">
                  <div class="product-cell">
                    <img :src="row.image || '/placeholder-product.png'" :alt="row.name" class="product-thumb" />
                    <div>
                      <div class="product-name">{{ row.name }}</div>
                      <div class="product-sku">SKU: {{ row.sku }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="category" label="分类" width="120" />
              
              <el-table-column prop="price" label="价格" width="100" sortable>
                <template #default="{ row }">
                  {{ formatCurrency(row.price) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="views" label="浏览量" width="100" sortable>
                <template #default="{ row }">
                  {{ formatNumber(row.views) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="sales" label="销量" width="100" sortable>
                <template #default="{ row }">
                  {{ formatNumber(row.sales) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="revenue" label="收入" width="120" sortable>
                <template #default="{ row }">
                  {{ formatCurrency(row.revenue) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="conversionRate" label="转化率" width="100" sortable>
                <template #default="{ row }">
                  {{ formatPercentage(row.conversionRate) }}
                </template>
              </el-table-column>
              
              <el-table-column prop="stock" label="库存" width="80">
                <template #default="{ row }">
                  <el-tag :type="getStockTagType(row.stock)">
                    {{ row.stock }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    size="small"
                    @click="viewProductDetail(row)"
                    link
                  >
                    详情
                  </el-button>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Goods,
  View,
  ShoppingCart,
  TrendCharts,
  Download,
  Search,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import { 
  getProductStats, 
  getRankingData, 
  getTrendComparison, 
  exportStatsReport 
} from '@/api/statistics'
import { getProducts } from '@/api/products'
import { formatCurrency, formatNumber, formatPercentage } from '@/utils'
import type { ChartData, Product } from '@/types'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// 响应式数据
const metricsLoading = ref(false)
const salesChartLoading = ref(false)
const viewsChartLoading = ref(false)
const categoryChartLoading = ref(false)
const rankingLoading = ref(false)
const tableLoading = ref(false)
const exportLoading = ref(false)

// 筛选条件
const selectedCategory = ref('')
const selectedProduct = ref<number>()
const dateRange = ref<[string, string]>(['', ''])
const searchKeyword = ref('')

// 图表和表格状态
const activeChartTab = ref('sales')
const salesPeriod = ref('30d')
const viewsPeriod = ref('30d')
const categoryMetric = ref('sales')
const rankingMetric = ref('sales')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 基础数据
const categories = ref([
  { label: '电子产品', value: 'electronics' },
  { label: '服装配饰', value: 'fashion' },
  { label: '家居用品', value: 'home' },
  { label: '运动健身', value: 'sports' }
])
const products = ref<Product[]>([])

// 指标数据
const productMetrics = ref({
  totalProducts: 0,
  totalViews: 0,
  totalSales: 0,
  avgConversionRate: 0,
  productsChange: 0,
  viewsChange: 0,
  salesChange: 0,
  conversionChange: 0
})

// 图表数据
const salesChartData = ref<ChartData>({ categories: [], series: [] })
const viewsChartData = ref<ChartData>({ categories: [], series: [] })
const categoryChartData = ref<ChartData>({ categories: [], series: [] })

// 排行榜数据
const productRankings = ref<Array<{
  id: number
  name: string
  category: string
  image: string
  sales: number
  revenue: number
  views: number
  trend: number
}>>([])

// 表格数据
const productTableData = ref<Array<{
  id: number
  name: string
  sku: string
  category: string
  price: number
  image: string
  views: number
  sales: number
  revenue: number
  conversionRate: number
  stock: number
}>>([])

// 加载产品列表
const loadProducts = async () => {
  try {
    const response = await getProducts({ pageSize: 1000 })
    if (response.success) {
      products.value = response.data.items
    }
  } catch (error) {
    console.error('Load products error:', error)
  }
}

// 加载产品统计指标
const loadProductMetrics = async () => {
  try {
    metricsLoading.value = true
    const params = {
      ...(selectedCategory.value && { category: selectedCategory.value }),
      ...(selectedProduct.value && { productId: selectedProduct.value }),
      ...(dateRange.value[0] && dateRange.value[1] && {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1]
      })
    }
    
    const response = await getProductStats(params)
    
    if (response.success) {
      productMetrics.value = response.data.metrics
    }
  } catch (error) {
    console.error('Load product metrics error:', error)
    ElMessage.error('加载产品指标失败')
  } finally {
    metricsLoading.value = false
  }
}

// 加载销售图表
const loadSalesChart = async () => {
  try {
    salesChartLoading.value = true
    const response = await getTrendComparison({
      metric: 'orders',
      period: salesPeriod.value.replace('d', 'day')
    })
    
    if (response.success) {
      salesChartData.value = response.data
    }
  } catch (error) {
    console.error('Load sales chart error:', error)
    salesChartData.value = generateMockChartData(salesPeriod.value, 'sales')
  } finally {
    salesChartLoading.value = false
  }
}

// 加载浏览量图表
const loadViewsChart = async () => {
  try {
    viewsChartLoading.value = true
    const response = await getTrendComparison({
      metric: 'views',
      period: viewsPeriod.value.replace('d', 'day')
    })
    
    if (response.success) {
      viewsChartData.value = response.data
    }
  } catch (error) {
    console.error('Load views chart error:', error)
    viewsChartData.value = generateMockChartData(viewsPeriod.value, 'views')
  } finally {
    viewsChartLoading.value = false
  }
}

// 加载分类图表
const loadCategoryChart = async () => {
  try {
    categoryChartLoading.value = true
    const response = await getRankingData({
      type: 'categories',
      metric: categoryMetric.value as any,
      period: '30d'
    })
    
    if (response.success) {
      categoryChartData.value = {
        categories: response.data.map((item: any) => item.name),
        series: [{
          name: categoryMetric.value === 'sales' ? '销量' : 
                categoryMetric.value === 'revenue' ? '收入' : '浏览量',
          data: response.data.map((item: any) => item.value)
        }]
      }
    }
  } catch (error) {
    console.error('Load category chart error:', error)
    categoryChartData.value = { categories: [], series: [] }
  } finally {
    categoryChartLoading.value = false
  }
}

// 加载产品排行榜
const loadProductRankings = async () => {
  try {
    rankingLoading.value = true
    const response = await getRankingData({
      type: 'products',
      metric: rankingMetric.value as any,
      period: '30d',
      limit: 10
    })
    
    if (response.success) {
      productRankings.value = response.data
    }
  } catch (error) {
    console.error('Load product rankings error:', error)
    productRankings.value = []
  } finally {
    rankingLoading.value = false
  }
}

// 加载产品表格数据
const loadProductTableData = async () => {
  try {
    tableLoading.value = true
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...(searchKeyword.value && { search: searchKeyword.value }),
      ...(selectedCategory.value && { category: selectedCategory.value })
    }
    
    const response = await getProductStats(params)
    
    if (response.success) {
      productTableData.value = response.data.products
      total.value = response.data.total
    }
  } catch (error) {
    console.error('Load product table data error:', error)
    productTableData.value = []
  } finally {
    tableLoading.value = false
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
    
    if (type === 'sales') {
      data.push(Math.floor(Math.random() * 200) + 50)
    } else {
      data.push(Math.floor(Math.random() * 2000) + 500)
    }
  }
  
  return {
    categories,
    series: [{
      name: type === 'sales' ? '销量' : '浏览量',
      data
    }]
  }
}

// 格式化指标值
const formatMetricValue = (value: number, metric: string) => {
  switch (metric) {
    case 'revenue':
      return formatCurrency(value)
    case 'sales':
    case 'views':
      return formatNumber(value)
    default:
      return value
  }
}

// 获取库存标签类型
const getStockTagType = (stock: number) => {
  if (stock === 0) return 'danger'
  if (stock < 10) return 'warning'
  return 'success'
}

// 查看产品详情
const viewProductDetail = (product: any) => {
  // 导航到产品详情页
  console.log('View product detail:', product)
}

// 事件处理
const handleCategoryChange = () => {
  loadProductMetrics()
  loadProductTableData()
}

const handleProductChange = () => {
  loadProductMetrics()
}

const handleDateRangeChange = () => {
  loadProductMetrics()
}

const handleTabChange = () => {
  if (activeChartTab.value === 'sales') {
    loadSalesChart()
  } else if (activeChartTab.value === 'views') {
    loadViewsChart()
  } else if (activeChartTab.value === 'category') {
    loadCategoryChart()
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProductTableData()
}

const handleSortChange = () => {
  loadProductTableData()
}

const handlePageChange = () => {
  loadProductTableData()
}

const handleSizeChange = () => {
  currentPage.value = 1
  loadProductTableData()
}

// 导出数据
const handleExport = async () => {
  try {
    exportLoading.value = true
    
    const params = {
      type: 'products' as const,
      format: 'excel' as const,
      period: '30d',
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
    a.download = `产品统计_${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('Export data error:', error)
    ElMessage.error('导出数据失败')
  } finally {
    exportLoading.value = false
  }
}

// 初始化
const initData = async () => {
  await Promise.all([
    loadProducts(),
    loadProductMetrics(),
    loadSalesChart(),
    loadProductRankings(),
    loadProductTableData()
  ])
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.product-statistics {
  .page-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .product-metrics {
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
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .metric-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .metric-icon {
        color: var(--el-color-primary);
      }

      .metric-title {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .metric-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;

      &.positive {
        color: var(--el-color-success);
      }

      &.negative {
        color: var(--el-color-danger);
      }
    }
  }

  .charts-section {
    margin-bottom: 32px;

    .charts-tabs {
      .chart-container {
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }
        }

        .category-chart-wrapper {
          display: flex;
          justify-content: center;
        }
      }
    }
  }

  .bottom-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
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

    .table-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .ranking-list {
    .ranking-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      &.top-three {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
        border-radius: 8px;
        padding: 16px;
        margin: 8px 0;
      }

      .ranking-position {
        .position-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-weight: bold;
          font-size: 16px;

          &.rank-1 {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: white;
          }

          &.rank-2 {
            background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
            color: white;
          }

          &.rank-3 {
            background: linear-gradient(135deg, #CD7F32 0%, #B8860B 100%);
            color: white;
          }
        }
      }

      .product-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;

        .product-image {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .product-details {
          .product-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }

          .product-category {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .ranking-metrics {
        text-align: right;

        .metric-value {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          justify-content: flex-end;

          &.up {
            color: var(--el-color-success);
          }

          &.down {
            color: var(--el-color-danger);
          }
        }
      }
    }
  }

  .product-table {
    .product-cell {
      display: flex;
      align-items: center;
      gap: 12px;

      .product-thumb {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        object-fit: cover;
      }

      .product-name {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .product-sku {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .table-pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .product-statistics {
    .page-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .product-metrics {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .bottom-section {
      gap: 16px;
    }

    .ranking-item {
      flex-direction: column;
      align-items: flex-start !important;

      .ranking-position,
      .product-info,
      .ranking-metrics {
        width: 100%;
      }
    }
  }
}
</style>