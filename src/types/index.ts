// 通用类型定义

// 用户相关
export interface User {
  id: number
  username: string
  account: string  // 后端返回的是account，不是email
  nickname?: string
  avatar?: string
  role: number  // 后端返回的是数字：1=viewer, 2=operator, 3=admin
  status: number  // 后端返回的是数字：0=inactive, 1=active
  last_login_at?: string
  created_at: string
  updated_at: string
}

// 产品相关
export interface Product {
  id: number
  name: string
  description?: string
  category: string
  price: number
  originalPrice?: number
  stock: number
  status: 'active' | 'inactive' | 'draft'
  images: string[]
  tags?: string[]
  attributes?: Record<string, any>
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

// 计划相关
export interface Campaign {
  id: number
  name: string
  description?: string
  type: 'cpc' | 'cpm' | 'cpa'
  status: 'draft' | 'pending' | 'running' | 'paused' | 'completed'
  budget: number
  dailyBudget?: number
  spent: number
  startDate: string
  endDate: string
  targetAudience: Record<string, any>
  creatives: Creative[]
  products: number[]
  performance: CampaignPerformance
  createdAt: string
  updatedAt: string
}

export interface Creative {
  id: number
  name: string
  type: 'image' | 'video' | 'text'
  content: string
  url?: string
  size?: string
  duration?: number
}

export interface CampaignPerformance {
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cvr: number
  cpc: number
  cpm: number
  roas: number
}

// 优惠券相关
export interface Coupon {
  id: number
  name: string
  code: string
  type: 'fixed' | 'percentage'
  value: number
  minAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: string
  validTo: string
  status: 'active' | 'inactive' | 'expired'
  applicableProducts?: number[]
  createdAt: string
  updatedAt: string
}

export interface UserCoupon {
  id: number
  userId: number
  couponId: number
  coupon: Coupon
  user: User
  usedAt?: string
  orderId?: number
  status: 'unused' | 'used' | 'expired'
  createdAt: string
}

// 授权码相关
export interface AuthCode {
  id: number
  code: string
  type: 'trial' | 'premium' | 'enterprise'
  duration: number // 天数
  maxUsers?: number
  features: string[]
  status: 'active' | 'used' | 'expired' | 'disabled'
  userId?: number
  usedAt?: string
  expiresAt: string
  createdAt: string
}

// 财务相关
export interface Transaction {
  id: number
  userId: number
  user: User
  type: 'recharge' | 'consume' | 'refund' | 'withdraw'
  amount: number
  balance: number
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod?: string
  orderId?: string
  createdAt: string
  updatedAt: string
}

export interface RechargeRequest {
  amount: number
  paymentMethod: 'alipay' | 'wechat' | 'bank'
  description?: string
}

export interface WithdrawRequest {
  amount: number
  accountInfo: {
    type: 'alipay' | 'wechat' | 'bank'
    account: string
    name: string
  }
  description?: string
}

// 客户相关
export interface Customer {
  id: number
  username: string
  email: string
  phone?: string
  realName?: string
  company?: string
  industry?: string
  balance: number
  totalSpent: number
  level: 'bronze' | 'silver' | 'gold' | 'diamond'
  status: 'active' | 'inactive' | 'banned'
  registeredAt: string
  lastActiveAt?: string
  profile: CustomerProfile
}

export interface CustomerProfile {
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  address?: {
    province: string
    city: string
    district: string
    detail: string
  }
  preferences?: string[]
}

// 系统配置相关
export interface SystemConfig {
  siteName: string
  siteUrl: string
  adminEmail: string
  defaultLanguage: string
  timezone: string
  currency: string
  maintenance: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxUploadSize: number
  allowedFileTypes: string[]
  features: {
    [key: string]: boolean
  }
  integrations: {
    [key: string]: {
      enabled: boolean
      config: Record<string, any>
    }
  }
}

// API相关
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp?: string
}

export interface ListResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ListQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

// 统计相关
export interface DashboardStats {
  overview: {
    totalProducts: number
    totalCampaigns: number
    totalUsers: number
    totalRevenue: number
    todayRevenue: number
    monthlyRevenue: number
    revenueGrowth: number
    userGrowth: number
  }
  charts: {
    revenueChart: ChartData
    userChart: ChartData
    campaignChart: ChartData
  }
  activities: Activity[]
}

export interface ChartData {
  categories: string[]
  series: {
    name: string
    data: number[]
  }[]
}

export interface Activity {
  id: number
  type: 'user_register' | 'campaign_create' | 'order_complete' | 'system_alert'
  title: string
  description: string
  timestamp: string
  status: 'info' | 'success' | 'warning' | 'error'
  userId?: number
  user?: User
}

// 表单相关
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

export interface FormRules {
  [key: string]: FormRule[]
}

// 路由相关
export interface RouteConfig {
  path: string
  name: string
  component?: any
  redirect?: string
  children?: RouteConfig[]
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    roles?: string[]
    noCache?: boolean
    affix?: boolean
    breadcrumb?: boolean
    activeMenu?: string
  }
}

// 菜单相关
export interface MenuItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: MenuItem[]
  hidden?: boolean
  disabled?: boolean
  roles?: string[]
  badge?: string | number
}

// 上传相关
export interface UploadFile {
  id: string
  name: string
  url: string
  size: number
  type: string
  status: 'ready' | 'uploading' | 'success' | 'error'
  progress: number
  response?: any
  error?: string
}

export interface UploadConfig {
  accept: string
  maxSize: number
  maxCount: number
  action: string
  headers?: Record<string, string>
  data?: Record<string, any>
  multiple?: boolean
  directory?: string
}

// 代理商相关
export interface Agent {
  id: number
  username: string
  account: string
  real_name: string
  phone: string
  email?: string
  agent_code: string
  agent_level: 1 | 2 | 3
  parent_id?: number
  parent?: Agent
  commission_rate: number
  balance: number
  frozen_balance: number
  total_commission: number
  total_customers: number
  status: 0 | 1 | 2 | 3  // 0=待审核, 1=激活, 2=冻结, 3=禁用
  remark?: string
  rejection_reason?: string
  approved_at?: string
  approved_by?: number
  created_at: string
  updated_at: string
}

export interface AgentDashboard {
  balance: number
  frozen_balance: number
  total_commission: number
  pending_commission: number
  today_commission: number
  month_commission: number
  total_customers: number
  active_customers: number
  level_1_count: number
  level_2_count: number
  level_3_count: number
}

export interface Commission {
  id: number
  agent_id: number
  agent?: Agent
  order_id: number
  customer_id: number
  customer_username: string
  order_amount: number
  commission_amount: number
  commission_rate: number
  status: 0 | 1 | 2  // 0=待结算, 1=已结算, 2=已取消
  settle_date?: string
  remark?: string
  created_at: string
}

export interface Withdrawal {
  id: number
  agent_id: number
  agent?: Agent
  amount: number
  fee: number
  actual_amount: number
  bank_name: string
  bank_account: string
  account_name: string
  status: 0 | 1 | 2 | 3 | 4  // 0=待审核, 1=审核通过, 2=处理中, 3=已完成, 4=已拒绝
  reviewed_by?: number
  reviewer?: User
  reviewed_at?: string
  rejection_reason?: string
  completed_at?: string
  remark?: string
  created_at: string
}

export interface AgentCustomer {
  id: number
  agent_id: number
  agent?: Agent
  customer_id: number
  customer?: Customer
  auth_code?: string
  total_orders: number
  total_amount: number
  total_commission: number
  last_order_at?: string
  bind_at: string
}