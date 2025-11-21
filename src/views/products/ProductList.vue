<template>
  <div class="product-list">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">产品管理</h1>
        <p class="page-description">管理商品信息，包括创建、编辑、删除等操作</p>
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
          
          <!-- 操作按钮区 -->
          <div class="action-buttons">
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
                  @click="handleEdit(row)"
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

        <!-- 新增/编辑对话框 -->
        <el-dialog
          v-model="dialogVisible"
          :title="isEdit ? '编辑产品' : '新增产品'"
          width="900px"
          :close-on-click-modal="false"
          append-to-body
          destroy-on-close
        >
          <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入产品名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品类型" prop="type">
                  <el-input v-model="form.type" placeholder="请输入产品类型" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="公司" prop="company">
                  <el-input v-model="form.company" placeholder="请输入公司名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-select
                    v-model="form.status"
                    placeholder="请选择状态"
                    style="width: 100%"
                    :teleported="false"
                    popper-class="product-status-select-dropdown"
                  >
                    <el-option label="禁用" :value="0" />
                    <el-option label="启用" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="简介" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请输入产品简介"
              />
            </el-form-item>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Logo">
                  <el-upload
                    class="logo-uploader"
                    action="#"
                    :show-file-list="false"
                    :http-request="handleLogoUpload"
                    :before-upload="beforeUpload"
                    :auto-upload="true"
                  >
                    <img v-if="form.logo" :src="form.logo" class="logo-image" />
                    <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div v-if="form.logo" class="upload-tip">
                    <el-button size="small" type="danger" @click="form.logo = ''">删除</el-button>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="产品图片">
                  <el-upload
                    class="images-uploader"
                    list-type="picture-card"
                    :file-list="imageFileList"
                    :http-request="handleImagesUpload"
                    :before-upload="beforeUpload"
                    :on-remove="handleImageRemove"
                    multiple
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Google Play">
                  <el-input v-model="form.googlePayLink" placeholder="Google Play链接" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="App Store">
                  <el-input v-model="form.appStoreLink" placeholder="App Store链接" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="应用信息">
              <div class="app-info-list">
                <div
                  v-for="(info, index) in form.appInfo"
                  :key="index"
                  class="app-info-item"
                >
                  <el-input
                    v-model="info.key"
                    placeholder="标题"
                    style="width: 150px; margin-right: 10px"
                  />
                  <el-input
                    v-model="info.value"
                    placeholder="内容"
                    style="width: 250px; margin-right: 10px"
                  />
                  <el-button
                    circle
                    @click="removeAppInfo(index)"
                  >
                    <el-icon><Minus /></el-icon>
                  </el-button>
                  <el-button
                    v-if="index === form.appInfo.length - 1"
                    circle
                    @click="addAppInfo"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>

          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              {{ isEdit ? '更新' : '创建' }}
            </el-button>
          </template>
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
  Delete,
  Minus
} from '@element-plus/icons-vue'
import { getProducts, deleteProduct, batchDeleteProducts, updateProductStatus, exportProducts, getProduct, createProduct, updateProduct, uploadFile } from '@/api/products'
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

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 表单数据
const form = reactive<any>({
  id: 0,
  name: '',
  type: '',
  company: '',
  status: 1,
  description: '',
  logo: '',
  images: [] as string[],
  googlePayLink: '',
  appStoreLink: '',
  appInfo: [{ key: '', value: '' }]
})

// 图片文件列表（用于显示）
const imageFileList = ref<any[]>([])

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择产品状态', trigger: 'change' }]
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: 0,
    name: '',
    type: '',
    company: '',
    status: 1,
    description: '',
    logo: '',
    images: [] as string[],
    googlePayLink: '',
    appStoreLink: '',
    appInfo: [{ key: '', value: '' }]
  })
  imageFileList.value = []
  formRef.value?.clearValidate()
}

// 处理创建产品
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
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

