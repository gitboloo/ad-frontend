import { request } from '@/utils/request'
import type { SystemConfig, User, ListResponse, ListQuery, ApiResponse } from '@/types'

// 系统配置相关
export function getSystemConfig() {
  return request.get<SystemConfig>('/admin/system/config')
}

export function updateSystemConfig(data: Partial<SystemConfig>) {
  return request.put<SystemConfig>('/admin/system/config', data)
}

// 管理员用户相关
export function getAdminUsers(params: ListQuery) {
  return request.get<ListResponse<User>>('/admin/system/admins', { params })
}

export function getAdminUser(id: string | number) {
  return request.get<User>(`/admin/system/admins/${id}`)
}

export function createAdminUser(data: Partial<User> & { password: string }) {
  return request.post<User>('/admin/system/admins', data)
}

export function updateAdminUser(id: string | number, data: Partial<User>) {
  return request.put<User>(`/admin/system/admins/${id}`, data)
}

export function deleteAdminUser(id: string | number) {
  return request.delete(`/admin/system/admins/${id}`)
}

export function updateAdminStatus(id: string | number, status: string) {
  return request.put(`/admin/system/admins/${id}/status`, { status })
}

export function resetAdminPassword(id: string | number, password: string) {
  return request.put(`/admin/system/admins/${id}/password`, { password })
}

// 获取可用角色列表
export function getRoles() {
  return request.get<{ value: string; label: string }[]>('/admin/system/roles')
}

// 获取系统统计
export function getSystemStats() {
  return request.get('/admin/system/stats')
}

// 清理系统缓存
export function clearSystemCache() {
  return request.post('/admin/system/clear-cache')
}

// 获取系统日志
export function getSystemLogs(params: ListQuery & { level?: string; module?: string }) {
  return request.get('/admin/system/logs', { params })
}

// 备份数据库
export function backupDatabase() {
  return request.post('/admin/system/backup')
}

// 获取备份列表
export function getBackupList() {
  return request.get('/admin/system/backups')
}

// 恢复数据库
export function restoreDatabase(backupId: string) {
  return request.post(`/admin/system/restore/${backupId}`)
}