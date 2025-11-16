import { request } from '@/utils/request'
import type { DashboardStats, Activity } from '@/types'

// 获取仪表盘统计数据
export function getDashboardStats() {
  return request.get<DashboardStats>('/dashboard/stats')
}

// 获取最近活动
export function getRecentActivities(limit = 10) {
  return request.get<Activity[]>('/dashboard/activities', { limit })
}

// 获取收入趋势数据
export function getRevenueTrend(params: {
  period: 'day' | 'week' | 'month' | 'year'
  days?: number
}) {
  return request.get('/dashboard/revenue-trend', params)
}

// 获取用户增长数据
export function getUserGrowth(params: {
  period: 'day' | 'week' | 'month' | 'year'
  days?: number
}) {
  return request.get('/dashboard/user-growth', params)
}

// 获取计划表现数据
export function getCampaignPerformance(params: {
  period: 'day' | 'week' | 'month' | 'year'
  limit?: number
}) {
  return request.get('/dashboard/campaign-performance', params)
}

// 获取实时数据
export function getRealTimeData() {
  return request.get('/dashboard/realtime')
}