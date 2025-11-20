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
            @click="handleCreate"
            v-permission="'products.create'"
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
            <el-form-item label="产品状态">
              <el-select
                v-model="queryForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 120px"
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
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
            
            <el-table-column prop="id" label="#" width="80" sortable="custom" />
            
            <el-table-column prop="name" label="产品名称" min-width="150" />
            
            <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
            
            <el-table-column label="Logo" width="100">
              <template #default="{ row }">
                <div
                  v-if="row.logo"
                  class="image-preview-trigger"
                  @click="handleImagePreview([row.logo])"
                >
                  <img
                    :src="row.logo"
                    style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; cursor: pointer;"
                  />
                </div>
                <div v-else class="no-image">无Logo</div>
              </template>
            </el-table-column>
            
            <el-table-column label="产品图片" width="100">
              <template #default="{ row }">
                <div
                  v-if="getImageArray(row.images).length"
                  class="image-preview-trigger"
                  @click="handleImagePreview(getImageArray(row.images))"
                >
                  <img
                    :src="getImageArray(row.images)[0]"
                    style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; cursor: pointer;"
                  />
                </div>
                <div v-else class="no-image">无图片</div>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-permission="'products.edit'"
                  type="primary"
                  size="small"
                  link
                  @click="router.push(`/products/edit/${row.id}`)"
                >
                  编辑
                </el-button>
                <el-button
                  v-permission="'products.edit'"
                  size="small"
                  link
                  @click="handleStatusChange(row)"
                >
                  {{ row.status === 1 ? '下架' : '上架' }}
                </el-button>
                <el-button
                  v-permission="'products.delete'"
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
        
        <!-- 图片预览对话框 -->
        <el-dialog
          v-model="imagePreviewVisible"
          title="图片预览"
          width="90%"
          :z-index="9999"
          append-to-body
          destroy-on-close
        >
          <div class="image-preview-container">
            <el-carousel
              v-if="previewImages.length > 1"
              :autoplay="false"
              arrow="always"
              height="700px"
            >
              <el-carousel-item v-for="(img, index) in previewImages" :key="index">
                <img :src="img" class="preview-image" />
              </el-carousel-item>
            </el-carousel>
            <img v-else-if="previewImages.length === 1" :src="previewImages[0]" class="preview-image-single" />
          </div>
        </el-dialog>
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
import { getProducts, deleteProduct, batchDeleteProducts, updateProductStatus, exportProducts } from '@/api/products'
import { formatTime, getStatusConfig } from '@/utils'
import type { Product, ListQuery } from '@/types'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const tableData = ref<Product[]>([])
const total = ref(0)
const multipleSelection = ref<Product[]>([])
const imagePreviewVisible = ref(false)
const previewImages = ref<string[]>([])

// 查询表单
const queryForm = reactive<ListQuery & {
  status?: string
}>({
  page: 1,
  pageSize: 20,
  search: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 将JSON字符串转换为图片数组
const getImageArray = (images: string | string[]): string[] => {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// 图片预览
const handleImagePreview = (images: string[]) => {
  previewImages.value = images
  imagePreviewVisible.value = true
}

// 加载产品列表
const loadProducts = async () => {
  try {
    loading.value = true
    const response = await getProducts(queryForm)
    
    if (response.code === 200) {
      // 后端直接返回data数组，而不是data.items
      tableData.value = response.data || []
      total.value = response.total || 0
    }
  } catch (error) {
    console.error('Load products error:', error)
    ElMessage.error('加载产品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  loadProducts()
}

// 处理创建产品
const handleCreate = () => {
  console.log('[ProductList] 点击创建产品按钮')
  console.log('[ProductList] 跳转到: /products/create')
  router.push('/products/create')
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryForm, {
    page: 1,
    pageSize: 20,
    search: '',
    status: '',
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
  const newStatus = product.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  
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
    if (response.code === 200) {
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
  
  .image-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 600px;
    
    .preview-image {
      width: 100%;
      height: 700px;
      object-fit: contain;
    }
    
    .preview-image-single {
      width: 100%;
      max-height: 800px;
      object-fit: contain;
    }
  }
}
</style>