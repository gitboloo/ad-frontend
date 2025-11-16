import { request } from '@/utils/request'
import type { Transaction, RechargeRequest, WithdrawRequest, ListResponse, ListQuery } from '@/types'

// 获取交易记录列表
export function getTransactions(params?: ListQuery & {
  type?: string
  status?: string
  userId?: number
  startDate?: string
  endDate?: string
}) {
  return request.get<ListResponse<Transaction>>('/finance/transactions', { params })
}

// 获取交易详情
export function getTransaction(id: number) {
  return request.get<Transaction>(`/finance/transactions/${id}`)
}

// 处理充值
export function processRecharge(data: RechargeRequest & { userId: number }) {
  return request.post<Transaction>('/finance/recharge', data)
}

// 处理提现
export function processWithdraw(data: WithdrawRequest & { userId: number }) {
  return request.post<Transaction>('/finance/withdraw', data)
}

// 审核交易
export function reviewTransaction(id: number, data: {
  status: 'completed' | 'failed' | 'cancelled'
  remark?: string
}) {
  return request.put<Transaction>(`/finance/transactions/${id}/review`, data)
}

// 批量审核交易
export function batchReviewTransactions(data: {
  ids: number[]
  status: 'completed' | 'failed' | 'cancelled'
  remark?: string
}) {
  return request.put('/finance/transactions/batch-review', data)
}

// 获取用户余额
export function getUserBalance(userId: number) {
  return request.get<{ balance: number; frozenBalance: number }>(`/finance/users/${userId}/balance`)
}

// 调整用户余额
export function adjustUserBalance(userId: number, data: {
  amount: number
  type: 'add' | 'subtract'
  description: string
}) {
  return request.post(`/finance/users/${userId}/balance/adjust`, data)
}

// 获取财务统计
export function getFinanceStats(params?: {
  startDate?: string
  endDate?: string
  type?: 'daily' | 'weekly' | 'monthly'
}) {
  return request.get<{
    overview: {
      totalAmount: number
      todayAmount: number
      monthAmount: number
      totalTransactions: number
      pendingAmount: number
      completedAmount: number
    }
    charts: {
      amountTrend: { date: string; amount: number; count: number }[]
      typeDistribution: { type: string; amount: number; count: number }[]
      statusDistribution: { status: string; count: number; percentage: number }[]
    }
    recent: Transaction[]
  }>('/finance/stats', { params })
}

// 获取收入支出报表
export function getIncomeExpenseReport(params?: {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}) {
  return request.get<{
    income: { date: string; amount: number }[]
    expense: { date: string; amount: number }[]
    net: { date: string; amount: number }[]
    summary: {
      totalIncome: number
      totalExpense: number
      netProfit: number
      growthRate: number
    }
  }>('/finance/reports/income-expense', { params })
}

// 导出财务报表
export function exportFinanceReport(params: {
  type: 'transactions' | 'income-expense' | 'user-balance'
  startDate?: string
  endDate?: string
  format: 'excel' | 'csv'
  userId?: number
  status?: string
}) {
  return request.get('/finance/export', { 
    params, 
    responseType: 'blob' 
  })
}

// 获取支付方式统计
export function getPaymentMethodStats(params?: {
  startDate?: string
  endDate?: string
}) {
  return request.get<{
    methods: {
      method: string
      count: number
      amount: number
      percentage: number
    }[]
    trends: {
      date: string
      [method: string]: number | string
    }[]
  }>('/finance/stats/payment-methods', { params })
}

// 批量导入交易记录
export function importTransactions(file: File) {
  return request.upload<{
    success: number
    failed: number
    errors: string[]
  }>('/finance/transactions/import', file)
}

// 获取账户余额变动记录
export function getBalanceHistory(userId: number, params?: ListQuery) {
  return request.get<ListResponse<{
    id: number
    amount: number
    balance: number
    type: string
    description: string
    transactionId?: number
    createdAt: string
  }>>(`/finance/users/${userId}/balance/history`, { params })
}