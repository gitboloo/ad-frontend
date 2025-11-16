<template>
  <div class="campaign-stats-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :lg="6" v-for="item in statsCards" :key="item.title">
        <el-card class="stats-card">
          <div class="card-content">
            <div class="stats-value">{{ item.value }}</div>
            <div class="stats-title">{{ item.title }}</div>
            <div class="stats-trend" :class="item.trendType">
              <el-icon v-if="item.trendType === 'up'"><ArrowUp /></el-icon>
              <el-icon v-else><ArrowDown /></el-icon>
              <span>{{ item.trend }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>计划趋势分析</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                @change="handleDateChange"
              />
            </div>
          </template>
          <div class="chart-container" ref="trendChart"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card>
          <template #header>
            <span>计划状态分布</span>
          </template>
          <div class="chart-container" ref="statusChart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="data-table-card">
      <template #header>
        <div class="card-header">
          <span>计划详细数据</span>
          <el-button type="primary" size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" stripe>
        <el-table-column prop="name" label="计划名称" min-width="150" />
        <el-table-column prop="product" label="关联产品" min-width="120" />
        <el-table-column prop="clicks" label="点击次数" width="100" sortable />
        <el-table-column prop="impressions" label="展示次数" width="100" sortable />
        <el-table-column prop="ctr" label="CTR" width="80" sortable>
          <template #default="scope">
            {{ scope.row.ctr }}%
          </template>
        </el-table-column>
        <el-table-column prop="conversions" label="转化数" width="90" sortable />
        <el-table-column prop="cost" label="花费" width="100" sortable>
          <template #default="scope">
            ¥{{ scope.row.cost }}
          </template>
        </el-table-column>
        <el-table-column prop="revenue" label="收入" width="100" sortable>
          <template #default="scope">
            ¥{{ scope.row.revenue }}
          </template>
        </el-table-column>
        <el-table-column prop="roi" label="ROI" width="80" sortable>
          <template #default="scope">
            {{ scope.row.roi }}%
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" fixed="right">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowUp, ArrowDown, Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getCampaignStats } from '@/api/campaigns'

interface StatsCard {
  title: string
  value: string | number
  trend: number
  trendType: 'up' | 'down'
}

const statsCards = ref<StatsCard[]>([
  { title: '总计划数', value: 0, trend: 12.5, trendType: 'up' },
  { title: '活跃计划', value: 0, trend: 8.3, trendType: 'up' },
  { title: '总点击量', value: '0', trend: 15.2, trendType: 'up' },
  { title: '总转化数', value: 0, trend: 5.1, trendType: 'down' }
])

const dateRange = ref<[Date, Date] | null>(null)
const tableData = ref([])
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

let trendChartInstance: echarts.ECharts | null = null
let statusChartInstance: echarts.ECharts | null = null
const trendChart = ref<HTMLElement>()
const statusChart = ref<HTMLElement>()

onMounted(async () => {
  await loadStats()
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChartInstance?.dispose()
  statusChartInstance?.dispose()
})

const loadStats = async () => {
  try {
    const res = await getCampaignStats({
      page: pagination.value.page,
      size: pagination.value.size,
      dateRange: dateRange.value
    })
    
    const { overview, campaigns, trend } = res.data.data
    
    // 更新统计卡片
    statsCards.value[0].value = overview.total
    statsCards.value[1].value = overview.active
    statsCards.value[2].value = overview.clicks.toLocaleString()
    statsCards.value[3].value = overview.conversions
    
    // 更新表格数据
    tableData.value = campaigns
    pagination.value.total = res.data.total
    
    // 更新图表
    updateCharts(trend, overview.statusDistribution)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const initCharts = () => {
  // 趋势图
  if (trendChart.value) {
    trendChartInstance = echarts.init(trendChart.value)
    const trendOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['展示', '点击', '转化'] },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [
        { name: '展示', type: 'line', data: [] },
        { name: '点击', type: 'line', data: [] },
        { name: '转化', type: 'line', data: [] }
      ]
    }
    trendChartInstance.setOption(trendOption)
  }

  // 状态分布图
  if (statusChart.value) {
    statusChartInstance = echarts.init(statusChart.value)
    const statusOption = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
        type: 'pie',
        radius: '50%',
        data: []
      }]
    }
    statusChartInstance.setOption(statusOption)
  }
}

const updateCharts = (trendData: any, statusData: any) => {
  if (trendChartInstance && trendData) {
    trendChartInstance.setOption({
      xAxis: { data: trendData.dates },
      series: [
        { data: trendData.impressions },
        { data: trendData.clicks },
        { data: trendData.conversions }
      ]
    })
  }

  if (statusChartInstance && statusData) {
    statusChartInstance.setOption({
      series: [{
        data: [
          { value: statusData.active, name: '运行中' },
          { value: statusData.paused, name: '已暂停' },
          { value: statusData.stopped, name: '已停止' }
        ]
      }]
    })
  }
}

const handleResize = () => {
  trendChartInstance?.resize()
  statusChartInstance?.resize()
}

const handleDateChange = () => {
  loadStats()
}

const handlePageChange = () => {
  loadStats()
}

const handleSizeChange = () => {
  pagination.value.page = 1
  loadStats()
}

const handleExport = () => {
  ElMessage.success('导出功能开发中')
}
</script>

<style scoped>
.campaign-stats-container {
  padding: 20px;
}

.stats-card {
  margin-bottom: 20px;
}

.card-content {
  text-align: center;
}

.stats-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 10px;
}

.stats-title {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-bottom: 10px;
}

.stats-trend {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
}

.stats-trend.up {
  color: var(--el-color-success);
}

.stats-trend.down {
  color: var(--el-color-danger);
}

.chart-row {
  margin-top: 20px;
}

.chart-container {
  height: 300px;
}

.data-table-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>