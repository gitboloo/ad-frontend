import { ElMessage } from 'element-plus'

/**
 * 判断是否为外部链接
 */
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 格式化金额
 */
export function formatCurrency(amount: number, currency = '¥', decimals = 2): string {
  return `${currency}${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化时间
 */
export function formatTime(time: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(time)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化日期时间（别名函数）
 */
export function formatDateTime(time: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return formatTime(time, format)
}

/**
 * 格式化日期范围
 */
export function formatDateRange(startTime: string | Date, endTime: string | Date, format = 'YYYY-MM-DD'): string {
  const start = formatTime(startTime, format)
  const end = formatTime(endTime, format)
  return `${start} - ${end}`
}

/**
 * 相对时间格式化
 */
export function formatRelativeTime(time: string | Date): string {
  const now = new Date()
  const date = new Date(time)
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = day * 365
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  
  return obj
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func.apply(null, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = new Date().getTime()
    
    if (now - lastCall < delay) {
      return
    }
    
    lastCall = now
    func.apply(null, args)
  }
}

/**
 * 生成唯一ID
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  const re = /^1[3456789]\d{9}$/
  return re.test(phone)
}

/**
 * 验证密码强度
 */
export function validatePassword(password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  issues: string[]
} {
  const issues: string[] = []
  let score = 0
  
  if (password.length < 8) {
    issues.push('密码长度至少8位')
  } else {
    score += 1
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push('需要包含小写字母')
  } else {
    score += 1
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('需要包含大写字母')
  } else {
    score += 1
  }
  
  if (!/\d/.test(password)) {
    issues.push('需要包含数字')
  } else {
    score += 1
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('需要包含特殊字符')
  } else {
    score += 1
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 4) {
    strength = 'strong'
  } else if (score >= 2) {
    strength = 'medium'
  }
  
  return {
    isValid: issues.length === 0,
    strength,
    issues
  }
}

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级处理
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }
    
    ElMessage.success('复制成功')
    return true
  } catch (error) {
    ElMessage.error('复制失败')
    return false
  }
}

/**
 * 下载文件
 */
export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a')
  link.href = url
  if (filename) {
    link.download = filename
  }
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * 判断是否为图片文件
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const extension = getFileExtension(filename).toLowerCase()
  return imageExtensions.includes(extension)
}

/**
 * 获取图片预览URL
 */
export function getImagePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 树形数据扁平化
 */
export function flattenTree<T extends { children?: T[] }>(
  tree: T[],
  childrenKey = 'children'
): T[] {
  const result: T[] = []
  
  function traverse(nodes: T[]) {
    nodes.forEach(node => {
      result.push(node)
      if (node[childrenKey as keyof T]) {
        traverse(node[childrenKey as keyof T] as T[])
      }
    })
  }
  
  traverse(tree)
  return result
}

/**
 * 扁平数据转树形
 */
export function arrayToTree<T extends { id: any; parentId?: any }>(
  array: T[],
  options: {
    idKey?: string
    parentIdKey?: string
    childrenKey?: string
  } = {}
): T[] {
  const { idKey = 'id', parentIdKey = 'parentId', childrenKey = 'children' } = options
  
  const map = new Map()
  const tree: T[] = []
  
  // 创建映射表
  array.forEach(item => {
    map.set(item[idKey as keyof T], { ...item, [childrenKey]: [] })
  })
  
  // 构建树形结构
  array.forEach(item => {
    const node = map.get(item[idKey as keyof T])
    if (item[parentIdKey as keyof T]) {
      const parent = map.get(item[parentIdKey as keyof T])
      if (parent) {
        parent[childrenKey].push(node)
      }
    } else {
      tree.push(node)
    }
  })
  
  return tree
}

/**
 * 获取嵌套对象属性值
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue
    }
    result = result[key]
  }
  
  return result !== undefined ? result : defaultValue
}

/**
 * 设置嵌套对象属性值
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  
  let current = obj
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[lastKey] = value
}

/**
 * 获取状态标签配置
 */
export function getStatusConfig(status: string, type: 'user' | 'product' | 'campaign' | 'coupon' | 'transaction') {
  const configs = {
    user: {
      active: { text: '正常', type: 'success' },
      inactive: { text: '未激活', type: 'warning' },
      banned: { text: '已封禁', type: 'danger' }
    },
    product: {
      active: { text: '已发布', type: 'success' },
      inactive: { text: '已下架', type: 'warning' },
      draft: { text: '草稿', type: 'info' }
    },
    campaign: {
      draft: { text: '草稿', type: 'info' },
      pending: { text: '待审核', type: 'warning' },
      running: { text: '投放中', type: 'success' },
      paused: { text: '已暂停', type: 'warning' },
      completed: { text: '已完成', type: 'info' }
    },
    coupon: {
      active: { text: '有效', type: 'success' },
      inactive: { text: '无效', type: 'warning' },
      expired: { text: '已过期', type: 'danger' }
    },
    transaction: {
      pending: { text: '处理中', type: 'warning' },
      completed: { text: '已完成', type: 'success' },
      failed: { text: '失败', type: 'danger' },
      cancelled: { text: '已取消', type: 'info' }
    }
  }
  
  return configs[type]?.[status] || { text: status, type: 'info' }
}