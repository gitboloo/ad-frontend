<template>
  <div class="campaign-form">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? '编辑计划' : '创建计划' }}</h1>
        <p class="page-description">{{ isEdit ? '修改计划信息' : '填写计划基本信息' }}</p>
      </div>
      
      <div class="form-container">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="120px"
          size="large"
        >
          <el-card title="基本信息">
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
                    :rows="4"
                    placeholder="请输入计划简介"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="计划状态" prop="status">
                  <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                    <el-option label="未激活" :value="0" />
                    <el-option label="激活" :value="1" />
                    <el-option label="已暂停" :value="2" />
                    <el-option label="已结束" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>
          
          <el-card title="媒体资源">
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

          <!-- 投放内容 - 动态字段 -->
          <el-card title="投放内容">
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
                  :icon="Delete"
                  circle
                  @click="removeField('delivery_content', index)"
                />
              </div>
              <el-button
                type="primary"
                :icon="Plus"
                @click="addField('delivery_content')"
              >
                添加投放内容
              </el-button>
            </div>
          </el-card>

          <!-- 投放规则 - 动态字段 -->
          <el-card title="投放规则">
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
                  :icon="Delete"
                  circle
                  @click="removeField('delivery_rules', index)"
                />
              </div>
              <el-button
                type="primary"
                :icon="Plus"
                @click="addField('delivery_rules')"
              >
                添加投放规则
              </el-button>
            </div>
          </el-card>

          <!-- 用户定向 - 动态字段 -->
          <el-card title="用户定向">
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
                  :icon="Delete"
                  circle
                  @click="removeField('user_targeting', index)"
                />
              </div>
              <el-button
                type="primary"
                :icon="Plus"
                @click="addField('user_targeting')"
              >
                添加用户定向
              </el-button>
            </div>
          </el-card>

          <div class="form-actions">
            <el-button type="primary" size="large" @click="handleSubmit" :loading="loading">
              {{ isEdit ? '更新' : '创建' }}
            </el-button>
            <el-button size="large" @click="handleBack">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, VideoCamera } from '@element-plus/icons-vue'
import { createCampaign, updateCampaign, getCampaign } from '@/api/campaigns'
import { getProducts } from '@/api/products'
import { uploadCampaignFile } from '@/api/upload'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'

interface CustomField {
  title: string
  content: string
}

interface CampaignForm {
  name: string
  product_id: number | null
  description: string
  status: number
  main_image: string
  video: string
  delivery_content: CustomField[]
  delivery_rules: CustomField[]
  user_targeting: CustomField[]
}

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const productList = ref<any[]>([])

const isEdit = computed(() => !!route.params.id)
const campaignId = computed(() => route.params.id as string)

const formData = reactive<CampaignForm>({
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

const rules: FormRules = {
  name: [
    { required: true, message: '请输入计划名称', trigger: 'blur' }
  ],
  product_id: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ]
}

onMounted(async () => {
  await loadProducts()
  if (isEdit.value) {
    await loadCampaign()
  }
})

const loadProducts = async () => {
  try {
    const res = await getProducts({ page: 1, pageSize: 100 })
    if (res.code === 200) {
      // 后端直接返回data数组
      productList.value = res.data || []
      console.log('Products loaded:', productList.value)
    }
  } catch (error) {
    console.error('Failed to load products:', error)
    ElMessage.error('加载产品列表失败')
  }
}

const loadCampaign = async () => {
  try {
    loading.value = true
    const res = await getCampaign(parseInt(campaignId.value))
    const campaign = res.data
    console.log('Campaign loaded:', campaign)

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
  } catch (error) {
    ElMessage.error('加载计划信息失败')
    console.error('Load campaign error:', error)
  } finally {
    loading.value = false
  }
}

// 自定义上传主图
const handleMainImageUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadCampaignFile(options.file as File)
    // 处理返回的URL,如果是相对路径则拼接完整URL
    let imageUrl = res.data.url || res.data
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `http://localhost:8089${imageUrl}`
    }
    formData.main_image = imageUrl
    console.log('Main image uploaded:', imageUrl)
    ElMessage.success('主图上传成功')
  } catch (error: any) {
    console.error('Upload error:', error)
    ElMessage.error(error.message || '主图上传失败')
  }
}

// 自定义上传视频
const handleVideoUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadCampaignFile(options.file as File)
    // 处理返回的URL,如果是相对路径则拼接完整URL
    let videoUrl = res.data.url || res.data
    if (videoUrl && !videoUrl.startsWith('http')) {
      videoUrl = `http://localhost:8089${videoUrl}`
    }
    formData.video = videoUrl
    console.log('Video uploaded:', videoUrl)
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

const addField = (fieldName: 'delivery_content' | 'delivery_rules' | 'user_targeting') => {
  formData[fieldName].push({ title: '', content: '' })
}

const removeField = (
  fieldName: 'delivery_content' | 'delivery_rules' | 'user_targeting',
  index: number
) => {
  formData[fieldName].splice(index, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      if (isEdit.value) {
        await updateCampaign(parseInt(campaignId.value), formData)
        ElMessage.success('计划更新成功')
      } else {
        await createCampaign(formData)
        ElMessage.success('计划创建成功')
      }
      router.push('/campaigns/list')
    } catch (error: any) {
      ElMessage.error(error.message || (isEdit.value ? '更新失败' : '创建失败'))
    } finally {
      loading.value = false
    }
  })
}

const handleBack = () => {
  router.push('/campaigns/list')
}
</script>

<style lang="scss" scoped>
.campaign-form {
  padding: 20px;
  
  .page-container {
    max-width: 100%;
    margin: 0 auto;
    
    @media (min-width: 1400px) {
      max-width: 1200px;
    }
  }
  
  .page-header {
    margin-bottom: 20px;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 5px 0;
    }
    
    .page-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }
  
  .form-container {
    :deep(.el-card) {
      margin-bottom: 20px;
      
      .el-card__header {
        font-weight: 600;
      }
    }
    
    // 响应式表单
    @media (max-width: 768px) {
      :deep(.el-col) {
        max-width: 100% !important;
        flex: 0 0 100% !important;
      }
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
        width: 200px;
        flex-shrink: 0;
      }
      
      .field-content {
        flex: 1;
      }
    }
  }
  
  .form-actions {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 15px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style>
