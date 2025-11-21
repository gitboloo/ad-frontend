import { request } from '@/utils/request'

/**
 * 通用文件上传API
 */

// 上传单个文件
export function uploadFile(formData: FormData) {
  return request.post<{ url: string }>('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 上传多个文件
export function uploadFiles(formData: FormData) {
  return request.post<{ urls: string[] }>('/admin/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 产品文件上传
export function uploadProductFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ url: string }>('/admin/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 计划文件上传（主图和视频）
export function uploadCampaignFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ url: string }>('/admin/campaigns/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
