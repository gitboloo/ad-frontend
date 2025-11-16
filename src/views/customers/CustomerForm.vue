<template>
  <div class="customer-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑客户' : '新建客户' }}</span>
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="formData.username"
                placeholder="请输入用户名"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="formData.email"
                placeholder="请输入邮箱地址"
                type="email"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="!isEdit">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="formData.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="formData.confirmPassword"
                type="password"
                placeholder="请确认密码"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司名称" prop="company">
              <el-input v-model="formData.company" placeholder="请输入公司名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="行业类型" prop="industry">
              <el-select
                v-model="formData.industry"
                placeholder="请选择行业类型"
                style="width: 100%"
                clearable
              >
                <el-option label="互联网" value="internet" />
                <el-option label="电商" value="ecommerce" />
                <el-option label="金融" value="finance" />
                <el-option label="教育" value="education" />
                <el-option label="医疗" value="healthcare" />
                <el-option label="制造业" value="manufacturing" />
                <el-option label="餐饮" value="catering" />
                <el-option label="房地产" value="realestate" />
                <el-option label="旅游" value="tourism" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户等级" prop="level">
              <el-select
                v-model="formData.level"
                placeholder="请选择客户等级"
                style="width: 100%"
              >
                <el-option label="青铜" value="bronze" />
                <el-option label="白银" value="silver" />
                <el-option label="黄金" value="gold" />
                <el-option label="钻石" value="diamond" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio label="active">正常</el-radio>
                <el-radio label="inactive">禁用</el-radio>
                <el-radio label="banned" v-if="$checkPermission(['admin'])">封禁</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="isEdit">
          <el-col :span="12">
            <el-form-item label="余额" prop="balance">
              <el-input
                v-model.number="formData.balance"
                type="number"
                step="0.01"
                placeholder="客户余额"
                :disabled="!$checkPermission(['admin'])"
              >
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总消费">
              <el-input
                :value="formData.totalSpent"
                disabled
                placeholder="总消费金额"
              >
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>个人资料</el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="头像" prop="avatar">
              <el-upload
                class="avatar-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img
                  v-if="formData.profile.avatar"
                  :src="formData.profile.avatar"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="性别">
              <el-radio-group v-model="formData.profile.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生日">
              <el-date-picker
                v-model="formData.profile.birthday"
                type="date"
                placeholder="选择生日"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-select
                v-model="formData.profile.address.province"
                placeholder="省份"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="province in provinces"
                  :key="province.value"
                  :label="province.label"
                  :value="province.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="formData.profile.address.city"
                placeholder="城市"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="city in cities"
                  :key="city.value"
                  :label="city.label"
                  :value="city.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="formData.profile.address.district"
                placeholder="区县"
                style="width: 100%"
                clearable
              >
                <el-option
                  v-for="district in districts"
                  :key="district.value"
                  :label="district.label"
                  :value="district.value"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="formData.profile.address.detail"
                placeholder="详细地址"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="偏好标签">
          <el-select
            v-model="formData.profile.preferences"
            multiple
            placeholder="选择客户偏好"
            style="width: 100%"
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option label="数码产品" value="digital" />
            <el-option label="服装时尚" value="fashion" />
            <el-option label="美食餐饮" value="food" />
            <el-option label="旅游出行" value="travel" />
            <el-option label="运动健身" value="sports" />
            <el-option label="家居生活" value="home" />
            <el-option label="母婴用品" value="baby" />
            <el-option label="教育培训" value="education" />
            <el-option label="金融理财" value="finance" />
            <el-option label="医疗健康" value="health" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCustomer, createCustomer, updateCustomer } from '@/api/customers'
import type { Customer } from '@/types'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)
const customerId = computed(() => route.params.id as string)

interface CustomerForm extends Omit<Customer, 'id' | 'registeredAt' | 'lastActiveAt'> {
  password?: string
  confirmPassword?: string
}

const formData = reactive<CustomerForm>({
  username: '',
  email: '',
  phone: '',
  realName: '',
  company: '',
  industry: '',
  balance: 0,
  totalSpent: 0,
  level: 'bronze',
  status: 'active',
  password: '',
  confirmPassword: '',
  profile: {
    avatar: '',
    gender: '',
    birthday: '',
    address: {
      province: '',
      city: '',
      district: '',
      detail: ''
    },
    preferences: []
  }
})

// 省市区数据（简化版）
const provinces = ref([
  { label: '北京市', value: 'beijing' },
  { label: '上海市', value: 'shanghai' },
  { label: '广东省', value: 'guangdong' },
  { label: '江苏省', value: 'jiangsu' },
  { label: '浙江省', value: 'zhejiang' }
])

const cities = ref([
  { label: '北京市', value: 'beijing' },
  { label: '上海市', value: 'shanghai' },
  { label: '广州市', value: 'guangzhou' },
  { label: '深圳市', value: 'shenzhen' },
  { label: '南京市', value: 'nanjing' },
  { label: '杭州市', value: 'hangzhou' }
])

const districts = ref([
  { label: '朝阳区', value: 'chaoyang' },
  { label: '海淀区', value: 'haidian' },
  { label: '西城区', value: 'xicheng' },
  { label: '东城区', value: 'dongcheng' }
])

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!isEdit.value && value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: !isEdit.value ? [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ] : [],
  confirmPassword: !isEdit.value ? [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ] : [],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择客户等级', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

onMounted(async () => {
  if (isEdit.value) {
    await loadCustomer()
  }
})

const loadCustomer = async () => {
  try {
    loading.value = true
    const res = await getCustomer(customerId.value)
    const customer = res.data
    
    // 填充表单数据，确保profile结构完整
    Object.assign(formData, {
      ...customer,
      profile: {
        avatar: '',
        gender: '',
        birthday: '',
        address: {
          province: '',
          city: '',
          district: '',
          detail: ''
        },
        preferences: [],
        ...customer.profile
      }
    })
  } catch (error) {
    ElMessage.error('加载客户信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  formData.profile.avatar = response.data.url
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像必须是JPG或PNG格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过2MB!')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const submitData = { ...formData }
      
      // 移除确认密码字段
      if ('confirmPassword' in submitData) {
        delete submitData.confirmPassword
      }
      
      // 如果是编辑模式且没有填写密码，则移除密码字段
      if (isEdit.value && !submitData.password) {
        delete submitData.password
      }
      
      if (isEdit.value) {
        await updateCustomer(customerId.value, submitData)
        ElMessage.success('客户信息更新成功')
      } else {
        await createCustomer(submitData)
        ElMessage.success('客户创建成功')
      }
      
      router.push('/customers')
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      loading.value = false
    }
  })
}

const handleBack = () => {
  router.push('/customers')
}
</script>

<style scoped>
.customer-form-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
}
</style>