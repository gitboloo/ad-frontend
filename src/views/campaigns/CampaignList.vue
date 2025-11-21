<template>
  <div class="campaign-list">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div>
          <h1 class="page-title">计划管理</h1>
          <p class="page-description">管理广告投放计划，包括创建、编辑、删除等操作</p>
        </div>
      </div>
      
      <!-- 搜索过滤区 -->
      <div class="table-container">
        <el-card class="filter-card">
          <el-form :model="queryForm" :inline="true" class="filter-form">
            <el-form-item label="计划名称">
              <el-input
                v-model="queryForm.search"
                placeholder="请输入计划名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="产品">
              <el-select
                v-model="queryForm.product_id"
                placeholder="请选择产品"
                clearable
                filterable
                style="width: 200px"
              >
                <el-option
                  v-for="product in productList"
                  :key="product.id"
                  :label="product.name"
                  :value="product.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="queryForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 120px"
              >
                <el-option label="激活" :value="1" />
                <el-option label="未激活" :value="0" />
                <el-option label="已暂停" :value="2" />
                <el-option label="已结束" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :loading="loading">
                <el-icon><Search /></el-icon>
                查询
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
            >
              <el-icon><Plus /></el-icon>
              新建
            </el-button>
            <el-button @click="handleExport" :loading="exportLoading">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </el-card>
        
        <!-- 数据表格 -->
        <el-card>
          <template #header>
            <div class="table-header">
              <span class="table-title">计划列表</span>
              <div class="table-actions">
                <el-button
                  type="danger"
                  size="small"
                  :disabled="!multipleSelection.length"
                  @click="handleBatchDelete"
                >
                  <el-icon><Delete /></el-icon>
                  删除
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
            
            <el-table-column prop="name" label="计划名称" min-width="150" />
            
            <el-table-column prop="campaign_number" label="计划编号" width="120" />
            
            <el-table-column prop="product_id" label="产品ID" width="100" />
            
            <el-table-column label="简介" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.description || '-' }}
              </template>
            </el-table-column>
            
            <el-table-column label="主图" width="100">
              <template #default="{ row }">
                <div
                  v-if="row.main_image"
                  class="image-preview-trigger"
                  @click="handleImagePreview([row.main_image])"
                >
                  <img
                    :src="row.main_image"
                    style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; cursor: pointer;"
                  />
                </div>
                <div v-else class="no-image">无主图</div>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.created_at) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 1"
                  type="warning"
                  size="small"
                  link
                  @click="handlePause(row)"
                >
                  暂停
                </el-button>
                <el-button
                  v-if="row.status === 2"
                  type="success"
                  size="small"
                  link
                  @click="handleResume(row)"
                >
                  恢复
                </el-button>
                <el-button
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
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.total"
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
          :title="isEdit ? '编辑计划' : '新增计划'"
          width="1200px"
          :close-on-click-modal="false"
        >
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            v-loading="formLoading"
          >
            <!-- 基本信息 -->
            <el-card class="form-card">
              <template #header>基本信息</template>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="计划名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入计划名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="关联产品" prop="product_id">
                    <el-select
                      v-model="formData.product_id"
                      placeholder="请选择产品"
                      style="width: 100%"
                      filterable
                      :teleported="false"
                      popper-class="campaign-product-select-dropdown"
                    >
                      <el-option
                        v-for="product in productList"
                        :key="product.id"
                        :label="product.name"
                        :value="product.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="计划简介" prop="description">
                    <el-input
                      v-model="formData.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入计划简介"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="计划状态" prop="status">
                    <el-select 
                      v-model="formData.status" 
                      placeholder="请选择" 
                      style="width: 100%" 
                      :teleported="false"
                      popper-class="campaign-status-select-dropdown"
                    >
                      <el-option label="未激活" :value="0" />
                      <el-option label="激活" :value="1" />
                      <el-option label="已暂停" :value="2" />
                      <el-option label="已结束" :value="3" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>
            
            <!-- 媒体资源 -->
            <el-card class="form-card">
              <template #header>媒体资源</template>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="主图">
                    <el-upload
                      class="image-uploader"
                      action="#"
                      :show-file-list="false"
                      :http-request="handleMainImageUpload"
                      :before-upload="beforeImageUpload"
                    >
                      <img v-if="formData.main_image" :src="formData.main_image" class="uploaded-image" />
                      <el-icon v-else class="uploader-icon"><Plus /></el-icon>
                    </el-upload>
                    <div v-if="formData.main_image" class="upload-tip">
                      <el-button size="small" type="danger" @click="formData.main_image = ''">删除</el-button>
                    </div>
                    <div class="form-tip">推荐尺寸: 800x600px, 支持JPG/PNG, 最大2MB</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="视频">
                    <el-upload
                      class="video-uploader"
                      action="#"
                      :show-file-list="false"
                      :http-request="handleVideoUpload"
                      :before-upload="beforeVideoUpload"
                    >
                      <video v-if="formData.video" :src="formData.video" class="uploaded-video" controls />
                      <el-icon v-else class="uploader-icon"><VideoCamera /></el-icon>
                    </el-upload>
                    <div v-if="formData.video" class="upload-tip">
                      <el-button size="small" type="danger" @click="formData.video = ''">删除</el-button>
                    </div>
                    <div class="form-tip">支持MP4格式, 最大50MB</div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>

            <!-- 投放内容 -->
            <el-card class="form-card">
              <template #header>投放内容</template>
              <div class="dynamic-fields">
                <div
                  v-for="(item, index) in formData.delivery_content"
                  :key="'content-' + index"
                  class="field-item"
                >
                  <el-input
                    v-model="item.title"
                    placeholder="标题/表头"
                    class="field-title"
                  />
                  <el-input
                    v-model="item.content"
                    type="textarea"
                    :rows="2"
                    placeholder="内容"
                    class="field-content"
                  />
                  <el-button
                    type="danger"
                    circle
                    @click="removeField('delivery_content', index)"
                  >
                    <el-icon><Minus /></el-icon>
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  @click="addField('delivery_content')"
                >
                  <el-icon><Plus /></el-icon>
                  添加投放内容
                </el-button>
              </div>
            </el-card>

            <!-- 投放规则 -->
            <el-card class="form-card">
              <template #header>投放规则</template>
              <div class="dynamic-fields">
                <div
                  v-for="(item, index) in formData.delivery_rules"
                  :key="'rules-' + index"
                  class="field-item"
                >
                  <el-input
                    v-model="item.title"
                    placeholder="标题/表头"
                    class="field-title"
                  />
                  <el-input
                    v-model="item.content"
                    type="textarea"
                    :rows="2"
                    placeholder="内容"
                    class="field-content"
                  />
                  <el-button
                    type="danger"
                    circle
                    @click="removeField('delivery_rules', index)"
                  >
                    <el-icon><Minus /></el-icon>
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  @click="addField('delivery_rules')"
                >
                  <el-icon><Plus /></el-icon>
                  添加投放规则
                </el-button>
              </div>
            </el-card>

            <!-- 用户定向 -->
            <el-card class="form-card">
              <template #header>用户定向</template>
              <div class="dynamic-fields">
                <div
                  v-for="(item, index) in formData.user_targeting"
                  :key="'targeting-' + index"
                  class="field-item"
                >
                  <el-input
                    v-model="item.title"
                    placeholder="标题/表头"
                    class="field-title"
                  />
                  <el-input
                    v-model="item.content"
                    type="textarea"
                    :rows="2"
                    placeholder="内容"
                    class="field-content"
                  />
                  <el-button
                    type="danger"
                    circle
                    @click="removeField('user_targeting', index)"
                  >
                    <el-icon><Minus /></el-icon>
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  @click="addField('user_targeting')"
                >
                  <el-icon><Plus /></el-icon>
                  添加用户定向
                </el-button>
              </div>
            </el-card>
          </el-form>

          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="formLoading" @click="handleSubmit">
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
import { Plus, Download, Search, Refresh, Delete, Minus, VideoCamera } from '@element-plus/icons-vue'
import { getCampaigns, deleteCampaign, updateCampaignStatus, getCampaign, createCampaign, updateCampaign } from '@/api/campaigns'
import { getProducts } from '@/api/products'
import { uploadCampaignFile } from '@/api/upload'
import dayjs from 'dayjs'
import type { FormInstance, UploadRequestOptions } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const exportLoading = ref(false)
const tableData = ref<any[]>([])
const multipleSelection = ref<any[]>([])
const productList = ref<any[]>([])

