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

        <el-form-item label="计划描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入计划描述"
          />
        </el-form-item>

        <el-form-item label="计划状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="计划Logo" prop="logo">
          <el-upload
            class="logo-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="formData.logo" :src="formData.logo" class="logo" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="投放内容" prop="delivery_content">
          <div class="json-editor">
            <el-input
              v-model="deliveryContentStr"
              type="textarea"
              :rows="6"
              placeholder='请输入JSON格式的投放内容，例如：{"title": "标题", "content": "内容", "action": "操作"}'
            />
          </div>
        </el-form-item>

        <el-form-item label="投放规则" prop="delivery_rules">
          <div class="json-editor">
            <el-input
              v-model="deliveryRulesStr"
              type="textarea"
              :rows="6"
              placeholder='请输入JSON格式的投放规则'
            />
          </div>
        </el-form-item>

        <el-form-item label="用户定向" prop="user_targeting">
          <div class="json-editor">
            <el-input
              v-model="userTargetingStr"
              type="textarea"
              :rows="6"
              placeholder='请输入JSON格式的用户定向规则'
            />
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
import { Plus } from '@element-plus/icons-vue'
import { createCampaign, updateCampaign, getCampaign } from '@/api/campaigns'
import { getProducts } from '@/api/products'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

interface CampaignForm {
  name: string
  product_id: number | null
  description: string
  status: number
  logo: string
  delivery_content: any
  delivery_rules: any
  user_targeting: any
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
  logo: '',
  delivery_content: {},
  delivery_rules: {},
  user_targeting: {}
})

const deliveryContentStr = ref('{}')
const deliveryRulesStr = ref('{}')
const userTargetingStr = ref('{}')

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
    
    Object.assign(formData, campaign)
    deliveryContentStr.value = JSON.stringify(campaign.delivery_content || {}, null, 2)
    deliveryRulesStr.value = JSON.stringify(campaign.delivery_rules || {}, null, 2)
    userTargetingStr.value = JSON.stringify(campaign.user_targeting || {}, null, 2)
  } catch (error) {
    ElMessage.error('加载计划信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleLogoSuccess: UploadProps['onSuccess'] = (response) => {
  formData.logo = response.data.url
}

const beforeLogoUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Logo必须是JPG或PNG格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Logo大小不能超过2MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      // 解析JSON字符串
      formData.delivery_content = JSON.parse(deliveryContentStr.value || '{}')
      formData.delivery_rules = JSON.parse(deliveryRulesStr.value || '{}')
      formData.user_targeting = JSON.parse(userTargetingStr.value || '{}')
    } catch (error) {
      ElMessage.error('JSON格式错误，请检查输入')
      return
    }
    
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

.logo-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.logo-uploader:hover {
  border-color: var(--el-color-primary);
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.json-editor {
  width: 100%;
}
</style>