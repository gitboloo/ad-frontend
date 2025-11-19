<template>
  <div style="padding: 20px;">
    <h1>路由调试页面</h1>
    
    <div style="margin: 20px 0;">
      <h2>组件测试</h2>
      <el-button @click="testProductComponent">测试 ProductList 组件</el-button>
      <el-button @click="testCampaignComponent">测试 CampaignList 组件</el-button>
      <el-button @click="checkAllRoutes">检查所有路由</el-button>
    </div>
    
    <div v-if="testResults.length > 0" style="margin-top: 20px;">
      <h3>测试结果：</h3>
      <ul>
        <li v-for="result in testResults" :key="result.id" 
            :style="{ color: result.success ? 'green' : 'red' }">
          {{ result.message }}
        </li>
      </ul>
    </div>
    
    <div style="margin-top: 30px;">
      <h3>当前路由信息：</h3>
      <p>当前路径: {{ $route.path }}</p>
      <p>当前名称: {{ $route.name }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const testResults = ref<Array<{id: number, message: string, success: boolean}>>([])

let testId = 0

function addResult(message: string, success: boolean) {
  testResults.value.push({
    id: testId++,
    message,
    success
  })
}

async function testProductComponent() {
  try {
    const component = await import('@/views/products/ProductList.vue')
    addResult('✓ ProductList 组件加载成功', true)
    console.log('ProductList 组件:', component)
  } catch (error) {
    addResult(`✗ ProductList 组件加载失败: ${error}`, false)
    console.error('ProductList 组件加载失败:', error)
  }
}

async function testCampaignComponent() {
  try {
    const component = await import('@/views/campaigns/CampaignList.vue')
    addResult('✓ CampaignList 组件加载成功', true)
    console.log('CampaignList 组件:', component)
  } catch (error) {
    addResult(`✗ CampaignList 组件加载失败: ${error}`, false)
    console.error('CampaignList 组件加载失败:', error)
  }
}

function checkAllRoutes() {
  const allRoutes = router.getRoutes()
  addResult(`总路由数量: ${allRoutes.length}`, true)
  
  console.log('=== 所有路由 ===')
  allRoutes.forEach(route => {
    console.log(`路由: ${route.name} | 路径: ${route.path}`)
  })
  
  // 检查产品相关路由
  const productRoutes = allRoutes.filter(r => r.path.includes('/products'))
  addResult(`产品相关路由数量: ${productRoutes.length}`, productRoutes.length > 0)
  
  productRoutes.forEach(route => {
    console.log('产品路由:', route.name, route.path)
  })
}
</script>