// 图片预览相关
const imagePreviewVisible = ref(false)
const previewImages = ref<string[]>([])

// 对话框控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formLoading = ref(false)

// 表单数据
interface CustomField {
  title: string
  content: string
}

const formData = reactive<{
  id?: number
  name: string
  product_id: number | null
  description: string
  status: number
  main_image: string
  video: string
  delivery_content: CustomField[]
  delivery_rules: CustomField[]
  user_targeting: CustomField[]
}>({
  name: '',
  product_id: null,
  description: '',
  status: 1,
  main_image: '',
  video: '',
  delivery_content: [],
  delivery_rules: [],
  user_targeting: []
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }]
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    product_id: null,
    description: '',
    status: 1,
    main_image: '',
    video: '',
    delivery_content: [],
    delivery_rules: [],
    user_targeting: []
  })
  formRef.value?.clearValidate()
}

// 查询表单
const queryForm = reactive({
  search: '',
  product_id: null as number | null,
  status: null as number | null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 加载计划列表
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      size: pagination.size
    }
    
    if (queryForm.search) {
      params.search = queryForm.search
    }
    if (queryForm.product_id) {
      params.product_id = queryForm.product_id
    }
    if (queryForm.status !== null) {
      params.status = queryForm.status
    }
    
    const res = await getCampaigns(params)
    tableData.value = res.data || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载计划列表失败')
  } finally {
    loading.value = false
  }
}

