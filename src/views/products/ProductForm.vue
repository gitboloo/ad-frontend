<template>
  <div class="product-form">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? '编辑产品' : '创建产品' }}</h1>
        <p class="page-description">{{ isEdit ? '修改产品信息' : '填写产品基本信息' }}</p>
      </div>
      
      <div class="form-container">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          size="large"
        >
          <el-card title="基本信息">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品名称" />
            </el-form-item>
            
            <el-form-item label="产品分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择产品分类" style="width: 100%">
                <el-option label="电子产品" value="electronics" />
                <el-option label="服装配饰" value="clothing" />
                <el-option label="家居用品" value="home" />
                <el-option label="运动健身" value="sports" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="产品价格" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                placeholder="请输入价格"
                style="width: 200px"
              />
            </el-form-item>
            
            <el-form-item label="库存数量" prop="stock">
              <el-input-number
                v-model="form.stock"
                :min="0"
                placeholder="请输入库存"
                style="width: 200px"
              />
            </el-form-item>
            
            <el-form-item label="产品状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="active">已发布</el-radio>
                <el-radio label="inactive">已下架</el-radio>
                <el-radio label="draft">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="产品描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请输入产品描述"
              />
            </el-form-item>
            
            <el-form-item label="产品图片">
              <FileUpload
                v-model="form.images"
                :multiple="true"
                :limit="5"
                accept="image/*"
              />
            </el-form-item>
          </el-card>
          
          <div class="form-actions">
            <el-button @click="router.back()">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              {{ isEdit ? '更新' : '创建' }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { createProduct, updateProduct, getProduct } from '@/api/products'
import FileUpload from '@/components/upload/FileUpload.vue'
import type { Product } from '@/types'

const router = useRouter()
const route = useRoute()
const formRef = ref<InstanceType<typeof ElForm>>()

const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

const form = reactive<Partial<Product>>({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: 'draft',
  description: '',
  images: []
})

const rules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择产品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入产品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择产品状态', trigger: 'change' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    
    if (isEdit.value) {
      const response = await updateProduct(Number(route.params.id), form)
      if (response.success) {
        ElMessage.success('更新成功')
        router.back()
      }
    } else {
      const response = await createProduct(form)
      if (response.success) {
        ElMessage.success('创建成功')
        router.back()
      }
    }
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

const loadProduct = async () => {
  if (!isEdit.value) return
  
  try {
    const response = await getProduct(Number(route.params.id))
    if (response.success) {
      Object.assign(form, response.data)
    }
  } catch (error) {
    console.error('Load product error:', error)
    ElMessage.error('加载产品信息失败')
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style lang="scss" scoped>
.product-form {
  .form-container {
    max-width: 800px;
  }
  
  .form-actions {
    margin-top: 24px;
    text-align: center;
    
    .el-button {
      min-width: 120px;
    }
  }
}
</style>