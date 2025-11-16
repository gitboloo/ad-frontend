<template>
  <el-dialog
    v-model="visible"
    title="生成授权码"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="generate-form"
    >
      <el-form-item label="授权码类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio value="trial">
            <div class="type-option">
              <div class="type-title">试用版</div>
              <div class="type-desc">基础功能，适合试用</div>
            </div>
          </el-radio>
          <el-radio value="premium">
            <div class="type-option">
              <div class="type-title">专业版</div>
              <div class="type-desc">完整功能，适合个人用户</div>
            </div>
          </el-radio>
          <el-radio value="enterprise">
            <div class="type-option">
              <div class="type-title">企业版</div>
              <div class="type-desc">全部功能，适合企业用户</div>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="有效期" prop="duration">
        <div class="duration-input">
          <el-input-number
            v-model="form.duration"
            :min="1"
            :max="365"
            style="width: 150px"
          />
          <span class="duration-unit">天</span>
        </div>
        <div class="duration-presets">
          <el-button
            v-for="preset in durationPresets"
            :key="preset.value"
            size="small"
            text
            @click="form.duration = preset.value"
          >
            {{ preset.label }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="用户数限制">
        <div class="user-limit-section">
          <el-checkbox v-model="form.hasUserLimit" @change="handleUserLimitChange">
            启用用户数限制
          </el-checkbox>
          <el-input-number
            v-if="form.hasUserLimit"
            v-model="form.maxUsers"
            :min="1"
            :max="1000"
            style="width: 150px; margin-left: 12px"
          />
        </div>
      </el-form-item>

      <el-form-item label="功能特性" prop="features">
        <div class="features-section">
          <div class="features-category">
            <h4>基础功能</h4>
            <el-checkbox-group v-model="form.features">
              <el-checkbox
                v-for="feature in baseFeatures"
                :key="feature.value"
                :value="feature.value"
                :disabled="getFeatureDisabled(feature.type)"
              >
                {{ feature.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          
          <div class="features-category">
            <h4>高级功能</h4>
            <el-checkbox-group v-model="form.features">
              <el-checkbox
                v-for="feature in advancedFeatures"
                :key="feature.value"
                :value="feature.value"
                :disabled="getFeatureDisabled(feature.type)"
              >
                {{ feature.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="features-category">
            <h4>企业功能</h4>
            <el-checkbox-group v-model="form.features">
              <el-checkbox
                v-for="feature in enterpriseFeatures"
                :key="feature.value"
                :value="feature.value"
                :disabled="getFeatureDisabled(feature.type)"
              >
                {{ feature.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="生成数量" prop="quantity">
        <div class="quantity-section">
          <el-radio-group v-model="form.generateMode">
            <el-radio value="single">单个生成</el-radio>
            <el-radio value="batch">批量生成</el-radio>
          </el-radio-group>
          <el-input-number
            v-if="form.generateMode === 'batch'"
            v-model="form.quantity"
            :min="1"
            :max="100"
            style="width: 150px; margin-left: 12px"
          />
        </div>
      </el-form-item>

      <el-form-item label="备注说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入授权码的用途说明（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 预览信息 -->
    <el-card class="preview-card" shadow="never">
      <template #header>
        <span>生成预览</span>
      </template>
      <div class="preview-content">
        <div class="preview-item">
          <label>类型:</label>
          <el-tag :type="getTypeTagType(form.type)">
            {{ getTypeLabel(form.type) }}
          </el-tag>
        </div>
        <div class="preview-item">
          <label>有效期:</label>
          <span>{{ form.duration }}天</span>
        </div>
        <div class="preview-item">
          <label>用户限制:</label>
          <span>{{ form.hasUserLimit ? `${form.maxUsers}人` : '无限制' }}</span>
        </div>
        <div class="preview-item">
          <label>功能数量:</label>
          <span>{{ form.features.length }}个功能</span>
        </div>
        <div class="preview-item">
          <label>生成数量:</label>
          <span>{{ form.generateMode === 'single' ? 1 : form.quantity }}个</span>
        </div>
        <div class="preview-item">
          <label>过期时间:</label>
          <span>{{ getExpireDate() }}</span>
        </div>
      </div>
    </el-card>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleGenerate"
        >
          生成授权码
        </el-button>
      </div>
    </template>

    <!-- 生成结果对话框 -->
    <el-dialog
      v-model="showResultDialog"
      title="授权码生成成功"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="result-content">
        <el-alert
          :title="`成功生成 ${generatedCodes.length} 个授权码`"
          type="success"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <div class="codes-list">
          <div
            v-for="(code, index) in generatedCodes"
            :key="code.id"
            class="code-item"
          >
            <div class="code-info">
              <span class="code-number">{{ index + 1 }}.</span>
              <el-text class="code-value">{{ code.code }}</el-text>
            </div>
            <el-button
              type="primary"
              size="small"
              text
              :icon="CopyDocument"
              @click="copyCode(code.code)"
            >
              复制
            </el-button>
          </div>
        </div>

        <div class="result-actions">
          <el-button
            type="primary"
            :icon="CopyDocument"
            @click="copyAllCodes"
          >
            复制全部
          </el-button>
          <el-button
            :icon="Download"
            @click="downloadCodes"
          >
            导出文件
          </el-button>
        </div>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { CopyDocument, Download } from '@element-plus/icons-vue'
import { generateAuthCode, batchGenerateAuthCodes } from '@/api/authcodes'
import type { AuthCode } from '@/types'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const showResultDialog = ref(false)
const generatedCodes = ref<AuthCode[]>([])

// 表单数据
const form = reactive({
  type: 'trial' as 'trial' | 'premium' | 'enterprise',
  duration: 30,
  hasUserLimit: false,
  maxUsers: 10,
  features: [] as string[],
  generateMode: 'single' as 'single' | 'batch',
  quantity: 1,
  description: ''
})

// 持续时间预设
const durationPresets = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
  { label: '365天', value: 365 }
]

// 功能列表
const baseFeatures = [
  { value: 'basic_ads', label: '基础广告投放', type: 'all' },
  { value: 'campaign_management', label: '活动管理', type: 'all' },
  { value: 'basic_analytics', label: '基础数据分析', type: 'all' },
  { value: 'customer_support', label: '客户支持', type: 'all' }
]

const advancedFeatures = [
  { value: 'advanced_targeting', label: '精准定向', type: 'premium+' },
  { value: 'ab_testing', label: 'A/B测试', type: 'premium+' },
  { value: 'advanced_analytics', label: '高级数据分析', type: 'premium+' },
  { value: 'api_access', label: 'API访问', type: 'premium+' }
]

const enterpriseFeatures = [
  { value: 'white_label', label: '白标服务', type: 'enterprise' },
  { value: 'dedicated_support', label: '专属客服', type: 'enterprise' },
  { value: 'custom_integration', label: '定制集成', type: 'enterprise' },
  { value: 'unlimited_users', label: '无限用户', type: 'enterprise' }
]

// 表单验证规则
const rules: FormRules = {
  type: [
    { required: true, message: '请选择授权码类型', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请输入有效期', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '有效期应在1-365天之间', trigger: 'blur' }
  ],
  features: [
    { required: true, message: '请至少选择一个功能特性', trigger: 'change' }
  ],
  quantity: [
    { type: 'number', min: 1, max: 100, message: '数量应在1-100之间', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// 监听类型变化，自动设置功能
watch(() => form.type, (newType) => {
  form.features = []
  
  // 根据类型自动选择基础功能
  form.features.push(...baseFeatures.map(f => f.value))
  
  if (newType === 'premium' || newType === 'enterprise') {
    form.features.push(...advancedFeatures.map(f => f.value))
  }
  
  if (newType === 'enterprise') {
    form.features.push(...enterpriseFeatures.map(f => f.value))
  }
})

// 获取功能是否禁用
const getFeatureDisabled = (featureType: string) => {
  if (featureType === 'all') return false
  if (featureType === 'premium+' && form.type === 'trial') return true
  if (featureType === 'enterprise' && form.type !== 'enterprise') return true
  return false
}

// 处理用户限制变化
const handleUserLimitChange = (value: boolean) => {
  if (!value) {
    form.maxUsers = 10
  }
}

// 获取过期日期
const getExpireDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + form.duration)
  return date.toLocaleDateString('zh-CN')
}

// 工具函数
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    trial: '试用版',
    premium: '专业版',
    enterprise: '企业版'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, string> = {
    trial: 'info',
    premium: 'success',
    enterprise: 'warning'
  }
  return types[type] || 'info'
}

// 生成授权码
const handleGenerate = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const requestData = {
      type: form.type,
      duration: form.duration,
      maxUsers: form.hasUserLimit ? form.maxUsers : undefined,
      features: form.features,
      description: form.description || undefined
    }
    
    let result
    if (form.generateMode === 'single') {
      result = await generateAuthCode({ ...requestData, quantity: 1 })
    } else {
      result = await batchGenerateAuthCodes({ ...requestData, quantity: form.quantity })
    }
    
    generatedCodes.value = Array.isArray(result.data) ? result.data : [result.data]
    showResultDialog.value = true
    visible.value = false
    
    ElMessage.success('授权码生成成功')
    emit('success')
    
  } catch (error: any) {
    ElMessage.error(error.message || '生成失败')
  } finally {
    loading.value = false
  }
}

// 复制单个授权码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 复制全部授权码
const copyAllCodes = async () => {
  try {
    const codes = generatedCodes.value.map(item => item.code).join('\n')
    await navigator.clipboard.writeText(codes)
    ElMessage.success('已复制全部授权码到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载授权码文件
const downloadCodes = () => {
  const content = generatedCodes.value.map((item, index) => 
    `${index + 1}. ${item.code} (${getTypeLabel(item.type)}, ${item.duration}天)`
  ).join('\n')
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `授权码_${new Date().getTime()}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载成功')
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  Object.assign(form, {
    type: 'trial',
    duration: 30,
    hasUserLimit: false,
    maxUsers: 10,
    features: [],
    generateMode: 'single',
    quantity: 1,
    description: ''
  })
}

// 初始化时设置默认功能
form.features.push(...baseFeatures.map(f => f.value))
</script>

<style lang="scss" scoped>
.generate-form {
  .type-option {
    .type-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .type-desc {
      font-size: 12px;
      color: #6b7280;
    }
  }

  .duration-input {
    display: flex;
    align-items: center;
    gap: 8px;

    .duration-unit {
      font-size: 14px;
      color: #6b7280;
    }
  }

  .duration-presets {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .user-limit-section {
    display: flex;
    align-items: center;
  }

  .features-section {
    .features-category {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .el-checkbox-group {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 8px;

        .el-checkbox {
          margin-right: 0;
        }
      }
    }
  }

  .quantity-section {
    display: flex;
    align-items: center;
  }
}

.preview-card {
  margin-top: 20px;
  
  .preview-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .preview-item {
      display: flex;
      align-items: center;
      gap: 8px;

      label {
        font-weight: 500;
        color: #374151;
        min-width: 80px;
      }
    }
  }
}

.result-content {
  .codes-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 20px;

    .code-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      .code-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .code-number {
          color: #6b7280;
          font-size: 12px;
          min-width: 20px;
        }

        .code-value {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          color: #374151;
        }
      }
    }
  }

  .result-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .preview-content {
    grid-template-columns: 1fr;
  }

  .features-category .el-checkbox-group {
    grid-template-columns: 1fr;
  }

  .result-content .codes-list {
    .code-item {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      
      .code-info {
        justify-content: space-between;
      }
    }
  }
}
</style>