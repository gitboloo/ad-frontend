import { request } from '@/utils/request'
import type { Agent, Commission, Withdrawal, AgentCustomer, ListQuery } from '@/types'

// 获取代理商列表
export function getAgentList(params?: ListQuery & {
  status?: number
  level?: number
  keyword?: string
}) {
  return request.get<{
    data: Agent[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_page: number
    }
  }>('/admin/agents', params)
}

// 获取代理商详情
export function getAgentDetail(id: number) {
  return request.get<Agent>(`/admin/agents/${id}`)
}

// 创建代理商
export function createAgent(data: {
  username: string
  account: string
  password: string
  real_name: string
  phone: string
  email?: string
  agent_level: 1 | 2 | 3
  parent_id?: number
  commission_rate?: number
  remark?: string
}) {
  return request.post<Agent>('/admin/agents', data)
}

// 更新代理商
export function updateAgent(id: number, data: Partial<Agent>) {
  return request.put<Agent>(`/admin/agents/${id}`, data)
}

// 审核通过代理商
export function approveAgent(id: number, remark?: string) {
  return request.post(`/admin/agents/${id}/approve`, { remark })
}

// 拒绝代理商
export function rejectAgent(id: number, reason: string) {
  return request.post(`/admin/agents/${id}/reject`, { reason })
}

// 冻结代理商
export function freezeAgent(id: number, reason?: string) {
  return request.post(`/admin/agents/${id}/freeze`, { reason })
}

// 解冻代理商
export function unfreezeAgent(id: number, remark?: string) {
  return request.post(`/admin/agents/${id}/unfreeze`, { remark })
}

// 获取提现列表
export function getWithdrawalList(params?: ListQuery & {
  status?: number
  agent_id?: number
  start_date?: string
  end_date?: string
}) {
  return request.get<{
    data: Withdrawal[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_page: number
    }
  }>('/admin/withdrawals', params)
}

// 审核通过提现
export function approveWithdrawal(id: number, remark?: string) {
  return request.post(`/admin/withdrawals/${id}/approve`, { remark })
}

// 拒绝提现
export function rejectWithdrawal(id: number, reason: string) {
  return request.post(`/admin/withdrawals/${id}/reject`, { reason })
}

// 标记提现完成
export function completeWithdrawal(id: number, remark?: string) {
  return request.post(`/admin/withdrawals/${id}/complete`, { remark })
}

// 获取佣金列表
export function getCommissionList(params?: ListQuery & {
  agent_id?: number
  status?: number
  start_date?: string
  end_date?: string
}) {
  return request.get<{
    data: Commission[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_page: number
    }
  }>('/admin/commissions', params)
}

// 获取代理商客户列表
export function getAgentCustomers(agentId: number, params?: ListQuery) {
  return request.get<{
    data: AgentCustomer[]
    pagination: {
      page: number
      page_size: number
      total: number
      total_page: number
    }
  }>(`/admin/agents/${agentId}/customers`, params)
}

// 获取代理商统计
export function getAgentStats(id: number) {
  return request.get<{
    balance: number
    frozen_balance: number
    total_commission: number
    total_customers: number
    pending_withdrawals: number
    completed_withdrawals: number
    month_commission: number
    month_customers: number
  }>(`/admin/agents/${id}/stats`)
}
