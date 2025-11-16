<template>
  <div class="chart-container" :style="{ height }">
    <div v-loading="loading" class="chart-content">
      <v-chart
        class="chart"
        :option="chartOption"
        :autoresize="true"
        @click="handleChartClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { ChartData } from '@/types'

// 注册必需的组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
])

interface Props {
  data: ChartData
  height?: string
  loading?: boolean
  title?: string
  showPercent?: boolean
  radius?: [string, string]
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  loading: false,
  showPercent: true,
  radius: () => ['40%', '70%']
})

const emit = defineEmits<{
  click: [data: any]
}>()

// 图表配置
const chartOption = computed(() => {
  if (!props.data.categories.length || !props.data.series.length) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#909399',
          fontSize: 14
        }
      }
    }
  }

  // 转换数据格式为饼图所需的格式
  const pieData = props.data.categories.map((name, index) => ({
    name,
    value: props.data.series[0]?.data[index] || 0
  }))

  return {
    title: props.title ? {
      text: props.title,
      left: 'center',
      top: '2%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: 'var(--el-text-color-primary)'
      }
    } : undefined,
    
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#606266'
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        color: 'var(--el-text-color-primary)'
      },
      itemGap: 12,
      itemWidth: 12,
      itemHeight: 12
    },
    
    toolbox: {
      feature: {
        saveAsImage: {
          title: '保存为图片'
        }
      },
      right: '2%',
      top: '2%'
    },
    
    series: [
      {
        name: props.data.series[0]?.name || '数据',
        type: 'pie',
        radius: props.radius,
        center: ['60%', '50%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: props.showPercent,
          formatter: '{b}\n{d}%',
          fontSize: 12,
          color: 'var(--el-text-color-primary)'
        },
        labelLine: {
          show: props.showPercent,
          length: 15,
          length2: 10,
          lineStyle: {
            color: '#e4e7ed'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ],
    
    // 配色方案
    color: [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', 
      '#73c0de', '#3ba272', '#fc8452', '#9a60b4', 
      '#ea7ccc', '#6ca2f7', '#b5df8b', '#fdd876'
    ]
  }
})

// 处理图表点击事件
const handleChartClick = (params: any) => {
  emit('click', params)
}

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    console.log('Pie chart data updated:', newData)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  position: relative;
}

.chart-content {
  width: 100%;
  height: 100%;
  
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>