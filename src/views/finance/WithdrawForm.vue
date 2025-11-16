<template>
  <el-dialog
    v-model="visible"
    title="处理提现"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="withdraw-form"
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
                <span>可提现余额: <strong class="balance">{{ formatCurrency(selectedUser.balance) }}</strong></span>
                <span>冻结余额: <strong class="frozen">{{ formatCurrency(selectedUser.frozenBalance || 0) }}</strong></span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <el-form-item label="提现金额" prop="amount">
        <div class="amount-input">
          <el-input-number
            v-model="form.amount"
            :min="1"
            :max="selectedUser?.balance || 100000"
            :precision="2"
            :step="1"
            style="width: 100%"
            placeholder="请输入提现金额"
          />
        </div>
        <div v-if="selectedUser" class="amount-tips">
          <span>最大可提现: {{ formatCurrency(selectedUser.balance) }}</span>
        </div>
      </el-form-item>

      <el-form-item label="提现方式" prop="accountType">
        <el-radio-group v-model="form.accountType">
          <el-radio value="alipay">
            <div class="account-option">
              <el-icon><CreditCard /></el-icon>
              <span>支付宝</span>
            </div>
          </el-radio>
          <el-radio value="wechat">
            <div class="account-option">
              <el-icon><CreditCard /></el-icon>
              <span>微信</span>
            </div>
          </el-radio>
          <el-radio value="bank">
            <div class="account-option">
              <el-icon><CreditCard /></el-icon>
              <span>银行卡</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="收款账户" prop="account">
        <el-input
          v-model="form.account"
          :placeholder="getAccountPlaceholder()"
        />
      </el-form-item>

      <el-form-item label="收款人姓名" prop="accountName">
        <el-input
          v-model="form.accountName"
          placeholder="请输入收款人真实姓名"
        />
      </el-form-item>

      <!-- 银行卡额外信息 -->
      <template v-if="form.accountType === 'bank'">
        <el-form-item label="开户银行" prop="bankName">
          <el-select
            v-model="form.bankName"
            filterable
            placeholder="请选择开户银行"
            style="width: 100%"
          >
            <el-option
              v-for="bank in bankOptions"
              :key="bank.value"
              :label="bank.label"
              :value="bank.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开户支行">
          <el-input
            v-model="form.branchName"
            placeholder="请输入开户支行名称（可选）"
          />
        </el-form-item>
      </template>

      <el-form-item label="手续费设置">
        <el-radio-group v-model="form.feeType">
          <el-radio value="none">免手续费</el-radio>
          <el-radio value="fixed">固定费用</el-radio>
          <el-radio value="rate">按比例收费</el-radio>
        </el-radio-group>

        <div v-if="form.feeType === 'fixed'" class="fee-input">
          <el-input-number
            v-model="form.fixedFee"
            :min="0"
            :precision="2"
            :step="1"
            style="width: 150px"
          />
          <span class="fee-unit">元</span>
        </div>

        <div v-if="form.feeType === 'rate'" class="fee-input">
          <el-input-number
            v-model="form.feeRate"
            :min="0"
            :max="10"
            :precision="2"
            :step="0.1"
            style="width: 150px"
          />
          <span class="fee-unit">%</span>
        </div>
      </el-form-item>

      <el-form-item label="备注说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入提现说明（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 提现确认信息 -->
      <el-card class="confirmation-card" shadow="never">
        <template #header>
          <span>提现确认</span>
        </template>
        <div class="confirmation-content">
          <div class="confirmation-item">
            <label>提现金额:</label>
            <span class="amount-value">{{ formatCurrency(form.amount || 0) }}</span>
          </div>
          <div class="confirmation-item">
            <label>手续费:</label>
            <span class="fee-value">{{ formatCurrency(calculateFee()) }}</span>
          </div>
          <div class="confirmation-item total">
            <label>实际到账:</label>
            <span class="total-value">{{ formatCurrency((form.amount || 0) - calculateFee()) }}</span>
          </div>
          <div class="confirmation-item">
            <label>收款方式:</label>
            <span>{{ getAccountTypeLabel() }}</span>
          </div>
          <div class="confirmation-item">
            <label>收款账户:</label>
            <span>{{ form.account || '-' }}</span>
          </div>
          <div class="confirmation-item">
            <label>收款人:</label>
            <span>{{ form.accountName || '-' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 风险提示 -->
      <el-alert
        title="提现须知"
        type="warning"
        :closable="false"
        style="margin-top: 20px"
      >
        <template #default>
          <ul class="withdraw-tips">
            <li>请确认收款账户信息准确无误，错误信息可能导致提现失败</li>
            <li>提现申请提交后将进入人工审核流程</li>
            <li>工作日24小时内完成审核，节假日顺延</li>
            <li>提现金额将从用户余额中扣除</li>
          </ul>
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确认提现
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { CreditCard } from '@element-plus/icons-vue'
import { processWithdraw, getUserBalance } from '@/api/finance'
import { formatCurrency } from '@/utils'

interface User {
  id: number
  username: string
  email: string
  avatar?: string
  balance: number
  frozenBalance?: number
}

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
const userSearchLoading = ref(false)
const userOptions = ref<User[]>([])
const selectedUser = ref<User | null>(null)

// 银行选项
const bankOptions = [
  { label: '工商银行', value: 'ICBC' },
  { label: '建设银行', value: 'CCB' },
  { label: '农业银行', value: 'ABC' },
  { label: '中国银行', value: 'BOC' },
  { label: '交通银行', value: 'BOCOM' },
  { label: '招商银行', value: 'CMB' },
  { label: '浦发银行', value: 'SPDB' },
  { label: '中信银行', value: 'CITIC' },
  { label: '光大银行', value: 'CEB' },
  { label: '平安银行', value: 'PAB' }
]

// 表单数据
const form = reactive({
  userId: null as number | null,
  amount: null as number | null,
  accountType: 'alipay' as 'alipay' | 'wechat' | 'bank',
  account: '',
  accountName: '',
  bankName: '',
  branchName: '',
  feeType: 'none' as 'none' | 'fixed' | 'rate',
  fixedFee: 0,
  feeRate: 0,
  description: ''
})

// 表单验证规则
const rules: FormRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '提现金额不能小于1元', trigger: 'blur' }
  ],
  accountType: [
    { required: true, message: '请选择提现方式', trigger: 'change' }
  ],
  account: [
    { required: true, message: '请输入收款账户', trigger: 'blur' }
  ],
  accountName: [
    { required: true, message: '请输入收款人姓名', trigger: 'blur' }
  ],
  bankName: [
    { 
      validator: (rule, value, callback) => {
        if (form.accountType === 'bank' && !value) {
          callback(new Error('请选择开户银行'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
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
        balance: 1000.50,
        frozenBalance: 0
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
      selectedUser.value.frozenBalance = data.frozenBalance
    } catch (error) {
      console.error('获取用户余额失败:', error)
    }
  }
}

// 获取账户输入框提示
const getAccountPlaceholder = () => {
  switch (form.accountType) {
    case 'alipay':
      return '请输入支付宝账号'
    case 'wechat':
      return '请输入微信号'
    case 'bank':
      return '请输入银行卡号'
    default:
      return ''
  }
}

// 获取账户类型标签
const getAccountTypeLabel = () => {
  switch (form.accountType) {
    case 'alipay':
      return '支付宝'
    case 'wechat':
      return '微信'
    case 'bank':
      return '银行卡'
    default:
      return ''
  }
}

// 计算手续费
const calculateFee = () => {
  if (form.feeType === 'none' || !form.amount) return 0
  
  if (form.feeType === 'fixed') {
    return form.fixedFee
  }
  
  if (form.feeType === 'rate') {
    return form.amount * form.feeRate / 100
  }
  
  return 0
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (!selectedUser.value) {
      ElMessage.error('请选择用户')
      return
    }
    
    if (form.amount! > selectedUser.value.balance) {
      ElMessage.error('提现金额不能超过可用余额')
      return
    }
    
    loading.value = true
    
    const requestData = {
      userId: form.userId!,
      amount: form.amount!,
      accountInfo: {
        type: form.accountType,
        account: form.account,
        name: form.accountName,
        ...(form.accountType === 'bank' && {
          bankName: form.bankName,
          branchName: form.branchName
        })
      },
      description: form.description || `提现${form.amount}元到${getAccountTypeLabel()}`
    }
    
    await processWithdraw(requestData)
    
    ElMessage.success('提现申请提交成功')
    emit('success')
    visible.value = false
    
  } catch (error: any) {
    ElMessage.error(error.message || '提现申请提交失败')
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
    accountType: 'alipay',
    account: '',
    accountName: '',
    bankName: '',
    branchName: '',
    feeType: 'none',
    fixedFee: 0,
    feeRate: 0,
    description: ''
  })
  
  selectedUser.value = null
  userOptions.value = []
}
</script>

<style lang="scss" scoped>
.withdraw-form {
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
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 14px;
          color: #6b7280;

          .balance {
            color: #16a34a;
            font-weight: 600;
          }

          .frozen {
            color: #f59e0b;
            font-weight: 600;
          }
        }
      }
    }
  }

  .amount-tips {
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;
  }

  .account-option {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .fee-input {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;

    .fee-unit {
      font-size: 14px;
      color: #6b7280;
    }
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
          min-width: 80px;
        }
        
        .amount-value {
          color: #374151;
          font-weight: 500;
        }
        
        .fee-value {
          color: #f59e0b;
          font-weight: 500;
        }
      }
    }
  }

  .withdraw-tips {
    margin: 0;
    padding-left: 16px;
    
    li {
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .withdraw-form {
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
        
        label {
          min-width: auto;
        }
      }
    }

    .fee-input {
      justify-content: center;
    }
  }
}
</style>