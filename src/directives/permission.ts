import type { App, DirectiveBinding } from 'vue'
import { hasPermission, hasAnyPermission } from '@/utils/permission'

export function setupPermissionDirective(app: App) {
  // v-permission 指令
  app.directive('permission', {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      const { value } = binding
      
      if (value) {
        const hasAuth = Array.isArray(value) 
          ? hasAnyPermission(value)
          : hasPermission(value)
        
        if (!hasAuth) {
          el.style.display = 'none'
        }
      }
    },
    
    updated(el: HTMLElement, binding: DirectiveBinding) {
      const { value } = binding
      
      if (value) {
        const hasAuth = Array.isArray(value) 
          ? hasAnyPermission(value)
          : hasPermission(value)
        
        el.style.display = hasAuth ? '' : 'none'
      }
    }
  })
}

export default setupPermissionDirective