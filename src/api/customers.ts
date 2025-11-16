import { request } from '@/utils/request'
import type { Customer, ListResponse, ListQuery, ApiResponse } from '@/types'

// 获取客户列表
export function getCustomers(params: ListQuery) {
  return request.get<ListResponse<Customer>>('/admin/customers', { params })
}

// 获取客户详情
export function getCustomer(id: string | number) {
  return request.get<Customer>(`/admin/customers/${id}`)
}

// 创建客户
export function createCustomer(data: Partial<Customer>) {
  return request.post<Customer>('/admin/customers', data)
}

// 更新客户信息
export function updateCustomer(id: string | number, data: Partial<Customer>) {
  return request.put<Customer>(`/admin/customers/${id}`, data)
}

// 删除客户
export function deleteCustomer(id: string | number) {
  return request.delete(`/admin/customers/${id}`)
}

// 批量删除客户
export function batchDeleteCustomers(ids: number[]) {
  return request.post('/admin/customers/batch-delete', { ids })
}

// 更新客户状态
export function updateCustomerStatus(id: string | number, status: string) {
  return request.put(`/admin/customers/${id}/status`, { status })
}

// 重置客户密码
export function resetCustomerPassword(id: string | number) {
  return request.post(`/admin/customers/${id}/reset-password`)
}

// 获取客户交易记录
export function getCustomerTransactions(id: string | number, params: ListQuery) {
  return request.get<ListResponse<any>>(`/admin/customers/${id}/transactions`, { params })
}

// 获取客户订单记录
export function getCustomerOrders(id: string | number, params: ListQuery) {
  return request.get<ListResponse<any>>(`/admin/customers/${id}/orders`, { params })
}

// 调整客户余额
export function adjustCustomerBalance(id: string | number, data: { amount: number; reason: string }) {
  return request.post(`/admin/customers/${id}/adjust-balance`, data)
}