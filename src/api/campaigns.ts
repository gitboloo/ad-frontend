import { request } from '@/utils/request'
import type { Campaign, ListQuery, ListResponse } from '@/types'

// 获取计划列表
export function getCampaigns(params: ListQuery & {
  type?: string
  status?: string
}) {
  return request.get<ListResponse<Campaign>>('/campaigns', params)
}

// 获取计划详情
export function getCampaign(id: number) {
  return request.get<Campaign>(`/campaigns/${id}`)
}

// 创建计划
export function createCampaign(data: Partial<Campaign>) {
  return request.post<Campaign>('/campaigns', data)
}

// 更新计划
export function updateCampaign(id: number, data: Partial<Campaign>) {
  return request.put<Campaign>(`/campaigns/${id}`, data)
}

// 删除计划
export function deleteCampaign(id: number) {
  return request.delete(`/campaigns/${id}`)
}

// 更新计划状态
export function updateCampaignStatus(id: number, status: string) {
  return request.patch(`/campaigns/${id}/status`, { status })
}

// 获取计划统计
export function getCampaignStats(params?: { period?: string }) {
  return request.get('/campaigns/stats', params)
}