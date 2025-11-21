import { request } from '@/utils/request'
import type { Campaign, ListQuery, ListResponse } from '@/types'

// 获取计划列表
export function getCampaigns(params: ListQuery & {
  type?: string
  status?: string
}) {
  return request.get<ListResponse<Campaign>>('/admin/campaigns', params)
}

// 获取计划详情
export function getCampaign(id: number) {
  return request.get<Campaign>(`/admin/campaigns/${id}`)
}

// 创建计划
export function createCampaign(data: Partial<Campaign>) {
  return request.post<Campaign>('/admin/campaigns', data)
}

// 更新计划
export function updateCampaign(id: number, data: Partial<Campaign>) {
  return request.put<Campaign>(`/admin/campaigns/${id}`, data)
}

// 删除计划
export function deleteCampaign(id: number) {
  return request.delete(`/admin/campaigns/${id}`)
}

// 更新计划状态
export function updateCampaignStatus(id: number, data: { status: number }) {
  return request.put(`/admin/campaigns/${id}/status`, data)
}

// 获取计划统计
export function getCampaignStats(params?: { period?: string }) {
  return request.get('/admin/campaigns/stats', params)
}

