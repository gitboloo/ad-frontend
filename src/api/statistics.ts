import { request } from '@/utils/request'

// 获取概览统计数据
export function getOverviewStats(params?: {
  period?: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
}) {
  return request.get('/statistics/overview', params)
}

// 获取产品统计数据
export function getProductStats(params?: {
  period?: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  productId?: number
  category?: string
}) {
  return request.get('/statistics/products', params)
}

// 获取收入统计数据
export function getRevenueStats(params?: {
  period?: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  type?: 'daily' | 'monthly' | 'category' | 'product'
}) {
  return request.get('/statistics/revenue', params)
}

// 获取趋势对比数据
export function getTrendComparison(params: {
  metric: 'revenue' | 'orders' | 'users' | 'products'
  period: 'day' | 'week' | 'month' | 'year'
  compare?: boolean
}) {
  return request.get('/statistics/trends', params)
}

// 获取实时统计数据
export function getRealTimeStats() {
  return request.get('/statistics/realtime')
}

// 获取排行榜数据
export function getRankingData(params: {
  type: 'products' | 'categories' | 'users' | 'campaigns'
  metric: 'revenue' | 'orders' | 'views' | 'conversions'
  period?: string
  limit?: number
}) {
  return request.get('/statistics/rankings', params)
}

// 导出统计报表
export function exportStatsReport(params: {
  type: 'overview' | 'products' | 'revenue'
  format: 'excel' | 'pdf' | 'csv'
  period: string
  startDate?: string
  endDate?: string
}) {
  return request.post('/statistics/export', params, {
    responseType: 'blob'
  })
}