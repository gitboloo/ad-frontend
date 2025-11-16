<template>
  <div class="product-list">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">产品管理</h1>
        <p class="page-description">管理商品信息，包括创建、编辑、删除等操作</p>
        <div class="page-actions">
          <el-button
            type="primary"
            @click="router.push('/products/create')"
            v-permission="'product:create'"
          >
            <el-icon><Plus /></el-icon>
            新增产品
          </el-button>
          <el-button @click="handleExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
      
      <!-- 搜索过滤区 -->
      <div class="table-container">
        <el-card class="filter-card">
          <el-form :model="queryForm" :inline="true" class="filter-form">
            <el-form-item label="产品名称">
              <el-input
                v-model="queryForm.search"
                placeholder="请输入产品名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="产品分类">
              <el-select
                v-model="queryForm.category"
                placeholder="请选择分类"
                clearable
                style="width: 150px"
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat.value"
                  :label="cat.label"
                  :value="cat.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="产品状态">
              <el-select
                v-model="queryForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 120px"
              >
                <el-option label="已发布" value="active" />
                <el-option label="已下架" value="inactive" />
                <el-option label="草稿" value="draft" />
              </el-select>
            </el-form-item>
            <el-form-item label="价格区间">
              <el-input
                v-model.number="queryForm.minPrice"
                placeholder="最低价"
                style="width: 100px"
                type="number"
              />
              <span style="margin: 0 8px">-</span>
              <el-input
                v-model.number="queryForm.maxPrice"
                placeholder="最高价"
                style="width: 100px"
                type="number"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :loading="loading">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetQuery">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <!-- 数据表格 -->
        <el-card>
          <template #header>
            <div class="table-header">
              <span class="table-title">产品列表</span>
              <div class="table-actions">
                <el-button
                  type="danger"
                  size="small"
                  :disabled="!multipleSelection.length"
                  @click="handleBatchDelete"
                >
                  <el-icon><Delete /></el-icon>
                  批量删除
                </el-button>
              </div>
            </div>
          </template>
          
          <el-table
            v-loading="loading"
            :data="tableData"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
          >
            <el-table-column type="selection" width="55" />
            
            <el-table-column prop="id" label="ID" width="80" sortable="custom" />
            
            <el-table-column label="产品图片" width="100">
              <template #default="{ row }">
                <el-image
                  v-if="row.images && row.images.length"
                  :src="row.images[0]"
                  :preview-src-list="row.images"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 4px"
                />
                <div v-else class="no-image">无图片</div>
              </template>
            </el-table-column>
            
            <el-table-column prop="name" label="产品名称" min-width="150">
              <template #default="{ row }">
                <div class="product-name">
                  <span class="name">{{ row.name }}</span>
                  <div v-if="row.tags && row.tags.length" class="tags">
                    <el-tag
                      v-for="tag in row.tags.slice(0, 3)"
                      :key="tag"
                      size="small"
                      type="info"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="category" label="分类" width="120" />
            
            <el-table-column prop="price" label="价格" width="120" sortable="custom">
              <template #default="{ row }">
                <div class="price-info">
                  <span class="current-price">{{ formatCurrency(row.price) }}</span>
                  <span v-if="row.originalPrice && row.originalPrice > row.price" class="original-price">
                    {{ formatCurrency(row.originalPrice) }}
                  </span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="stock" label="库存" width="100" sortable="custom">
              <template #default="{ row }">
                <span :class="{ 'low-stock': row.stock < 10 }">
                  {{ row.stock }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusConfig(row.status, 'product').type">
                  {{ getStatusConfig(row.status, 'product').text }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="createdAt" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="router.push(`/products/detail/${row.id}`)"
                >
                  查看
                </el-button>
                <el-button
                  v-permission="'product:edit'"
                  type="primary"
                  size="small"
                  link
                  @click="router.push(`/products/edit/${row.id}`)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'product:edit'"
                  size="small"
                  link
                  @click="handleStatusChange(row)"
                >
                  {{ row.status === 'active' ? '下架' : '上架' }}
                </el-button>
                <el-button
                  v-permission="'product:delete'"
                  type="danger"
                  size="small"
                  link
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="queryForm.page"
              v-model:page-size="queryForm.pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Search,
  Refresh,
  Delete
} from '@element-plus/icons-vue'
import { getProducts, getProductCategories, deleteProduct, batchDeleteProducts, updateProductStatus, exportProducts } from '@/api/products'
import { formatCurrency, formatTime, getStatusConfig } from '@/utils'
import type { Product, ListQuery } from '@/types'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const tableData = ref<Product[]>([])
const total = ref(0)
const categories = ref<{ value: string; label: string }[]>([])
const multipleSelection = ref<Product[]>([])

// 查询表单
const queryForm = reactive<ListQuery & {
  category?: string
  status?: string
  minPrice?: number
  maxPrice?: number
}>({
  page: 1,
  pageSize: 20,
  search: '',
  category: '',
  status: '',
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 加载产品列表
const loadProducts = async () => {
  try {
    loading.value = true
    const response = await getProducts(queryForm)
    
    if (response.success) {
      tableData.value = response.data.items
      total.value = response.data.total
    }
  } catch (error) {
    console.error('Load products error:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    loading.value = false
  }
}

// 加载产品分类
const loadCategories = async () => {
  try {
    const response = await getProductCategories()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Load categories error:', error)
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  loadProducts()
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryForm, {
    page: 1,
    pageSize: 20,
    search: '',
    category: '',
    status: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  loadProducts()
}

// 处理选择变化
const handleSelectionChange = (selection: Product[]) => {
  multipleSelection.value = selection
}

// 处理排序变化
const handleSortChange = ({ prop, order }: any) => {
  queryForm.sortBy = prop
  queryForm.sortOrder = order === 'ascending' ? 'asc' : 'desc'
  loadProducts()
}

// 处理页大小变化
const handleSizeChange = (size: number) => {
  queryForm.pageSize = size
  queryForm.page = 1
  loadProducts()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryForm.page = page
  loadProducts()
}

// 处理删除
const handleDelete = async (product: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品 "${product.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteProduct(product.id)
    if (response.success) {
      ElMessage.success('删除成功')
      loadProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete product error:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.warning('请选择要删除的产品')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个产品吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = multipleSelection.value.map(item => item.id)
    const response = await batchDeleteProducts(ids)
    
    if (response.success) {
      ElMessage.success('批量删除成功')
      loadProducts()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete error:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 处理状态变更
const handleStatusChange = async (product: Product) => {
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? '上架' : '下架'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}产品 "${product.name}" 吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await updateProductStatus(product.id, newStatus)
    if (response.success) {
      ElMessage.success(`${action}成功`)
      product.status = newStatus
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Update status error:', error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 处理导出
const handleExport = async () => {
  try {
    exportLoading.value = true
    await exportProducts({
      category: queryForm.category,
      status: queryForm.status,
      format: 'xlsx'
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export error:', error)
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 初始化
onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.product-list {
  .filter-card {
    margin-bottom: 16px;
    
    .filter-form {
      .el-form-item {
        margin-bottom: 16px;
      }
    }
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 16px;
    text-align: center;
  }
  
  .product-name {
    .name {
      font-weight: 500;
      display: block;
      margin-bottom: 4px;
    }
    
    .tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }
  
  .price-info {
    .current-price {
      font-weight: 600;
      color: var(--el-color-danger);
    }
    
    .original-price {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-decoration: line-through;
      margin-left: 8px;
    }
  }
  
  .low-stock {
    color: var(--el-color-warning);
    font-weight: 600;
  }
  
  .no-image {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 12px;
    border-radius: 4px;
  }
}
</style>