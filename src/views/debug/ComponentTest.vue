<template>
  <div class="component-test">
    <el-card>
      <template #header>
        <h3>组件加载测试</h3>
      </template>
      
      <div class="test-section">
        <h4>测试组件动态导入</h4>
        <el-button @click="testProductList" type="primary">测试 ProductList 组件</el-button>
        <el-button @click="testPermissionList" type="success">测试 PermissionList 组件</el-button>
        <el-button @click="testRoleList" type="warning">测试 RoleList 组件</el-button>
        
        <div v-if="componentResult" class="result">
          <h5>测试结果：</h5>
          <pre>{{ componentResult }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h4>测试路径匹配</h4>
        <el-input 
          v-model="testPath" 
          placeholder="输入组件路径，如: products/ProductList"
          @keyup.enter="testPathMapping"
        />
        <el-button @click="testPathMapping" type="primary">测试路径映射</el-button>
        
        <div v-if="pathResult" class="result">
          <h5>路径映射结果：</h5>
          <pre>{{ pathResult }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h4>当前注册的路由</h4>
        <el-button @click="showRoutes" type="info">显示所有路由</el-button>
        
        <div v-if="routesList" class="result">
          <h5>注册的路由列表：</h5>
          <pre>{{ routesList }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const componentResult = ref('')
const pathResult = ref('')
const routesList = ref('')
const testPath = ref('products/ProductList')

// 测试组件动态导入
const testProductList = async () => {
  try {
    console.log('🧪 开始测试 ProductList 组件导入...')
    
    // 尝试不同的导入路径
    const importPaths = [
      '../products/ProductList.vue',
      './products/ProductList.vue',
      '@/views/products/ProductList.vue',
      '/src/views/products/ProductList.vue'
    ]
    
    const results = []
    
    for (const path of importPaths) {
      try {
        const component = await import(path)
        results.push(`✅ ${path}: 成功导入`)
        console.log(`✅ 成功导入: ${path}`, component)
      } catch (error) {
        results.push(`❌ ${path}: 导入失败 - ${error.message}`)
        console.log(`❌ 导入失败: ${path}`, error)
      }
    }
    
    componentResult.value = results.join('\n')
  } catch (error) {
    componentResult.value = `测试失败: ${error.message}`
    console.error('测试组件导入失败:', error)
  }
}

const testPermissionList = async () => {
  try {
    console.log('🧪 开始测试 PermissionList 组件导入...')
    const component = await import('../system/PermissionList.vue')
    componentResult.value = '✅ PermissionList 组件导入成功'
    console.log('✅ PermissionList 导入成功:', component)
  } catch (error) {
    componentResult.value = `❌ PermissionList 导入失败: ${error.message}`
    console.error('❌ PermissionList 导入失败:', error)
  }
}

const testRoleList = async () => {
  try {
    console.log('🧪 开始测试 RoleList 组件导入...')
    const component = await import('../system/RoleList.vue')
    componentResult.value = '✅ RoleList 组件导入成功'
    console.log('✅ RoleList 导入成功:', component)
  } catch (error) {
    componentResult.value = `❌ RoleList 导入失败: ${error.message}`
    console.error('❌ RoleList 导入失败:', error)
  }
}

// 测试路径映射逻辑
const testPathMapping = () => {
  console.log('🧪 测试路径映射:', testPath.value)
  
  // 复制 routeTransform.ts 中的映射逻辑
  const componentMap: Record<string, any> = {
    // 产品模块
    'products/ProductList': () => import('@/views/products/ProductList.vue'),
    'ProductList': () => import('@/views/products/ProductList.vue'),
    'products/list': () => import('@/views/products/ProductList.vue'),
    
    // 系统模块
    'system/PermissionList': () => import('@/views/system/PermissionList.vue'),
    'PermissionList': () => import('@/views/system/PermissionList.vue'),
    'system/permissions': () => import('@/views/system/PermissionList.vue'),
    
    'system/RoleList': () => import('@/views/system/RoleList.vue'),
    'RoleList': () => import('@/views/system/RoleList.vue'),
    'system/roles': () => import('@/views/system/RoleList.vue'),
  }
  
  const path = testPath.value
  const results = []
  
  // 1. 直接匹配
  if (componentMap[path]) {
    results.push(`✅ 直接匹配: ${path}`)
  } else {
    results.push(`❌ 直接匹配失败: ${path}`)
  }
  
  // 2. 添加 views/ 前缀
  const viewsPath = `views/${path}`
  if (componentMap[viewsPath]) {
    results.push(`✅ views/ 前缀匹配: ${viewsPath}`)
  } else {
    results.push(`❌ views/ 前缀匹配失败: ${viewsPath}`)
  }
  
  // 3. 移除可能的 .vue 后缀
  const cleanPath = path.replace(/\.vue$/, '')
  if (componentMap[cleanPath] && cleanPath !== path) {
    results.push(`✅ 清理后缀匹配: ${cleanPath}`)
  } else {
    results.push(`❌ 清理后缀匹配失败: ${cleanPath}`)
  }
  
  // 4. 提取文件名
  const fileName = path.split('/').pop()
  if (fileName && componentMap[fileName]) {
    results.push(`✅ 文件名匹配: ${fileName}`)
  } else {
    results.push(`❌ 文件名匹配失败: ${fileName}`)
  }
  
  pathResult.value = results.join('\n')
}

// 显示当前路由
const showRoutes = () => {
  const routes = router.getRoutes()
  const routeInfo = routes.map(route => ({
    name: route.name,
    path: route.path,
    component: route.component?.name || 'Anonymous',
    meta: route.meta
  }))
  
  routesList.value = JSON.stringify(routeInfo, null, 2)
  console.log('📋 当前注册的路由:', routeInfo)
}
</script>

<style lang="scss" scoped>
.component-test {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  
  h4 {
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }
  
  .el-button {
    margin-right: 12px;
    margin-bottom: 12px;
  }
  
  .result {
    margin-top: 16px;
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    
    h5 {
      margin-bottom: 8px;
      color: var(--el-text-color-primary);
    }
    
    pre {
      margin: 0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>