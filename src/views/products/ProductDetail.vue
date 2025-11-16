<template>
  <div class="product-detail">
    <div class="page-container">
      <div class="page-header">
        <div class="flex items-center gap-4">
          <el-button @click="router.back()" type="info" plain>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <div>
            <h1 class="page-title">产品详情</h1>
            <p class="page-description">查看产品的详细信息</p>
          </div>
        </div>
        <div class="page-actions">
          <el-button
            v-permission="'product:edit'"
            type="primary"
            @click="router.push(`/products/edit/${product.id}`)"
          >
            编辑产品
          </el-button>
        </div>
      </div>
      
      <div v-loading="loading" class="product-content">
        <el-row :gutter="24">
          <!-- 产品图片 -->
          <el-col :span="8">
            <el-card title="产品图片">
              <div class="product-images">
                <el-carousel v-if="product.images && product.images.length" height="300px">
                  <el-carousel-item v-for="(image, index) in product.images" :key="index">
                    <el-image :src="image" fit="contain" style="width: 100%; height: 100%" />
                  </el-carousel-item>
                </el-carousel>
                <div v-else class="no-image">暂无图片</div>
              </div>
            </el-card>
          </el-col>
          
          <!-- 基本信息 -->
          <el-col :span="16">
            <el-card title="基本信息">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="产品名称">{{ product.name }}</el-descriptions-item>
                <el-descriptions-item label="产品分类">{{ product.category }}</el-descriptions-item>
                <el-descriptions-item label="当前价格">
                  <span class="price">{{ formatCurrency(product.price) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="原价">
                  <span v-if="product.originalPrice">{{ formatCurrency(product.originalPrice) }}</span>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="库存">{{ product.stock }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusConfig(product.status, 'product').type">
                    {{ getStatusConfig(product.status, 'product').text }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatTime(product.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ formatTime(product.updatedAt) }}</el-descriptions-item>
                <el-descriptions-item label="产品描述" :span="2">
                  <div class="description">{{ product.description || '暂无描述' }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
        
        <!-- 产品标签 -->
        <el-card v-if="product.tags && product.tags.length" title="产品标签" class="mt-6">
          <div class="product-tags">
            <el-tag v-for="tag in product.tags" :key="tag" type="info">{{ tag }}</el-tag>
          </div>
        </el-card>
        
        <!-- 扩展属性 -->
        <el-card v-if="product.attributes" title="扩展属性" class="mt-6">
          <el-descriptions :column="3" border>
            <el-descriptions-item
              v-for="(value, key) in product.attributes"
              :key="key"
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- SEO信息 -->
        <el-card v-if="product.seoTitle || product.seoDescription" title="SEO信息" class="mt-6">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="SEO标题">
              {{ product.seoTitle || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="SEO描述">
              {{ product.seoDescription || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getProduct } from '@/api/products'
import { formatCurrency, formatTime, getStatusConfig } from '@/utils'
import type { Product } from '@/types'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const product = ref<Product>({} as Product)

const loadProduct = async () => {
  try {
    loading.value = true
    const response = await getProduct(Number(route.params.id))
    
    if (response.success) {
      product.value = response.data
    }
  } catch (error) {
    console.error('Load product error:', error)
    ElMessage.error('加载产品详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
.product-detail {
  .product-images {
    .no-image {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
    }
  }
  
  .price {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-danger);
  }
  
  .description {
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  .product-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>