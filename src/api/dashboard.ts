import { request } from '@/utils/request'
import type { DashboardStats, Activity } from '@/types'

// 获取仪表盘统计数据
export function getDashboardStats() {
  return request.get<DashboardStats>('/admin/dashboard/stats')
}

// 获取最近活动
export function getRecentActivities(limit = 10) {
  return request.get<Activity[]>('/admin/dashboard/activities', { limit })
}

// 获取收入趋势数据
export function getRevenueTrend(params: {
  period: 'day' | 'week' | 'month' | 'year'
  days?: number
}) {
  return request.get('/admin/dashboard/revenue-trend', params)
}

// 获取用户增长数据
export function getUserGrowth(params: {
  period: 'day' | 'week' | 'month' | 'year'
  days?: number
}) {
  return request.get('/admin/dashboard/user-growth', params)
}

// 获取计划表现数据
export function getCampaignPerformance(params: {
  period: 'day' | 'week' | 'month' | 'year'
  limit?: number
}) {
  return request.get('/admin/dashboard/campaign-performance', params)
}

// 获取实时数据
export function getRealTimeData() {
  return request.get('/admin/dashboard/realtime')
}