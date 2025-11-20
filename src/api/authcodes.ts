import { request } from '@/utils/request'
import type { AuthCode, ListResponse, ListQuery, ApiResponse } from '@/types'

// 获取授权码列�?export function getAuthCodes(params?: ListQuery) {
  return request.get<ListResponse<AuthCode>>('/admin/auth-codes', { params })
}

// 获取授权码详�?export function getAuthCode(id: number) {
  return request.get<AuthCode>(`/admin/auth-codes/${id}`)
}

// 生成授权�?export function generateAuthCode(data: {
  type: 'trial' | 'premium' | 'enterprise'
  duration: number
  maxUsers?: number
  features: string[]
  quantity?: number
  description?: string
}) {
  return request.post<AuthCode[]>('/admin/auth-codes/generate', data)
}

// 批量生成授权�?export function batchGenerateAuthCodes(data: {
  type: 'trial' | 'premium' | 'enterprise'
  duration: number
  maxUsers?: number
  features: string[]
  quantity: number
  description?: string
}) {
  return request.post<AuthCode[]>('/admin/auth-codes/batch-generate', data)
}

// 更新授权码状�?export function updateAuthCodeStatus(id: number, status: 'active' | 'disabled') {
  return request.put(`/admin/auth-codes/${id}/status`, { status })
}

// 删除授权�?export function deleteAuthCode(id: number) {
  return request.delete(`/admin/auth-codes/${id}`)
}

// 批量删除授权�?export function batchDeleteAuthCodes(ids: number[]) {
  return request.delete('/admin/auth-codes/batch', { data: { ids } })
}

// 验证授权�?export function validateAuthCode(code: string) {
  return request.post<{ valid: boolean; authCode?: AuthCode }>('/admin/auth-codes/validate', { code })
}

// 使用授权�?export function useAuthCode(code: string, userId: number) {
  return request.post('/admin/auth-codes/use', { code, userId })
}

// 获取授权码使用统�?export function getAuthCodeStats() {
  return request.get<{
    total: number
    active: number
    used: number
    expired: number
    byType: Record<string, number>
    recentUsage: { date: string; count: number }[]
  }>('/admin/auth-codes/stats')
}

// 导出授权�?export function exportAuthCodes(params?: {
  status?: string
  type?: string
  startDate?: string
  endDate?: string
}) {
  return request.get('/admin/auth-codes/export', { 
    params, 
    responseType: 'blob' 
  })
}

