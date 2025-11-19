<template>
  <div class="campaign-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑计划' : '创建计划' }}</span>
          <el-button type="text" @click="handleBack">返回列表</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        :disabled="loading"
      >
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入计划名称" />
        </el-form-item>

        <el-form-item label="关联产品" prop="product_id">
          <el-select
            v-model="formData.product_id"
            placeholder="请选择产品"
            style="width: 100%"
          >
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="计划简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入计划简介"
          />
        </el-form-item>

        <el-form-item label="计划状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="主图" prop="main_image">
          <el-upload
            class="image-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleMainImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="formData.main_image" :src="formData.main_image" class="uploaded-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">推荐尺寸: 800x600px, 支持JPG/PNG, 最大2MB</div>
        </el-form-item>

        <el-form-item label="视频" prop="video">
          <el-upload
            class="video-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleVideoSuccess"
            :before-upload="beforeVideoUpload"
          >
            <video v-if="formData.video" :src="formData.video" class="uploaded-video" controls />
            <el-icon v-else class="uploader-icon"><VideoCamera /></el-icon>
          </el-upload>
          <div class="form-tip">支持MP4格式, 最大50MB</div>
        </el-form-item>

        <!-- 投放内容 - 动态字段 -->
        <el-form-item label="投放内容">
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
        </el-form-item>

        <!-- 投放规则 - 动态字段 -->
        <el-form-item label="投放规则">
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
        </el-form-item>

        <!-- 用户定向 - 动态字段 -->
        <el-form-item label="用户定向">
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
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, VideoCamera } from '@element-plus/icons-vue'
import { createCampaign, updateCampaign, getCampaign } from '@/api/campaigns'
import { getProducts } from '@/api/products'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

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
    const res = await getProducts({ page: 1, size: 100 })
    productList.value = res.data.data
  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadCampaign = async () => {
  try {
    loading.value = true
    const res = await getCampaign(campaignId.value)
    const campaign = res.data.data

    Object.assign(formData, {
      name: campaign.name,
      product_id: campaign.product_id,
      description: campaign.description,
      status: campaign.status,
      main_image: campaign.main_image || '',
      video: campaign.video || '',
      delivery_content: campaign.delivery_content || [],
      delivery_rules: campaign.delivery_rules || [],
      user_targeting: campaign.user_targeting || []
    })
  } catch (error) {
    ElMessage.error('加载计划信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleMainImageSuccess: UploadProps['onSuccess'] = (response) => {
  formData.main_image = response.data.url
}

const handleVideoSuccess: UploadProps['onSuccess'] = (response) => {
  formData.video = response.data.url
}

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const validTypes = ['image/jpeg', 'image/png']
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

const beforeVideoUpload: UploadProps['beforeUpload'] = (rawFile) => {
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
        await updateCampaign(campaignId.value, formData)
        ElMessage.success('计划更新成功')
      } else {
        await createCampaign(formData)
        ElMessage.success('计划创建成功')
      }
      router.push('/campaigns/list')
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      loading.value = false
    }
  })
}

const handleBack = () => {
  router.push('/campaigns/list')
}
</script>

<style scoped>
.campaign-form-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-uploader,
.video-uploader {
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
}

.image-uploader:hover,
.video-uploader:hover {
  border-color: var(--el-color-primary);
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.dynamic-fields {
  width: 100%;
}

.field-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: flex-start;
}

.field-title {
  width: 200px;
  flex-shrink: 0;
}

.field-content {
  flex: 1;
}
</style>
