<template>
  <div class="permission-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索权限名称或标识"
        style="width: 200px"
        class="filter-item"
        @keyup.enter="handleFilter"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="Search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="Plus"
        @click="handleCreate"
      >
        添加权限
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template #default="{ row }">
          {{ row.id }}
        </template>
      </el-table-column>
      <el-table-column label="权限名称">
        <template #default="{ row }">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column label="权限标识">
        <template #default="{ row }">
          {{ row.code }}
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          {{ row.description }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status"
            size="small"
            type="danger"
            @click="handleModifyStatus(row, 0)"
          >
            禁用
          </el-button>
          <el-button
            v-else
            size="small"
            type="success"
            @click="handleModifyStatus(row, 1)"
          >
            启用
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="listQuery.page"
      v-model:limit="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog v-model="dialogFormVisible" :title="dialogStatus === 'create' ? '添加权限' : '编辑权限'">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="temp.code" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="temp.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="请选择">
            <el-option :key="1" label="启用" :value="1" />
            <el-option :key="0" label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import Pagination from '@/components/Pagination/index.vue'
import { formatDateTime } from '@/utils/date'

// 响应式数据
const list = ref([])
const total = ref(0)
const listLoading = ref(false)
const dialogFormVisible = ref(false)
const dialogStatus = ref('')
const dataForm = ref<FormInstance>()

const listQuery = reactive({
  page: 1,
  limit: 20,
  keyword: ''
})

const temp = reactive({
  id: undefined,
  name: '',
  code: '',
  description: '',
  status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '权限名称为必填项', trigger: 'blur' }],
  code: [{ required: true, message: '权限标识为必填项', trigger: 'blur' }]
}

// 方法
const resetTemp = () => {
  temp.id = undefined
  temp.name = ''
  temp.code = ''
  temp.description = ''
  temp.status = 1
}

const getList = async () => {
  listLoading.value = true
  try {
    // 这里应该调用获取权限列表的API
    // const response = await getPermissions(listQuery)
    // list.value = response.data.list
    // total.value = response.data.total
    
    // 临时数据
    list.value = []
    total.value = 0
    ElMessage.info('权限管理功能开发中...')
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  }
  listLoading.value = false
}

const handleFilter = () => {
  listQuery.page = 1
  getList()
}

const handleCreate = () => {
  resetTemp()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
}

const createData = async () => {
  if (!dataForm.value) return
  
  await dataForm.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里应该调用创建权限的API
        // await createPermission(temp)
        ElMessage.success('权限创建成功')
        dialogFormVisible.value = false
        getList()
      } catch (error) {
        console.error('创建权限失败:', error)
        ElMessage.error('创建权限失败')
      }
    }
  })
}

const handleUpdate = (row: any) => {
  Object.assign(temp, row)
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
}

const updateData = async () => {
  if (!dataForm.value) return
  
  await dataForm.value.validate(async (valid) => {
    if (valid) {
      try {
        // 这里应该调用更新权限的API
        // await updatePermission(temp.id, temp)
        ElMessage.success('权限更新成功')
        dialogFormVisible.value = false
        getList()
      } catch (error) {
        console.error('更新权限失败:', error)
        ElMessage.error('更新权限失败')
      }
    }
  })
}

const handleModifyStatus = async (row: any, status: number) => {
  try {
    // 这里应该调用修改权限状态的API
    // await updatePermissionStatus(row.id, status)
    ElMessage.success('权限状态修改成功')
    row.status = status
  } catch (error) {
    console.error('修改权限状态失败:', error)
    ElMessage.error('修改权限状态失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该权限，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里应该调用删除权限的API
    // await deletePermission(row.id)
    ElMessage.success('权限删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除权限失败:', error)
      ElMessage.error('删除权限失败')
    }
  }
}

// 生命周期
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.permission-container {
  padding: 20px;
}

.filter-container {
  padding-bottom: 10px;
  
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}
</style>