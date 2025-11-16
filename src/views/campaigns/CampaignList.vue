<template>
  <div class="campaign-list">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">计划管理</h1>
        <p class="page-description">管理广告投放计划</p>
        <div class="page-actions">
          <el-button type="primary" @click="router.push('/campaigns/create')">
            <el-icon><Plus /></el-icon>
            创建计划
          </el-button>
        </div>
      </div>
      
      <el-card>
        <el-table v-loading="loading" :data="tableData">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="计划名称" min-width="150" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.type?.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="budget" label="预算" width="120">
            <template #default="{ row }">{{ formatCurrency(row.budget) }}</template>
          </el-table-column>
          <el-table-column prop="spent" label="已花费" width="120">
            <template #default="{ row }">{{ formatCurrency(row.spent) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusConfig(row.status, 'campaign').type">
                {{ getStatusConfig(row.status, 'campaign').text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="viewCampaign(row)">查看</el-button>
              <el-button size="small" link type="primary" @click="editCampaign(row)">编辑</el-button>
              <el-button size="small" link type="danger" @click="deleteCampaign(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { formatCurrency, getStatusConfig } from '@/utils'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])

const viewCampaign = (row: any) => {
  // 查看详情逻辑
}

const editCampaign = (row: any) => {
  router.push(`/campaigns/edit/${row.id}`)
}

const deleteCampaign = (row: any) => {
  // 删除逻辑
}

onMounted(() => {
  // 加载数据
})
</script>