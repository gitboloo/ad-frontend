<template>
  <el-dialog
    v-model="visible"
    title="处理充值"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="recharge-form"
    >
      <el-form-item label="选择用户" prop="userId">
        <el-select
          v-model="form.userId"
          filterable
          remote
          reserve-keyword
          placeholder="输入用户名或邮箱搜索"
          :remote-method="searchUsers"
          :loading="userSearchLoading"
          style="width: 100%"
          @change="handleUserChange"
        >
          <el-option
            v-for="user in userOptions"
            :key="user.id"
            :label="`${user.username} (${user.email})`"
            :value="user.id"
          >
            <div class="user-option">
              <el-avatar :size="24" :src="user.avatar">
                {{ user.username.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="email">{{ user.email }}</div>
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 用户信息展示 -->
      <div v-if="selectedUser" class="user-details">
        <el-card shadow="never">
          <div class="user-card">
            <el-avatar :size="40" :src="selectedUser.avatar">
              {{ selectedUser.username.charAt(0) }}
            </el-avatar>
            <div class="user-info">
              <div class="username">{{ selectedUser.username }}</div>
              <div class="user-meta">
                <span>当前余额: <strong class="balance">{{ formatCurrency(selectedUser.balance) }}</strong></span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <el-form-item label="充值金额" prop="amount">
        <div class="amount-input">
          <el-input-number
            v-model="form.amount"
            :min="0.01"
            :max="100000"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入充值金额"
          />
        </div>
        <div class="amount-presets">
          <el-button
            v-for="preset in amountPresets"
            :key="preset"
            size="small"
            text
            @click="form.amount = preset"
          >
            {{ preset }}元
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="支付方式" prop="paymentMethod">
        <el-radio-group v-model="form.paymentMethod">
          <el-radio value="alipay">
            <div class="payment-option">
              <el-icon><CreditCard /></el-icon>
              <span>支付宝</span>
            </div>
          </el-radio>
          <el-radio value="wechat">
            <div class="payment-option">
              <el-icon><CreditCard /></el-icon>
              <span>微信支付</span>
            </div>
          </el-radio>
          <el-radio value="bank">
            <div class="payment-option">
              <el-icon><CreditCard /></el-icon>
              <span>银行卡</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="充值类型">
        <el-radio-group v-model="form.rechargeType">
          <el-radio value="normal">普通充值</el-radio>
          <el-radio value="bonus">赠送充值</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.rechargeType === 'bonus'" label="赠送比例">
        <el-slider
          v-model="form.bonusRate"
          :min="0"
          :max="100"
          :step="5"
          show-input
        />
        <div class="bonus-info">
          实际到账: <strong>{{ calculateBonusAmount() }}</strong>
        </div>
      </el-form-item>

      <el-form-item label="备注说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入充值说明（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 充值确认信息 -->
      <el-card class="confirmation-card" shadow="never">
        <template #header>
          <span>充值确认</span>
        </template>
        <div class="confirmation-content">
          <div class="confirmation-item">
            <label>充值金额:</label>
            <span class="amount-value">{{ formatCurrency(form.amount || 0) }}</span>
          </div>
          <div v-if="form.rechargeType === 'bonus'" class="confirmation-item">
            <label>赠送金额:</label>
            <span class="bonus-value">{{ formatCurrency(getBonusAmount()) }}</span>
          </div>
          <div class="confirmation-item total">
            <label>实际到账:</label>
            <span class="total-value">{{ calculateBonusAmount() }}</span>
          </div>
        </div>
      </el-card>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确认充值
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, withDefaults } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { CreditCard } from '@element-plus/icons-vue'
import { processRecharge, getUserBalance } from '@/api/finance'
import { formatCurrency } from '@/utils'

interface User {
  id: number
  username: string
  email: string
  avatar?: string
  balance: number
}

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})
const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()
const loading = ref(false)
const userSearchLoading = ref(false)
const userOptions = ref<User[]>([])
const selectedUser = ref<User | null>(null)
const internalVisible = ref(false)

