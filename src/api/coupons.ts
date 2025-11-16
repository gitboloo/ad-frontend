import { request } from '@/utils/request'
import type { Coupon, UserCoupon, ListQuery, ListResponse } from '@/types'

// 获取优惠券列表
export function getCoupons(params: ListQuery & {
  type?: string
  status?: string
}) {
  return request.get<ListResponse<Coupon>>('/coupons', params)
}

// 获取优惠券详情
export function getCoupon(id: number | string) {
  return request.get<Coupon>(`/coupons/${id}`)
}

// 创建优惠券
export function createCoupon(data: Partial<Coupon>) {
  return request.post<Coupon>('/coupons', data)
}

// 更新优惠券
export function updateCoupon(id: number | string, data: Partial<Coupon>) {
  return request.put<Coupon>(`/coupons/${id}`, data)
}

// 删除优惠券
export function deleteCoupon(id: number | string) {
  return request.delete(`/coupons/${id}`)
}

// 更新优惠券状态
export function updateCouponStatus(id: number | string, status: string) {
  return request.patch(`/coupons/${id}/status`, { status })
}

// 获取用户优惠券列表
export function getUserCoupons(params: ListQuery & {
  userId?: number
  couponId?: number
  status?: string
}) {
  return request.get<ListResponse<UserCoupon>>('/user-coupons', params)
}

// 给用户分配优惠券
export function assignCouponToUser(data: {
  couponId: number
  userIds: number[]
}) {
  return request.post('/user-coupons/assign', data)
}

// 批量分配优惠券
export function batchAssignCoupons(data: {
  couponIds: number[]
  userIds: number[]
}) {
  return request.post('/user-coupons/batch-assign', data)
}

// 撤销用户优惠券
export function revokeCouponFromUser(id: number | string) {
  return request.delete(`/user-coupons/${id}`)
}