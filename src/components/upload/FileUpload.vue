<template>
  <div class="file-upload">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      list-type="picture-card"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
    
    <div v-if="tip" class="upload-tip">
      {{ tip }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

interface Props {
  modelValue?: string[]
  multiple?: boolean
  limit?: number
  accept?: string
  maxSize?: number // MB
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: false,
  limit: 1,
  accept: 'image/*',
  maxSize: 5,
  tip: '支持jpg、png格式，单个文件不超过5MB'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const userStore = useUserStore()
const fileList = ref<any[]>([])

// 上传配置
const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/upload`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

// 初始化文件列表
const initFileList = () => {
  fileList.value = props.modelValue.map((url, index) => ({
    uid: `init-${index}`,
    name: `image-${index}`,
    status: 'success',
    url
  }))
}

// 上传前检查
const beforeUpload = (file: File) => {
  // 检查文件大小
  const isLt5M = file.size / 1024 / 1024 < props.maxSize
  if (!isLt5M) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB!`)
    return false
  }
  
  // 检查文件类型
  if (props.accept && !props.accept.includes('*')) {
    const validTypes = props.accept.split(',').map(type => type.trim())
    const fileType = file.type
    const isValidType = validTypes.some(type => fileType.includes(type.replace('*', '')))
    
    if (!isValidType) {
      ElMessage.error('文件格式不正确!')
      return false
    }
  }
  
  return true
}

// 上传成功
const handleSuccess = (response: any, file: any) => {
  if (response.success) {
    file.url = response.data.url
    updateValue()
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
    const index = fileList.value.findIndex(item => item.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
    }
  }
}

// 上传失败
const handleError = (error: any) => {
  console.error('Upload error:', error)
  ElMessage.error('上传失败')
}

// 删除文件
const handleRemove = () => {
  updateValue()
}

// 超出限制
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

// 更新值
const updateValue = () => {
  const urls = fileList.value
    .filter(file => file.status === 'success' && file.url)
    .map(file => file.url)
  emit('update:modelValue', urls)
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(fileList.value.map(f => f.url))) {
      initFileList()
    }
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.file-upload {
  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}
</style>