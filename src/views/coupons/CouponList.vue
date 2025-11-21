<template>
  <div class="coupon-list">
    <div class="page-header">
      <h2>优惠券列表</h2>
    </div>
    
    <el-card>
      <!-- 搜索栏 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="优惠券名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="券类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择券类型"
            clearable
            style="width: 150px"
          >
            <el-option label="增值券" value="percentage" />
            <el-option label="抵扣券" value="fixed" />
            <el-option label="自定义" value="custom" />
            <el-option label="固定金额券" value="fixed_amount" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            placeholder="开始日期"
            style="width: 150px"
          />
          <span style="margin: 0 5px">→</span>
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            placeholder="结束日期"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleCollapse">收起</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">+ 新建</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="优惠券名称" min-width="180" />
        <el-table-column prop="description" label="优惠券描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="券类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getCouponTypeTag(row.type)">
              {{ getCouponTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="折扣" width="100">
          <template #default="{ row }">
            {{ row.type === 'percentage' || row.type === 'custom' ? `${row.value}%` : `¥${row.value}` }}
          </template>
        </el-table-column>
        <el-table-column label="新人券" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isNewUser" type="danger" size="small">新人券</el-tag>
            <span v-else style="color: #909399;">否</span>
          </template>
        </el-table-column>
        <el-table-column label="使用金额限制" width="140">
          <template #default="{ row }">
            {{ row.minAmount && row.maxAmount ? `¥${row.minAmount} - ¥${row.maxAmount}` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="150">
          <template #default="{ row }">
            {{ row.validityDays ? `${row.validityDays}天` : formatValidPeriod(row) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="danger" size="small" @click="handleNewUser(row)">新人卷</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑优惠券对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '修改优惠券' : '新增优惠券'" 
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入优惠券名称"
            maxlength="100"
          />
        </el-form-item>
        
        <el-form-item label="优惠券描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入优惠券描述"
            maxlength="500"
          />
        </el-form-item>
        
        <!-- 新人券选项 -->
        <el-form-item label="新人券">
          <el-radio-group v-model="formData.isNewUser">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
          <div class="form-tip">设置为新人券后，仅新注册用户可使用</div>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="券类型" prop="type">
              <el-select 
                v-model="formData.type" 
                placeholder="请选择券类型" 
                style="width: 100%"
                :teleported="false"
                popper-class="coupon-type-select-dropdown"
              >
                <el-option label="增值券" value="percentage" />
                <el-option label="抵扣券" value="fixed" />
                <el-option label="自定义" value="custom" />
                <el-option label="固定金额券" value="fixed_amount" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item 
              v-if="formData.type === 'percentage' || formData.type === 'custom'"
              label="折扣" 
              prop="value"
            >
              <el-input-number
                v-model="formData.value"
                :min="0"
                :max="100"
                :precision="0"
                style="width: 100%"
                placeholder="请输入折扣百分比"
              />
              <div class="form-tip">折扣百分比，如5表示95折，10表示9折</div>
            </el-form-item>
            <el-form-item 
              v-else
              label="折扣金额" 
              prop="value"
            >
              <el-input-number
                v-model="formData.value"
                :min="0"
                :max="999999"
                :precision="2"
                style="width: 100%"
                placeholder="请输入折扣金额"
              />
              <div class="form-tip">优惠券可抵扣的金额</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低金额">
              <el-input-number
                v-model="formData.minAmount"
                :min="0"
                :precision="2"
                placeholder="请输入使用最低金额"
                style="width: 100%"
              />
              <div class="form-tip">优惠券使用的最低金额要求，0表示无限制</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高金额">
              <el-input-number
                v-model="formData.maxAmount"
                :min="0"
                :precision="2"
                placeholder="请输入使用最高金额"
                style="width: 100%"
              />
              <div class="form-tip">优惠券使用的最高金额限制，0表示无限制</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="有效期类型" prop="validityType">
          <el-select 
            v-model="formData.validityType" 
            placeholder="请选择有效期类型" 
            style="width: 100%"
            :teleported="false"
            popper-class="coupon-validity-type-select-dropdown"
          >
            <el-option label="固定时间" value="fixed" />
            <el-option label="领取后生效" value="after_receive" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20" v-if="formData.validityType === 'fixed'">
          <el-col :span="12">
            <el-form-item label="有效期开始" prop="validFrom">
              <el-date-picker
                v-model="formData.validFrom"
                type="datetime"
                placeholder="选择有效期开始"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :teleported="false"
                popper-class="coupon-date-picker-dropdown"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期范围" prop="validTo">
              <el-date-picker
                v-model="formData.validTo"
                type="datetime"
                placeholder="选择有效期范围"
                style="width: 100%"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm:ss"
                :teleported="false"
                popper-class="coupon-date-picker-dropdown"
              />
              <div class="form-tip warning">
                只有在此时间段内，优惠券才能被使用/使用，否则无法使用
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="formData.validityType === 'after_receive'" label="有效天数" prop="validityDays">
          <el-input-number
            v-model="formData.validityDays"
            :min="1"
            placeholder="请输入有效天数"
            style="width: 100%"
          />
          <div class="form-tip">领取后多少天内有效</div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select 
            v-model="formData.status" 
            placeholder="请选择状态" 
            style="width: 100%"
            :teleported="false"
            popper-class="coupon-status-select-dropdown"
          >
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  getCoupon,
  deleteCoupon as apiDeleteCoupon,
  updateCouponStatus
} from '@/api/coupons'
import type { Coupon } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref<Coupon[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: '',
  startDate: '',
  endDate: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const formData = reactive({
  id: 0,
  name: '',
  description: '',
  isNewUser: false,
  type: 'percentage' as string,
  value: 0,
  minAmount: 0,
  maxAmount: 0,
  validityType: 'fixed' as string,
  validFrom: '',
  validTo: '',
  validityDays: 0,
  status: 'active' as string
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入优惠券描述', trigger: 'blur' }],
  type: [{ required: true, message: '请选择券类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入折扣值', trigger: 'blur' }],
  validityType: [{ required: true, message: '请选择有效期类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取券类型名称
const getCouponTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    percentage: '增值券',
    fixed: '抵扣券',
    custom: '自定义',
    fixed_amount: '固定金额券'
  }
  return typeMap[type] || type
}

// 获取券类型标签颜色
const getCouponTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    percentage: 'success',
    fixed: 'primary',
    custom: 'info',
    fixed_amount: 'danger'
  }
  return tagMap[type] || ''
}

// 格式化有效期
const formatValidPeriod = (row: any) => {
  if (!row.validFrom || !row.validTo) return '-'
  const from = new Date(row.validFrom)
  const to = new Date(row.validTo)
  return `${formatDate(from)} ~ ${formatDate(to)}`
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${String(d.getSeconds()).padStart(2, '0')}`
}

// 加载优惠券列表
const loadCoupons = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await getCoupons(params)
    tableData.value = response.data || []
    pagination.total = response.data?.length || 0
  } catch (error) {
    console.error('Failed to load coupons:', error)
    ElMessage.error('加载优惠券列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  loadCoupons()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  })
  handleSearch()
}

// 收起
const handleCollapse = () => {
  // 实现收起功能
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.page = 1
  loadCoupons()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadCoupons()
}

// 新建
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: Coupon) => {
  isEdit.value = true
  try {
    const response = await getCoupon(row.id)
    const coupon = response.data
    Object.assign(formData, {
      id: coupon.id,
      name: coupon.name,
      description: coupon.description || '',
      isNewUser: coupon.isNewUser || false,
      type: coupon.type,
      value: coupon.value,
      minAmount: coupon.minAmount || 0,
      maxAmount: coupon.maxAmount || 0,
      validityType: coupon.validityDays ? 'after_receive' : 'fixed',
      validFrom: coupon.validFrom || '',
      validTo: coupon.validTo || '',
      validityDays: coupon.validityDays || 0,
      status: coupon.status
    })
    dialogVisible.value = true
  } catch (error) {
    console.error('Failed to load coupon:', error)
    ElMessage.error('加载优惠券信息失败')
  }
}

// 新人卷
const handleNewUser = async (row: Coupon) => {
  try {
    await ElMessageBox.confirm(
      `确定要将"${row.name}"设置为新人券吗？`,
      '设置新人券',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用更新接口，设置为新人券
    await updateCoupon(row.id, { ...row, isNewUser: true })
    ElMessage.success('设置成功')
    loadCoupons()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to set new user coupon:', error)
      ElMessage.error('设置失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitLoading.value = true
      const submitData = { ...formData }
      
      if (isEdit.value) {
        await updateCoupon(formData.id, submitData)
        ElMessage.success('更新成功')
      } else {
        await createCoupon(submitData)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      loadCoupons()
    } catch (error: any) {
      console.error('Failed to save coupon:', error)
      ElMessage.error(error?.response?.data?.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: 0,
    name: '',
    description: '',
    isNewUser: false,
    type: 'percentage',
    value: 0,
    minAmount: 0,
    maxAmount: 0,
    validityType: 'fixed',
    validFrom: '',
    validTo: '',
    validityDays: 0,
    status: 'active'
  })
  formRef.value?.resetFields()
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.coupon-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.search-form {
  margin-bottom: 16px;
}

.toolbar {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.form-tip.warning {
  color: var(--el-color-warning);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>