<template>
  <div class="role-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索角色名称"
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
        添加角色
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
      <el-table-column label="角色名称">
        <template #default="{ row }">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column label="角色描述">
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
      <el-table-column label="权限数量" width="110" align="center">
        <template #default="{ row }">
          <el-tag type="info">
            {{ row.permissions ? row.permissions.length : 0 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button type="warning" size="small" @click="handlePermission(row)">
            权限
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

    <!-- 角色编辑对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogStatus === 'create' ? '添加角色' : '编辑角色'">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="角色描述">
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

    <!-- 权限分配对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="分配权限" width="50%">
      <div class="permission-tree-container">
        <el-tree
          ref="permissionTree"
          :data="permissionTreeData"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          :default-expand-all="true"
          class="permission-tree"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="saveRolePermissions">
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
const permissionDialogVisible = ref(false)
const dialogStatus = ref('')
const dataForm = ref<FormInstance>()
const permissionTree = ref()
const currentRole = ref<any>({})
const permissionTreeData = ref([])
const checkedPermissions = ref([])

const listQuery = reactive({
  page: 1,
  limit: 20,
  keyword: ''
})

const temp = reactive({
  id: undefined,
  name: '',
  description: '',
  status: 1
})

const treeProps = {
  children: 'children',
  label: 'name'
}

const rules: FormRules = {
  name: [{ required: true, message: '角色名称为必填项', trigger: 'blur' }]
}

// 方法
const resetTemp = () => {
  temp.id = undefined
  temp.name = ''
  temp.description = ''
  temp.status = 1
}

const getList = async () => {
  listLoading.value = true
  try {
    // 这里应该调用获取角色列表的API
    // const response = await getRoles(listQuery)
    // list.value = response.data.list
    // total.value = response.data.total
    
    // 临时数据
    list.value = []
    total.value = 0
    ElMessage.info('角色管理功能开发中...')
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
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
        // 这里应该调用创建角色的API
        // await createRole(temp)
        ElMessage.success('角色创建成功')
        dialogFormVisible.value = false
        getList()
      } catch (error) {
        console.error('创建角色失败:', error)
        ElMessage.error('创建角色失败')
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
        // 这里应该调用更新角色的API
        // await updateRole(temp.id, temp)
        ElMessage.success('角色更新成功')
        dialogFormVisible.value = false
        getList()
      } catch (error) {
        console.error('更新角色失败:', error)
        ElMessage.error('更新角色失败')
      }
    }
  })
}

const handlePermission = async (row: any) => {
  currentRole.value = row
  try {
    // 这里应该调用获取权限树和角色权限的API
    // const [treeResponse, rolePermissionsResponse] = await Promise.all([
    //   getPermissionTree(),
    //   getRolePermissions(row.id)
    // ])
    // permissionTreeData.value = treeResponse.data
    // checkedPermissions.value = rolePermissionsResponse.data.map(p => p.id)
    
    // 临时数据
    permissionTreeData.value = []
    checkedPermissions.value = []
    
    permissionDialogVisible.value = true
    ElMessage.info('权限分配功能开发中...')
  } catch (error) {
    console.error('获取权限数据失败:', error)
    ElMessage.error('获取权限数据失败')
  }
}

const saveRolePermissions = async () => {
  try {
    const checkedKeys = permissionTree.value.getCheckedKeys()
    const halfCheckedKeys = permissionTree.value.getHalfCheckedKeys()
    const permissionIds = [...checkedKeys, ...halfCheckedKeys]
    
    // 这里应该调用保存角色权限的API
    // await saveRolePermissions(currentRole.value.id, permissionIds)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
    getList()
  } catch (error) {
    console.error('保存权限分配失败:', error)
    ElMessage.error('保存权限分配失败')
  }
}

const handleModifyStatus = async (row: any, status: number) => {
  try {
    // 这里应该调用修改角色状态的API
    // await updateRoleStatus(row.id, status)
    ElMessage.success('角色状态修改成功')
    row.status = status
  } catch (error) {
    console.error('修改角色状态失败:', error)
    ElMessage.error('修改角色状态失败')
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该角色，是否继续？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里应该调用删除角色的API
    // await deleteRole(row.id)
    ElMessage.success('角色删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

// 生命周期
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.role-container {
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

.permission-tree-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  padding: 10px;
  border-radius: 4px;
}

.permission-tree {
  :deep(.el-tree-node__content) {
    height: 32px;
  }
}
</style>