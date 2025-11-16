import { request } from '@/utils/request'
import type { Product, ListQuery, ListResponse } from '@/types'

// 获取产品列表
export function getProducts(params: ListQuery & {
  category?: string
  status?: string
  minPrice?: number
  maxPrice?: number
}) {
  return request.get<ListResponse<Product>>('/products', params)
}

// 获取产品详情
export function getProduct(id: number) {
  return request.get<Product>(`/products/${id}`)
}

// 创建产品
export function createProduct(data: Partial<Product>) {
  return request.post<Product>('/products', data)
}

// 更新产品
export function updateProduct(id: number, data: Partial<Product>) {
  return request.put<Product>(`/products/${id}`, data)
}

// 删除产品
export function deleteProduct(id: number) {
  return request.delete(`/products/${id}`)
}

// 批量删除产品
export function batchDeleteProducts(ids: number[]) {
  return request.delete('/products/batch', { data: { ids } })
}

// 更新产品状态
export function updateProductStatus(id: number, status: string) {
  return request.patch(`/products/${id}/status`, { status })
}

// 批量更新产品状态
export function batchUpdateProductStatus(ids: number[], status: string) {
  return request.patch('/products/batch/status', { ids, status })
}

// 获取产品分类
export function getProductCategories() {
  return request.get<{ value: string; label: string }[]>('/products/categories')
}

// 上传产品图片
export function uploadProductImage(file: File) {
  return request.upload<{ url: string }>('/products/upload/image', file)
}

// 批量上传产品图片
export function batchUploadProductImages(files: File[]) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('images', file)
  })
  return request.post<{ urls: string[] }>('/products/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 导出产品数据
export function exportProducts(params?: {
  category?: string
  status?: string
  format?: 'xlsx' | 'csv'
}) {
  return request.download('/products/export', params, 'products.xlsx')
}

// 导入产品数据
export function importProducts(file: File) {
  return request.upload<{ 
    success: number
    failed: number
    errors: Array<{ row: number; message: string }>
  }>('/products/import', file)
}

// 复制产品
export function duplicateProduct(id: number, data?: { name?: string }) {
  return request.post<Product>(`/products/${id}/duplicate`, data)
}

// 获取产品统计
export function getProductStats() {
  return request.get('/products/stats')
}