<template>
  <div class="system-config-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <div class="header-actions">
            <el-button @click="handleReset" :disabled="loading">重置</el-button>
            <el-button type="primary" @click="handleSave" :loading="loading">
              保存配置
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form
            ref="basicFormRef"
            :model="formData"
            :rules="basicRules"
            label-width="150px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="网站名称" prop="siteName">
                  <el-input
                    v-model="formData.siteName"
                    placeholder="请输入网站名称"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="网站地址" prop="siteUrl">
                  <el-input
                    v-model="formData.siteUrl"
                    placeholder="请输入网站地址"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="管理员邮箱" prop="adminEmail">
                  <el-input
                    v-model="formData.adminEmail"
                    placeholder="请输入管理员邮箱"
                    type="email"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认语言" prop="defaultLanguage">
                  <el-select
                    v-model="formData.defaultLanguage"
                    style="width: 100%"
                  >
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="繁体中文" value="zh-TW" />
                    <el-option label="English" value="en-US" />
                    <el-option label="日本語" value="ja-JP" />
                    <el-option label="한국어" value="ko-KR" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="时区" prop="timezone">
                  <el-select
                    v-model="formData.timezone"
                    style="width: 100%"
                    filterable
                  >
                    <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
                    <el-option label="Asia/Tokyo" value="Asia/Tokyo" />
                    <el-option label="Asia/Seoul" value="Asia/Seoul" />
                    <el-option label="America/New_York" value="America/New_York" />
                    <el-option label="America/Los_Angeles" value="America/Los_Angeles" />
                    <el-option label="Europe/London" value="Europe/London" />
                    <el-option label="UTC" value="UTC" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="货币单位" prop="currency">
                  <el-select
                    v-model="formData.currency"
                    style="width: 100%"
                  >
                    <el-option label="人民币 (CNY)" value="CNY" />
                    <el-option label="美元 (USD)" value="USD" />
                    <el-option label="欧元 (EUR)" value="EUR" />
                    <el-option label="日元 (JPY)" value="JPY" />
                    <el-option label="韩元 (KRW)" value="KRW" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider />

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="维护模式">
                  <el-switch
                    v-model="formData.maintenance"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <div class="form-help">开启后，普通用户无法访问系统</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="用户注册">
                  <el-switch
                    v-model="formData.registrationEnabled"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <div class="form-help">是否允许新用户注册</div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="邮箱验证">
              <el-switch
                v-model="formData.emailVerificationRequired"
                active-text="必须"
                inactive-text="可选"
              />
              <div class="form-help">新用户注册是否需要邮箱验证</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 上传设置 -->
        <el-tab-pane label="上传设置" name="upload">
          <el-form
            ref="uploadFormRef"
            :model="formData"
            :rules="uploadRules"
            label-width="150px"
          >
            <el-form-item label="最大上传大小" prop="maxUploadSize">
              <el-input
                v-model.number="formData.maxUploadSize"
                type="number"
                style="width: 200px"
              >
                <template #append>MB</template>
              </el-input>
              <div class="form-help">单个文件最大上传大小限制</div>
            </el-form-item>

            <el-form-item label="允许的文件类型" prop="allowedFileTypes">
              <el-select
                v-model="formData.allowedFileTypes"
                multiple
                style="width: 100%"
                placeholder="选择允许的文件类型"
              >
                <el-option-group label="图片">
                  <el-option label="JPEG" value="image/jpeg" />
                  <el-option label="PNG" value="image/png" />
                  <el-option label="GIF" value="image/gif" />
                  <el-option label="WebP" value="image/webp" />
                </el-option-group>
                <el-option-group label="文档">
                  <el-option label="PDF" value="application/pdf" />
                  <el-option label="Word" value="application/msword" />
                  <el-option label="Excel" value="application/vnd.ms-excel" />
                  <el-option label="PowerPoint" value="application/vnd.ms-powerpoint" />
                </el-option-group>
                <el-option-group label="视频">
                  <el-option label="MP4" value="video/mp4" />
                  <el-option label="AVI" value="video/avi" />
                  <el-option label="MOV" value="video/quicktime" />
                </el-option-group>
                <el-option-group label="音频">
                  <el-option label="MP3" value="audio/mpeg" />
                  <el-option label="WAV" value="audio/wav" />
                  <el-option label="AAC" value="audio/aac" />
                </el-option-group>
              </el-select>
              <div class="form-help">用户可以上传的文件类型</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 功能设置 -->
        <el-tab-pane label="功能设置" name="features">
          <div class="features-grid">
            <div
              v-for="(feature, key) in formData.features"
              :key="key"
              class="feature-item"
            >
              <div class="feature-header">
                <span class="feature-name">{{ getFeatureName(key) }}</span>
                <el-switch
                  v-model="formData.features[key]"
                  size="small"
                />
              </div>
              <div class="feature-desc">{{ getFeatureDesc(key) }}</div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 集成设置 -->
        <el-tab-pane label="集成设置" name="integrations">
          <div class="integrations-container">
            <div
              v-for="(integration, key) in formData.integrations"
              :key="key"
              class="integration-item"
            >
              <div class="integration-header">
                <div class="integration-info">
                  <h4>{{ getIntegrationName(key) }}</h4>
                  <p>{{ getIntegrationDesc(key) }}</p>
                </div>
                <el-switch
                  v-model="integration.enabled"
                  size="large"
                />
              </div>
              
              <div v-if="integration.enabled" class="integration-config">
                <el-form
                  :model="integration.config"
                  label-width="120px"
                  size="small"
                >
                  <template v-if="key === 'email'">
                    <el-form-item label="SMTP服务器">
                      <el-input v-model="integration.config.host" />
                    </el-form-item>
                    <el-form-item label="端口">
                      <el-input v-model.number="integration.config.port" type="number" />
                    </el-form-item>
                    <el-form-item label="用户名">
                      <el-input v-model="integration.config.username" />
                    </el-form-item>
                    <el-form-item label="密码">
                      <el-input v-model="integration.config.password" type="password" show-password />
                    </el-form-item>
                  </template>
                  
                  <template v-if="key === 'sms'">
                    <el-form-item label="API Key">
                      <el-input v-model="integration.config.apiKey" />
                    </el-form-item>
                    <el-form-item label="Secret Key">
                      <el-input v-model="integration.config.secretKey" type="password" show-password />
                    </el-form-item>
                  </template>
                  
                  <template v-if="key === 'payment'">
                    <el-form-item label="商户号">
                      <el-input v-model="integration.config.merchantId" />
                    </el-form-item>
                    <el-form-item label="API Key">
                      <el-input v-model="integration.config.apiKey" />
                    </el-form-item>
                    <el-form-item label="回调地址">
                      <el-input v-model="integration.config.callbackUrl" />
                    </el-form-item>
                  </template>
                </el-form>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 系统工具 -->
        <el-tab-pane label="系统工具" name="tools">
          <div class="tools-container">
            <div class="tool-section">
              <h3>缓存管理</h3>
              <div class="tool-item">
                <div class="tool-info">
                  <strong>清理系统缓存</strong>
                  <p>清理所有缓存数据，提升系统性能</p>
                </div>
                <el-button
                  type="warning"
                  @click="handleClearCache"
                  :loading="clearCacheLoading"
                >
                  清理缓存
                </el-button>
              </div>
            </div>

            <div class="tool-section">
              <h3>数据备份</h3>
              <div class="tool-item">
                <div class="tool-info">
                  <strong>备份数据库</strong>
                  <p>创建数据库完整备份，建议定期执行</p>
                </div>
                <el-button
                  type="primary"
                  @click="handleBackup"
                  :loading="backupLoading"
                >
                  立即备份
                </el-button>
              </div>
            </div>

            <div class="tool-section">
              <h3>系统信息</h3>
              <div class="system-stats" v-if="systemStats">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="系统版本">{{ systemStats.version || 'v1.0.0' }}</el-descriptions-item>
                  <el-descriptions-item label="PHP版本">{{ systemStats.phpVersion || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="数据库版本">{{ systemStats.dbVersion || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="运行时间">{{ systemStats.uptime || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="内存使用">{{ systemStats.memoryUsage || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="磁盘使用">{{ systemStats.diskUsage || 'N/A' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSystemConfig,
  updateSystemConfig,
  clearSystemCache,
  backupDatabase,
  getSystemStats
} from '@/api/system'
import type { SystemConfig } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const activeTab = ref('basic')
const loading = ref(false)
const clearCacheLoading = ref(false)
const backupLoading = ref(false)
const basicFormRef = ref<FormInstance>()
const uploadFormRef = ref<FormInstance>()
const systemStats = ref<any>(null)
const originalData = ref<SystemConfig | null>(null)

const formData = reactive<SystemConfig>({
  siteName: '',
  siteUrl: '',
  adminEmail: '',
  defaultLanguage: 'zh-CN',
  timezone: 'Asia/Shanghai',
  currency: 'CNY',
  maintenance: false,
  registrationEnabled: true,
  emailVerificationRequired: false,
  maxUploadSize: 10,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
  features: {
    userRegistration: true,
    emailNotification: true,
    smsNotification: false,
    fileUpload: true,
    dataExport: true,
    apiAccess: false,
    multiLanguage: false,
    darkMode: true,
    maintenance: false,
    analytics: true
  },
  integrations: {
    email: {
      enabled: false,
      config: {
        host: '',
        port: 587,
        username: '',
        password: ''
      }
    },
    sms: {
      enabled: false,
      config: {
        apiKey: '',
        secretKey: ''
      }
    },
    payment: {
      enabled: false,
      config: {
        merchantId: '',
        apiKey: '',
        callbackUrl: ''
      }
    }
  }
})

const basicRules: FormRules = {
  siteName: [
    { required: true, message: '请输入网站名称', trigger: 'blur' }
  ],
  siteUrl: [
    { required: true, message: '请输入网站地址', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入有效的URL', trigger: 'blur' }
  ],
  adminEmail: [
    { required: true, message: '请输入管理员邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const uploadRules: FormRules = {
  maxUploadSize: [
    { required: true, message: '请输入最大上传大小', trigger: 'blur' },
    { type: 'number', min: 1, max: 1024, message: '大小范围为1-1024MB', trigger: 'blur' }
  ]
}

onMounted(async () => {
  await loadConfig()
  await loadSystemStats()
})

const loadConfig = async () => {
  try {
    loading.value = true
    const res = await getSystemConfig()
    const config = res.data
    
    // 保存原始数据用于重置
    originalData.value = JSON.parse(JSON.stringify(config))
    
    // 合并配置数据，确保所有字段都有默认值
    Object.assign(formData, {
      ...formData,
      ...config,
      features: {
        ...formData.features,
        ...config.features
      },
      integrations: {
        ...formData.integrations,
        ...config.integrations
      }
    })
  } catch (error) {
    ElMessage.error('加载系统配置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadSystemStats = async () => {
  try {
    const res = await getSystemStats()
    systemStats.value = res.data
  } catch (error) {
    console.error('Failed to load system stats:', error)
  }
}

const handleSave = async () => {
  // 验证所有表单
  const basicValid = await basicFormRef.value?.validate().catch(() => false)
  const uploadValid = await uploadFormRef.value?.validate().catch(() => false)
  
  if (!basicValid || !uploadValid) {
    ElMessage.error('请检查表单填写')
    return
  }
  
  try {
    loading.value = true
    await updateSystemConfig(formData)
    ElMessage.success('配置保存成功')
    
    // 重新加载配置
    await loadConfig()
  } catch (error) {
    ElMessage.error('保存配置失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  if (originalData.value) {
    Object.assign(formData, JSON.parse(JSON.stringify(originalData.value)))
    ElMessage.info('配置已重置')
  }
}

const handleClearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理系统缓存吗？此操作可能会影响系统性能。',
      '确认操作',
      { type: 'warning' }
    )
    
    clearCacheLoading.value = true
    await clearSystemCache()
    ElMessage.success('缓存清理成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('缓存清理失败')
    }
  } finally {
    clearCacheLoading.value = false
  }
}

const handleBackup = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要创建数据库备份吗？此过程可能需要一些时间。',
      '确认备份',
      { type: 'info' }
    )
    
    backupLoading.value = true
    await backupDatabase()
    ElMessage.success('数据库备份成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('数据库备份失败')
    }
  } finally {
    backupLoading.value = false
  }
}

// 辅助函数
const getFeatureName = (key: string) => {
  const names: Record<string, string> = {
    userRegistration: '用户注册',
    emailNotification: '邮件通知',
    smsNotification: '短信通知',
    fileUpload: '文件上传',
    dataExport: '数据导出',
    apiAccess: 'API访问',
    multiLanguage: '多语言',
    darkMode: '深色模式',
    maintenance: '维护模式',
    analytics: '数据分析'
  }
  return names[key] || key
}

const getFeatureDesc = (key: string) => {
  const descs: Record<string, string> = {
    userRegistration: '允许新用户注册账号',
    emailNotification: '启用邮件通知功能',
    smsNotification: '启用短信通知功能',
    fileUpload: '允许用户上传文件',
    dataExport: '允许导出数据',
    apiAccess: '开放API访问接口',
    multiLanguage: '支持多语言切换',
    darkMode: '支持深色主题模式',
    maintenance: '系统维护模式',
    analytics: '启用数据分析统计'
  }
  return descs[key] || ''
}

const getIntegrationName = (key: string) => {
  const names: Record<string, string> = {
    email: '邮件服务',
    sms: '短信服务',
    payment: '支付服务'
  }
  return names[key] || key
}

const getIntegrationDesc = (key: string) => {
  const descs: Record<string, string> = {
    email: '配置SMTP邮件服务器',
    sms: '配置短信服务提供商',
    payment: '配置在线支付接口'
  }
  return descs[key] || ''
}
</script>

<style scoped>
.system-config-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.form-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.feature-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 15px;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feature-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.feature-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.integrations-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.integration-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 20px;
}

.integration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.integration-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.integration-info p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.integration-config {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 15px;
}

.tools-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.tool-section h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.tool-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.tool-info strong {
  display: block;
  margin-bottom: 5px;
  color: var(--el-text-color-primary);
}

.tool-info p {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.system-stats {
  margin-top: 15px;
}
</style>