import { request } from '@/utils/request'
import type { User, ApiResponse } from '@/types'

// 登录
export function login(data: {
  username: string
  password: string
  remember?: boolean
}) {
  return request.post<{ token: string; user: User }>('/auth/login', data)
}

// 退出登录
export function logout() {
  return request.post('/auth/logout')
}

// 获取用户信息
export function getUserInfo() {
  return request.get<User>('/auth/me')
}

// 获取用户权限
export function getUserPermissions() {
  return request.get<string[]>('/auth/permissions')
}

// 更新用户资料
export function updateProfile(data: Partial<User>) {
  return request.put<User>('/auth/profile', data)
}

// 修改密码
export function changePassword(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) {
  return request.put('/auth/password', data)
}

// 上传头像
export function uploadAvatar(file: File) {
  return request.upload<{ url: string }>('/auth/avatar', file)
}

// 刷新token
export function refreshToken() {
  return request.post<{ token: string }>('/auth/refresh')
}

// 发送重置密码邮件
export function sendResetPasswordEmail(email: string) {
  return request.post('/auth/reset-password', { email })
}

// 重置密码
export function resetPassword(data: {
  token: string
  password: string
  confirmPassword: string
}) {
  return request.post('/auth/reset-password/confirm', data)
}