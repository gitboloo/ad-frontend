<template>
  <div class="agent-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>代理商管理</span>
          <el-button
            type="primary"
            @click="handleCreate"
            v-if="checkPermission(['admin'])"
          >
            新建代理商
          </el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-container">
        <el-form :model="queryParams" inline>
          <el-form-item label="搜索">
            <el-input
              v-model="queryParams.keyword"
              placeholder="用户名/姓名/手机号/编码"
              style="width: 220px"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="代理等级">
            <el-select
              v-model="queryParams.level"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="一级代理" :value="1" />
              <el-option label="二级代理" :value="2" />
              <el-option label="三级代理" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="全部"
              clearable
              style="width="120px"
            >
              <el-option label="待审核" :value="0" />
              <el-option label="激活" :value="1" />
              <el-option label="冻结" :value="2" />
              <el-option label="禁用" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="stats-info">
          <el-tag>总计: {{ pagination.total }}</el-tag>
          <el-tag type="warning" class="ml-2">待审核: {{ stats.pending }}</el-tag>
          <el-tag type="success" class="ml-2">激活: {{ stats.active }}</el-tag>
          <el-tag type="danger" class="ml-2">冻结: {{ stats.frozen }}</el-tag>
        </div>
        <div class="toolbar-right">
          <el-button circle @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="real_name" label="真实姓名" min-width="100" />
        <el-table-column prop="agent_code" label="代理编码" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ row.agent_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="agent_level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.agent_level)" size="small">
              {{ getLevelText(row.agent_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="commission_rate" label="佣金比例" width="100">
          <template #default="{ row }">
            {{ (row.commission_rate * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="120">
          <template #default="{ row }">
            <span class="money-text">¥{{ row.balance.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_customers" label="客户数" width="90" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              详情
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleEdit(row)"
              v-if="checkPermission(['admin'])"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status === 0"
              link
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button
              v-if="row.status === 1"
              link
              type="danger"
              size="small"
              @click="handleFreeze(row)"
            >
              冻结
            </el-button>
            <el-button
              v-if="row.status === 2"
              link
              type="success"
              size="small"
              @click="handleUnfreeze(row)"
            >
              解冻
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="代理商审核"
      width="500px"
    >
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="代理商">
          <div>{{ currentAgent?.real_name }} ({{ currentAgent?.username }})</div>
        </el-form-item>
        <el-form-item label="代理编码">
          <el-tag>{{ currentAgent?.agent_code }}</el-tag>
        </el-form-item>
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="approveForm.approved">
            <el-radio :label="true">通过</el-radio>
            <el-radio :label="false">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="approveForm.approved ? '备注' : '拒绝原因'"
          :required="!approveForm.approved"
        >
          <el-input
            v-model="approveForm.remark"
            type="textarea"
            :rows="3"
            :placeholder="approveForm.approved ? '可选' : '请输入拒绝原因'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formMode === 'create' ? '新建代理商' : '编辑代理商'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="formMode === 'edit'" />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="formData.account" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="formMode === 'create'">
          <el-input v-model="formData.password" type="password" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="formData.real_name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="代理等级" prop="agent_level">
          <el-select v-model="formData.agent_level" style="width: 100%">
            <el-option label="一级代理" :value="1" />
            <el-option label="二级代理" :value="2" />
            <el-option label="三级代理" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级代理" prop="parent_id" v-if="formData.agent_level > 1">
          <el-select
            v-model="formData.parent_id"
            filterable
            placeholder="请选择上级代理"
            style="width: 100%"
          >
            <el-option
              v-for="agent in parentAgents"
              :key="agent.id"
              :label="`${agent.real_name} (${agent.agent_code})`"
              :value="agent.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="佣金比例" prop="commission_rate">
          <el-input-number
            v-model="formData.commission_rate"
            :min="0"
            :max="100"
            :precision="1"
            :step="0.5"
          />
          <span class="ml-2">%</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { Agent } from '@/types'
import {
  getAgentList,
  createAgent,
  updateAgent,
  approveAgent,
  rejectAgent,
  freezeAgent,
  unfreezeAgent
} from '@/api/agent'

// 权限检查函数
const checkPermission = (roles: string[]) => {
  // TODO: 实现权限检查逻辑
  return true
}

// 查询参数
const queryParams = reactive({
  keyword: '',
  level: undefined as number | undefined,
  status: undefined as number | undefined,
  page: 1,
  page_size: 20
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  pending: 0,
  active: 0,
  frozen: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<Agent[]>([])
const parentAgents = ref<Agent[]>([])

// 审核对话框
const approveDialogVisible = ref(false)
const currentAgent = ref<Agent | null>(null)
const approveForm = reactive({
  approved: true,
  remark: ''
})

// 表单对话框
const formDialogVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formRef = ref()
const formData = reactive({
  username: '',
  account: '',
  password: '',
  real_name: '',
  phone: '',
  email: '',
  agent_level: 1,
  parent_id: undefined as number | undefined,
  commission_rate: 35,
  remark: ''
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  real_name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  agent_level: [{ required: true, message: '请选择代理等级', trigger: 'change' }]
}

// 获取代理商列表
const fetchAgentList = async () => {
  loading.value = true
  try {
    const response = await getAgentList({
      ...queryParams,
      page: pagination.page,
      page_size: pagination.pageSize
    })

    if (response.data) {
      tableData.value = response.data.data || []
      pagination.total = response.data.pagination?.total || 0

      // 计算统计数据
      stats.pending = tableData.value.filter(a => a.status === 0).length
      stats.active = tableData.value.filter(a => a.status === 1).length
      stats.frozen = tableData.value.filter(a => a.status === 2).length
    }
  } catch (error) {
    ElMessage.error('获取代理商列表失败')
  } finally {
    loading.value = false
  }
}

// 获取上级代理列表
const fetchParentAgents = async () => {
  try {
    const response = await getAgentList({ status: 1, page: 1, page_size: 1000 })
    if (response.data) {
      parentAgents.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取上级代理列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchAgentList()
}

// 重置
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.level = undefined
  queryParams.status = undefined
  pagination.page = 1
  fetchAgentList()
}

// 刷新
const handleRefresh = () => {
  fetchAgentList()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchAgentList()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchAgentList()
}

// 查看详情
const handleView = (row: Agent) => {
  // TODO: 跳转到详情页或打开详情对话框
  ElMessage.info('查看详情功能待实现')
}

// 新建
const handleCreate = () => {
  formMode.value = 'create'
  Object.assign(formData, {
    username: '',
    account: '',
    password: '',
    real_name: '',
    phone: '',
    email: '',
    agent_level: 1,
    parent_id: undefined,
    commission_rate: 35,
    remark: ''
  })
  formDialogVisible.value = true
  fetchParentAgents()
}

// 编辑
const handleEdit = (row: Agent) => {
  formMode.value = 'edit'
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    account: row.account,
    real_name: row.real_name,
    phone: row.phone,
    email: row.email,
    agent_level: row.agent_level,
    parent_id: row.parent_id,
    commission_rate: row.commission_rate * 100,
    remark: row.remark
  })
  formDialogVisible.value = true
  fetchParentAgents()
}

// 提交表单
const submitForm = async () => {
  await formRef.value?.validate()

  try {
    const data = {
      ...formData,
      commission_rate: formData.commission_rate / 100
    }

    if (formMode.value === 'create') {
      await createAgent(data)
      ElMessage.success('创建成功')
    } else {
      await updateAgent((formData as any).id, data)
      ElMessage.success('更新成功')
    }

    formDialogVisible.value = false
    fetchAgentList()
  } catch (error) {
    ElMessage.error(formMode.value === 'create' ? '创建失败' : '更新失败')
  }
}

// 审核
const handleApprove = (row: Agent) => {
  currentAgent.value = row
  approveForm.approved = true
  approveForm.remark = ''
  approveDialogVisible.value = true
}

// 提交审核
const submitApprove = async () => {
  if (!currentAgent.value) return

  if (!approveForm.approved && !approveForm.remark) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    if (approveForm.approved) {
      await approveAgent(currentAgent.value.id, approveForm.remark)
      ElMessage.success('审核通过')
    } else {
      await rejectAgent(currentAgent.value.id, approveForm.remark)
      ElMessage.success('已拒绝')
    }

    approveDialogVisible.value = false
    fetchAgentList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 冻结
const handleFreeze = (row: Agent) => {
  ElMessageBox.prompt('请输入冻结原因', '冻结代理商', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请输入冻结原因'
  }).then(async ({ value }) => {
    try {
      await freezeAgent(row.id, value)
      ElMessage.success('冻结成功')
      fetchAgentList()
    } catch (error) {
      ElMessage.error('冻结失败')
    }
  }).catch(() => {})
}

// 解冻
const handleUnfreeze = (row: Agent) => {
  ElMessageBox.confirm('确定要解冻该代理商吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await unfreezeAgent(row.id)
      ElMessage.success('解冻成功')
      fetchAgentList()
    } catch (error) {
      ElMessage.error('解冻失败')
    }
  }).catch(() => {})
}

// 工具函数
const getLevelType = (level: number) => {
  const types = ['', 'success', 'warning', 'info']
  return types[level] || ''
}

const getLevelText = (level: number) => {
  const texts = ['', '一级代理', '二级代理', '三级代理']
  return texts[level] || ''
}

const getStatusType = (status: number) => {
  const types = ['warning', 'success', 'danger', 'info']
  return types[status] || ''
}

const getStatusText = (status: number) => {
  const texts = ['待审核', '激活', '冻结', '禁用']
  return texts[status] || ''
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 初始化
onMounted(() => {
  fetchAgentList()
})
</script>

<style scoped lang="scss">
.agent-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-info {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.money-text {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.ml-2 {
  margin-left: 8px;
}
</style>