// 加载产品列表（用于筛选）
const loadProducts = async () => {
  try {
    const res = await getProducts({ page: 1, pageSize: 100 })
    if (res.code === 200) {
      productList.value = res.data || []
    }
  } catch (error) {
    console.error('加载产品列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置查询
const resetQuery = () => {
  queryForm.search = ''
  queryForm.product_id = null
  queryForm.status = null
  pagination.page = 1
  loadData()
}

// 创建计划
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑计划
const handleEdit = async (row: any) => {
  isEdit.value = true
  
  try {
    formLoading.value = true
    const res = await getCampaign(row.id)
    const campaign = res.data
    
    // 处理图片和视频URL
    let mainImage = campaign.main_image || ''
    if (mainImage && !mainImage.startsWith('http')) {
      mainImage = `http://localhost:8089${mainImage}`
    }
    let video = campaign.video || ''
    if (video && !video.startsWith('http')) {
      video = `http://localhost:8089${video}`
    }
    
    Object.assign(formData, {
      id: campaign.id,
      name: campaign.name,
      product_id: campaign.product_id,
      description: campaign.description,
      status: campaign.status,
      main_image: mainImage,
      video: video,
      delivery_content: campaign.delivery_content || [],
      delivery_rules: campaign.delivery_rules || [],
      user_targeting: campaign.user_targeting || []
    })
    
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载计划信息失败')
    console.error('Load campaign error:', error)
  } finally {
    formLoading.value = false
  }
}

// 上传主图
const handleMainImageUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadCampaignFile(options.file as File)
    let imageUrl = res.data.url || res.data
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `http://localhost:8089${imageUrl}`
    }
    formData.main_image = imageUrl
    ElMessage.success('主图上传成功')
  } catch (error: any) {
    console.error('Upload error:', error)
    ElMessage.error(error.message || '主图上传失败')
  }
}

// 上传视频
const handleVideoUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadCampaignFile(options.file as File)
    let videoUrl = res.data.url || res.data
    if (videoUrl && !videoUrl.startsWith('http')) {
      videoUrl = `http://localhost:8089${videoUrl}`
    }
    formData.video = videoUrl
    ElMessage.success('视频上传成功')
  } catch (error: any) {
    console.error('Upload error:', error)
    ElMessage.error(error.message || '视频上传失败')
  }
}

