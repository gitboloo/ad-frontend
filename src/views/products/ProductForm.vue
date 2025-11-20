<template>
  <div class="product-form">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? '编辑产品' : '创建产品' }}</h1>
        <p class="page-description">{{ isEdit ? '修改产品信息' : '填写产品基本信息' }}</p>
      </div>
      
      <div class="form-container">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          size="large"
        >
          <el-card title="基本信息">
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
                  <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
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
                :rows="4"
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
                    <img v-if="form.logo" :src="form.logo" class="logo-image" @error="handleImageError" />
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
                <el-form-item label="Google Play链接">
                  <el-input v-model="form.googlePayLink" placeholder="请输入Google Play应用链接" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="App Store链接">
                  <el-input v-model="form.appStoreLink" placeholder="请输入App Store应用链接" />
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
                    placeholder="请输入标题/类头"
                    style="width: 200px; margin-right: 10px"
                  />
                  <el-input
                    v-model="info.value"
                    placeholder="请输入内容"
                    style="width: 300px; margin-right: 10px"
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
          </el-card>
          
          <div class="form-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              {{ isEdit ? '更新' : '创建' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import { createProduct, updateProduct, getProduct, uploadFile, uploadFiles } from '@/api/products'
import type { Product } from '@/types'
import type { UploadRequestOptions, UploadUserFile } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()

const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

const form = reactive<any>({
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
const imageFileList = ref<UploadUserFile[]>([])

const rules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择产品状态', trigger: 'change' }]
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
const handleLogoUpload = async (options: UploadRequestOptions) => {
  try {
    const response = await uploadFile(options.file as File)
    if (response.code === 200 && response.data) {
      // 从环境变量读取上传基础URL，如果未配置则从 API_BASE_URL 中提取
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
const handleImagesUpload = async (options: UploadRequestOptions) => {
  try {
    const response = await uploadFile(options.file as File)
    if (response.code === 200 && response.data) {
      // 从环境变量读取上传基础URL，如果未配置则从 API_BASE_URL 中提取
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
const handleImageRemove = (file: UploadUserFile) => {
  const index = form.images.indexOf(file.url)
  if (index > -1) {
    form.images.splice(index, 1)
  }
}

// 图片加载错误处理
const handleImageError = (e: Event) => {
  console.error('Logo图片加载失败:', form.logo)
  ElMessage.error('Logo图片加载失败，请检查URL是否正确')
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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    // 准备提交的数据（images已经是数组）
    const submitData = {
      ...form
    }
    
    if (isEdit.value) {
      const response = await updateProduct(Number(route.params.id), submitData)
      if (response.code === 200) {
        ElMessage.success('更新成功')
        router.back()
      }
    } else {
      const response = await createProduct(submitData)
      if (response.code === 200) {
        ElMessage.success('创建成功')
        router.back()
      }
    }
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

const loadProduct = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await getProduct(Number(route.params.id))
    if (response.code === 200 && response.data) {
      const productData = response.data
      
      // 映射基础字段
      form.name = productData.name
      form.type = productData.type
      form.company = productData.company
      form.status = productData.status
      form.description = productData.description
      form.logo = productData.logo
      
      // 处理images字段：将JSON字符串转换为数组
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
        // 如果是JSON字符串，解析它
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
      
      console.log('Loaded form data:', form)
    }
  } catch (error) {
    console.error('Load product error:', error)
    ElMessage.error('加载产品信息失败')
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
.product-form {
  .form-container {
    max-width: 1000px;
  }
  
  .form-actions {
    margin-top: 24px;
    text-align: center;
    
    .el-button {
      min-width: 120px;
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
      width: 148px;
      height: 148px;
      text-align: center;
      line-height: 148px;
    }
    
    .logo-image {
      width: 148px;
      height: 148px;
      display: block;
      object-fit: contain;
    }
  }
  
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  
  .images-uploader {
    :deep(.el-upload-list__item) {
      transition: all 0.3s;
    }
  }
}
</style>