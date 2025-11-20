import { request } from '@/utils/request'
import type { Product, ListQuery, ListResponse } from '@/types'

// 获取产品列表
export function getProducts(params: ListQuery & {
  status?: string
}) {
  // 转换参数名并过滤空值
  const apiParams: any = {}
  
  Object.entries(params).forEach(([key, value]) => {
    // 跳过空字符串、null、undefined
    if (value === '' || value === null || value === undefined) {
      return
    }
    
    // 转换参数名以匹配后端
    if (key === 'sortBy') {
      // 将驼峰式转为下划线式: createdAt -> created_at
      const sortField = value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      apiParams['sort'] = sortField
    } else if (key === 'sortOrder') {
      apiParams['order'] = value
    } else if (key === 'pageSize') {
      apiParams['size'] = value
    } else {
      apiParams[key] = value
    }
  })
  
  return request.get<ListResponse<Product>>('/admin/products', apiParams)
}

// 获取产品详情
export function getProduct(id: number) {
  return request.get<Product>(`/admin/products/${id}`)
}

// 创建产品
export function createProduct(data: Partial<Product>) {
  return request.post<Product>('/admin/products', data)
}

// 更新产品
export function updateProduct(id: number, data: Partial<Product>) {
  return request.put<Product>(`/admin/products/${id}`, data)
}

// 删除产品
export function deleteProduct(id: number) {
  return request.delete(`/admin/products/${id}`)
}

// 批量删除产品
export function batchDeleteProducts(ids: number[]) {
  return request.delete('/admin/products/batch', { data: { ids } })
}

// 更新产品状态
export function updateProductStatus(id: number, status: number) {
  return request.patch(`/admin/products/${id}/status`, { status })
}

// 批量更新产品状态
export function batchUpdateProductStatus(ids: number[], status: number) {
  return request.patch('/admin/products/batch/status', { ids, status })
}

// 通用文件上传（不需要产品ID）- 用于Logo和产品图片
export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<{ url: string }>('/admin/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 通用多文件上传（不需要产品ID）- 用于批量上传产品图片
export function uploadFiles(files: File[]) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return request.post<{ urls: string[] }>('/admin/products/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 导出产品数据
export function exportProducts(params?: {
  category?: string
  status?: string
  format?: 'xlsx' | 'csv'
}) {
  return request.download('/admin/products/export', params, 'products.xlsx')
}

// 导入产品数据
export function importProducts(file: File) {
  return request.upload<{ 
    success: number
    failed: number
    errors: Array<{ row: number; message: string }>
  }>('/admin/products/import', file)
}

// 复制产品
export function duplicateProduct(id: number, data?: { name?: string }) {
  return request.post<Product>(`/admin/products/${id}/duplicate`, data)
}

// 获取产品统计
export function getProductStats() {
  return request.get('/admin/products/stats')
}