<template>
  <div class="coupon-form-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑优惠券' : '创建优惠券' }}</span>
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
            <el-form-item label="优惠券名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入优惠券名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优惠券代码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入优惠券代码"
                maxlength="20"
                show-word-limit
              >
                <template #append>
                  <el-button @click="generateCode">生成</el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠类型" prop="type">
              <el-radio-group v-model="formData.type">
                <el-radio label="fixed">固定金额</el-radio>
                <el-radio label="percentage">百分比折扣</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="valueLabel" prop="value">
              <el-input-number
                v-model="formData.value"
                :min="0.01"
                :max="formData.type === 'percentage' ? 100 : 99999"
                :step="formData.type === 'percentage' ? 0.1 : 1"
                :precision="formData.type === 'percentage' ? 1 : 2"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低消费金额">
              <el-input-number
                v-model="formData.minAmount"
                :min="0"
                :precision="2"
                placeholder="0表示无限制"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大优惠金额" v-if="formData.type === 'percentage'">
              <el-input-number
                v-model="formData.maxDiscount"
                :min="0"
                :precision="2"
                placeholder="0表示无限制"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="使用次数限制">
              <el-input-number
                v-model="formData.usageLimit"
                :min="0"
                placeholder="0表示无限制"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio label="active">激活</el-radio>
                <el-radio label="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="有效期开始" prop="validFrom">
              <el-date-picker
                v-model="formData.validFrom"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期结束" prop="validTo">
              <el-date-picker
                v-model="formData.validTo"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="适用产品">
          <el-select
            v-model="formData.applicableProducts"
            placeholder="选择适用产品，不选择表示适用于所有产品"
            multiple
            filterable
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

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新优惠券' : '创建优惠券' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
          <el-button v-if="!isEdit" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createCoupon,
  updateCoupon,
  getCoupon
} from '@/api/coupons'
import { getProducts } from '@/api/products'
import type { FormInstance, FormRules } from 'element-plus'
import type { Coupon, Product } from '@/types'

interface CouponForm {
  name: string
  code: string
  type: 'fixed' | 'percentage'
  value: number
  minAmount?: number
  maxDiscount?: number
  usageLimit?: number
  validFrom: string
  validTo: string
  status: 'active' | 'inactive'
  applicableProducts?: number[]
}

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitLoading = ref(false)
const productList = ref<Product[]>([])

const isEdit = computed(() => !!route.params.id)
const couponId = computed(() => route.params.id as string)

const formData = reactive<CouponForm>({
  name: '',
  code: '',
  type: 'fixed',
  value: 0,
  minAmount: undefined,
  maxDiscount: undefined,
  usageLimit: undefined,
  validFrom: '',
  validTo: '',
  status: 'active',
  applicableProducts: []
})

const valueLabel = computed(() => {
  return formData.type === 'fixed' ? '优惠金额 (元)' : '折扣百分比 (%)'
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入优惠券代码', trigger: 'blur' },
    { min: 4, max: 20, message: '代码长度在 4 到 20 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '代码只能包含大写字母和数字', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择优惠类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入优惠值', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '优惠值必须大于0', trigger: 'blur' }
  ],
  validFrom: [
    { required: true, message: '请选择有效期开始时间', trigger: 'change' }
  ],
  validTo: [
    { required: true, message: '请选择有效期结束时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 生成优惠券代码
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.code = result
}

// 加载产品列表
const loadProducts = async () => {
  try {
    const response = await getProducts({ page: 1, pageSize: 100 })
    productList.value = response.data.items
  } catch (error) {
    console.error('Failed to load products:', error)
    ElMessage.warning('加载产品列表失败')
  }
}

// 加载优惠券详情
const loadCoupon = async () => {
  try {
    loading.value = true
    const response = await getCoupon(couponId.value)
    const coupon = response.data
    
    Object.assign(formData, {
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minAmount: coupon.minAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validTo: coupon.validTo,
      status: coupon.status,
      applicableProducts: coupon.applicableProducts || []
    })
  } catch (error) {
    console.error('Failed to load coupon:', error)
    ElMessage.error('加载优惠券信息失败')
    handleBack()
  } finally {
    loading.value = false
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 验证有效期
    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      ElMessage.error('有效期结束时间必须大于开始时间')
      return
    }
    
    // 验证百分比类型的值
    if (formData.type === 'percentage' && formData.value > 100) {
      ElMessage.error('百分比折扣不能超过100%')
      return
    }
    
    try {
      submitLoading.value = true
      
      const submitData = {
        ...formData,
        // 清理空值
        minAmount: formData.minAmount || undefined,
        maxDiscount: formData.maxDiscount || undefined,
        usageLimit: formData.usageLimit || undefined,
        applicableProducts: formData.applicableProducts?.length ? formData.applicableProducts : undefined
      }
      
      if (isEdit.value) {
        await updateCoupon(couponId.value, submitData)
        ElMessage.success('优惠券更新成功')
      } else {
        await createCoupon(submitData)
        ElMessage.success('优惠券创建成功')
      }
      
      router.push('/coupons/list')
    } catch (error: any) {
      console.error('Failed to save coupon:', error)
      const message = error?.response?.data?.message || (isEdit.value ? '更新失败' : '创建失败')
      ElMessage.error(message)
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    name: '',
    code: '',
    type: 'fixed',
    value: 0,
    minAmount: undefined,
    maxDiscount: undefined,
    usageLimit: undefined,
    validFrom: '',
    validTo: '',
    status: 'active',
    applicableProducts: []
  })
}

// 返回列表
const handleBack = () => {
  router.push('/coupons/list')
}

onMounted(async () => {
  await loadProducts()
  if (isEdit.value) {
    await loadCoupon()
  }
})
</script>

<style scoped>
.coupon-form-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}
</style>