// 处理编辑
const handleEdit = async (product: Product) => {
  isEdit.value = true
  
  try {
    const response = await getProduct(product.id)
    if (response.code === 200 && response.data) {
      const productData = response.data
      
      // 映射基础字段
      form.id = productData.id
      form.name = productData.name
      form.type = productData.type
      form.company = productData.company
      form.status = productData.status
      form.description = productData.description
      form.logo = productData.logo
      
      // 处理images字段
      let imagesArray: string[] = []
      if (productData.images) {
        if (typeof productData.images === 'string') {
          try {
            imagesArray = JSON.parse(productData.images)
          } catch {
            imagesArray = []
          }
        } else if (Array.isArray(productData.images)) {
          imagesArray = productData.images
        }
      }
      
      form.images = imagesArray
      imageFileList.value = imagesArray.map((url: string, index: number) => ({
        name: `image-${index + 1}`,
        url: url
      }))
      
      // 映射下划线字段到驼峰字段
      form.googlePayLink = productData.google_pay_link || ''
      form.appStoreLink = productData.app_store_link || ''
      
      // 处理appInfo字段
      if (productData.app_info && typeof productData.app_info === 'string') {
        try {
          const parsed = JSON.parse(productData.app_info)
          form.appInfo = Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ key: '', value: '' }]
        } catch {
          form.appInfo = [{ key: '', value: '' }]
        }
      } else if (productData.app_info && Array.isArray(productData.app_info) && productData.app_info.length > 0) {
        form.appInfo = [...productData.app_info]
      } else {
        form.appInfo = [{ key: '', value: '' }]
      }
      
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('Load product error:', error)
    ElMessage.error('加载产品信息失败')
  }
}

// 上传前检查
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// Logo上传
const handleLogoUpload = async (options: any) => {
  try {
    const response = await uploadFile(options.file as File)
    if (response.code === 200 && response.data) {
      const uploadBaseURL = import.meta.env.VITE_UPLOAD_BASE_URL || 
                           import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 
                           'http://localhost:8089'
      form.logo = response.data.url.startsWith('http') 
        ? response.data.url 
        : uploadBaseURL + response.data.url
      ElMessage.success('Logo上传成功')
    }
  } catch (error) {
    ElMessage.error('Logo上传失败')
  }
}

// 产品图片上传
const handleImagesUpload = async (options: any) => {
  try {
    const response = await uploadFile(options.file as File)
    if (response.code === 200 && response.data) {
      const uploadBaseURL = import.meta.env.VITE_UPLOAD_BASE_URL || 
                           import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 
                           'http://localhost:8089'
      const fullURL = response.data.url.startsWith('http') 
        ? response.data.url 
        : uploadBaseURL + response.data.url
      
      form.images.push(fullURL)
      imageFileList.value.push({
        name: (options.file as File).name,
        url: fullURL
      })
      ElMessage.success('图片上传成功')
    }
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
}

// 删除图片
const handleImageRemove = (file: any) => {
  const index = form.images.indexOf(file.url)
  if (index > -1) {
    form.images.splice(index, 1)
  }
}

// 添加应用信息项
const addAppInfo = () => {
  if (!form.appInfo) {
    form.appInfo = []
  }
  form.appInfo.push({ key: '', value: '' })
}

// 移除应用信息项
const removeAppInfo = (index: number) => {
  if (form.appInfo && form.appInfo.length > 1) {
    form.appInfo.splice(index, 1)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    const submitData = { ...form }
    
    if (isEdit.value) {
      const response = await updateProduct(form.id, submitData)
      if (response.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        loadProducts()
      }
    } else {
      const response = await createProduct(submitData)
      if (response.code === 200) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadProducts()
      }
    }
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
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
  padding: 20px;
  
  .page-container {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
    }
    
    .page-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
  
  .filter-card {
    margin-bottom: 16px;
    
    .filter-form {
      .el-form-item {
        margin-bottom: 0;
        margin-right: 16px;
      }
      
      @media (max-width: 1400px) {
        .el-form-item {
          margin-bottom: 12px;
          display: block;
          width: 100%;
          
          :deep(.el-input),
          :deep(.el-select) {
            width: 100% !important;
          }
        }
      }
    }
    
    .action-buttons {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .pagination-container {
    margin-top: 16px;
    text-align: center;
    
    @media (max-width: 768px) {
      :deep(.el-pagination) {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
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
  
  .app-info-list {
    .app-info-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      
      .el-button {
        margin-left: 10px;
      }
    }
  }
  
  .logo-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
      
      &:hover {
        border-color: var(--el-color-primary);
      }
    }
    
    .logo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 100px;
      height: 100px;
      text-align: center;
      line-height: 100px;
    }
    
    .logo-image {
      width: 100px;
      height: 100px;
      display: block;
      object-fit: contain;
    }
  }
  
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
  }
  
  .images-uploader {
    :deep(.el-upload-list__item) {
      transition: all 0.3s;
    }
  }
}
</style>

