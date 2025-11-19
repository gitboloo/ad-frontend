<template>
  <div class="pagination-container" :class="{ hidden: hidden }">
    <el-pagination
      :background="background"
      :current-page="page"
      :page-size="limit"
      :layout="layout"
      :page-sizes="pageSizes"
      :total="total"
      v-bind="$attrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  total: number
  page?: number
  limit?: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  autoScroll?: boolean
  hidden?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  page: 1,
  limit: 20,
  pageSizes: () => [10, 20, 30, 50],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  autoScroll: true,
  hidden: false
})

interface Emits {
  (e: 'pagination', data: { page: number; limit: number }): void
  (e: 'update:page', page: number): void
  (e: 'update:limit', limit: number): void
}

const emit = defineEmits<Emits>()

const handleSizeChange = (limit: number) => {
  emit('update:limit', limit)
  emit('pagination', { page: props.page, limit })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

const handleCurrentChange = (page: number) => {
  emit('update:page', page)
  emit('pagination', { page, limit: props.limit })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}

const scrollTo = (element: number | Element, duration: number) => {
  if (typeof element === 'number') {
    element = Math.max(element, 0)
  }
  
  if (typeof element !== 'number') {
    return
  }
  
  const start = window.pageYOffset
  const change = element - start
  const increment = 20
  let currentTime = 0
  
  const animateScroll = () => {
    currentTime += increment
    const val = Math.easeInOutQuad(currentTime, start, change, duration)
    window.scrollTo(0, val)
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll)
    }
  }
  
  animateScroll()
}

// Math.easeInOutQuad polyfill
if (!Math.easeInOutQuad) {
  Math.easeInOutQuad = function (t: number, b: number, c: number, d: number) {
    t /= d / 2
    if (t < 1) {
      return (c / 2) * t * t + b
    }
    t--
    return (-c / 2) * (t * (t - 2) - 1) + b
  }
}
</script>

<style lang="scss" scoped>
.pagination-container {
  background: #fff;
  padding: 32px 16px;
  text-align: right;

  &.hidden {
    display: none;
  }
}

:deep(.el-pagination) {
  .el-select .el-input {
    width: 100px;
    margin: 0 5px;
  }

  .el-pagination__sizes {
    margin: 0 10px 0 0;
    font-weight: 400;
    color: #606266;
  }

  .btn-prev,
  .btn-next {
    margin: 0 5px;
    background-color: #f4f4f5;
    color: #606266;
    min-width: 35px;
    border-radius: 2px;

    &.disabled {
      color: #c0c4cc;
    }
  }

  .el-pager li.active {
    background-color: #409eff;
    color: #fff;
    min-width: 35px;
  }
}
</style>