// 表单数据
const form = reactive({
  userId: null as number | null,
  amount: null as number | null,
  paymentMethod: 'alipay' as 'alipay' | 'wechat' | 'bank',
  rechargeType: 'normal' as 'normal' | 'bonus',
  bonusRate: 0,
  description: ''
})

// 金额预设
const amountPresets = [100, 200, 500, 1000, 2000, 5000]

// 表单验证规则
const rules: FormRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 0.01, max: 100000, message: '金额应在0.01-100000之间', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue ?? internalVisible.value,
  set: (value: boolean) => {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', value)
    } else {
      internalVisible.value = value
    }
  }
})

// 搜索用户
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  userSearchLoading.value = true
  try {
    // 这里应该调用搜索用户的API
    // const { data } = await searchUsers({ search: query })
    // 模拟数据
    userOptions.value = [
      {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        balance: 1000.50
      }
    ]
  } catch (error) {
    console.error('搜索用户失败:', error)
  } finally {
    userSearchLoading.value = false
  }
}

// 用户选择变化
const handleUserChange = async (userId: number) => {
  const user = userOptions.value.find(u => u.id === userId)
  if (user) {
    selectedUser.value = user
    try {
      // 获取最新余额
      const { data } = await getUserBalance(userId)
      selectedUser.value.balance = data.balance
    } catch (error) {
      console.error('获取用户余额失败:', error)
    }
  }
}

// 计算赠送金额
const getBonusAmount = () => {
  if (form.rechargeType !== 'bonus' || !form.amount) return 0
  return (form.amount * form.bonusRate / 100)
}

// 计算实际到账金额
const calculateBonusAmount = () => {
  const baseAmount = form.amount || 0
  const bonusAmount = getBonusAmount()
  return formatCurrency(baseAmount + bonusAmount)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const requestData = {
      userId: form.userId!,
      amount: form.amount!,
      paymentMethod: form.paymentMethod,
      description: form.description || `充值${form.amount}元`
    }
    
    // 如果是赠送充值，添加赠送信息
    if (form.rechargeType === 'bonus' && form.bonusRate > 0) {
      requestData.description += ` (含${form.bonusRate}%赠送)`
    }
    
    await processRecharge(requestData)
    
    ElMessage.success('充值成功')
    emit('success')
    visible.value = false
    
  } catch (error: any) {
    ElMessage.error(error.message || '充值失败')
  } finally {
    loading.value = false
  }
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
    userId: null,
    amount: null,
    paymentMethod: 'alipay',
    rechargeType: 'normal',
    bonusRate: 0,
    description: ''
  })
  
  selectedUser.value = null
  userOptions.value = []
}

// 监听充值类型变化
watch(() => form.rechargeType, (newType) => {
  if (newType === 'normal') {
    form.bonusRate = 0
  }
})
</script>

<style lang="scss" scoped>
.recharge-form {
  .user-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;

    .user-info {
      .username {
        font-weight: 500;
        color: #374151;
      }

      .email {
        font-size: 12px;
        color: #6b7280;
      }
    }
  }

  .user-details {
    margin-bottom: 20px;

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-info {
        .username {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .user-meta {
          font-size: 14px;
          color: #6b7280;

          .balance {
            color: #16a34a;
            font-weight: 600;
          }
        }
      }
    }
  }

  .amount-input {
    width: 100%;
  }

  .amount-presets {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .payment-option {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .bonus-info {
    margin-top: 8px;
    color: #16a34a;
    font-weight: 500;
  }

  .confirmation-card {
    margin-top: 20px;
    
    .confirmation-content {
      .confirmation-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        &.total {
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 12px;
          font-weight: 500;
          
          .total-value {
            font-size: 18px;
            color: #16a34a;
            font-weight: 600;
          }
        }
        
        label {
          color: #6b7280;
        }
        
        .amount-value {
          color: #374151;
          font-weight: 500;
        }
        
        .bonus-value {
          color: #f59e0b;
          font-weight: 500;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .recharge-form {
    .amount-presets {
      justify-content: center;
    }

    .user-card {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }

    .confirmation-content {
      .confirmation-item {
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
        text-align: center;
      }
    }
  }
}
</style>