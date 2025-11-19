import type { ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /**
     * 格式化日期时间
     * @param time 时间字符串或 Date 对象
     * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
     * @returns 格式化后的日期字符串
     */
    $formatDate: (time: string | Date, format?: string) => string

    /**
     * 检查权限
     * @param permissions 权限字符串或权限数组
     * @returns 是否拥有权限
     */
    $checkPermission: (permissions: string | string[]) => boolean

    /**
     * 当前用户信息
     */
    $user: {
      id: number | null
      username: string
      nickname: string
      avatar: string
      isAdmin: boolean
      isOperator: boolean
      permissions: string[]
    }
  }
}

export {}