const beforeImageUpload = (rawFile: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!validTypes.includes(rawFile.type)) {
    ElMessage.error('主图必须是JPG或PNG格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('主图大小不能超过2MB!')
    return false
  }
  return true
}

const beforeVideoUpload = (rawFile: File) => {
  if (rawFile.type !== 'video/mp4') {
    ElMessage.error('视频必须是MP4格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 50) {
    ElMessage.error('视频大小不能超过50MB!')
    return false
  }
  return true
}

// 添加动态字段
const addField = (fieldName: 'delivery_content' | 'delivery_rules' | 'user_targeting') => {
  formData[fieldName].push({ title: '', content: '' })
}

// 移除动态字段
const removeField = (
  fieldName: 'delivery_content' | 'delivery_rules' | 'user_targeting',
  index: number
) => {
  formData[fieldName].splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    formLoading.value = true
    
    if (isEdit.value && formData.id) {
      await updateCampaign(formData.id, formData)
      ElMessage.success('计划更新成功')
    } else {
      await createCampaign(formData)
      ElMessage.success('计划创建成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
  } finally {
    formLoading.value = false
  }
}

// 删除计划
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除计划 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCampaign(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个计划吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const promises = multipleSelection.value.map(item => deleteCampaign(item.id))
    await Promise.all(promises)
    
    ElMessage.success('批量删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 暂停计划
const handlePause = async (row: any) => {
  try {
    await updateCampaignStatus(row.id, { status: 2 })
    ElMessage.success('已暂停计划')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '暂停失败')
  }
}

// 恢复计划
const handleResume = async (row: any) => {
  try {
    await updateCampaignStatus(row.id, { status: 1 })
    ElMessage.success('已恢复计划')
    loadData()
  } catch (error: any) {
    ElMessage.error(error.message || '恢复失败')
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 多选
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

// 排序
const handleSortChange = ({ prop, order }: any) => {
  // TODO: 实现排序
  console.log('Sort:', prop, order)
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 图片预览
const handleImagePreview = (images: string[]) => {
  previewImages.value = images.filter(img => img)
  if (previewImages.value.length > 0) {
    imagePreviewVisible.value = true
  }
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取状态类型
const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '未激活',
    1: '激活',
    2: '已暂停',
    3: '已结束'
  }
  return statusMap[status] || '未知'
}

onMounted(() => {
  loadProducts()
  loadData()
})
</script>

<style lang="scss" scoped>
.campaign-list {
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
  
  .table-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    .filter-card {
      .filter-form {
        margin: 0;
        
        :deep(.el-form-item) {
          margin-bottom: 0;
          margin-right: 16px;
        }
        
        // 响应式布局：小屏幕下表单项垂直排列
        @media (max-width: 1400px) {
          :deep(.el-form-item) {
            margin-bottom: 12px;
            display: block;
            width: 100%;
            
            .el-input,
            .el-select {
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
      
      .table-title {
        font-size: 16px;
        font-weight: 500;
      }
      
      .table-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    }
    
    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      
      // 响应式分页
      @media (max-width: 768px) {
        justify-content: center;
        
        :deep(.el-pagination) {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
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
  
  // 对话框表单样式
  .form-card {
    margin-bottom: 20px;
    
    :deep(.el-card__header) {
      font-weight: 600;
      background-color: var(--el-fill-color-light);
    }
  }
  
  .image-uploader,
  .video-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      width: 178px;
      height: 178px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.3s;
      
      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }
  
  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }
  
  .uploaded-image,
  .uploaded-video {
    width: 178px;
    height: 178px;
    display: block;
    object-fit: cover;
  }
  
  .upload-tip {
    margin-top: 8px;
  }
  
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 5px;
  }
  
  .dynamic-fields {
    width: 100%;
    
    .field-item {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      align-items: flex-start;
      
      .field-title {
        width: 150px;
        flex-shrink: 0;
      }
      
      .field-content {
        flex: 1;
      }
    }
  }
}
</style>