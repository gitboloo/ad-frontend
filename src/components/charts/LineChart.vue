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
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { ChartData } from '@/types'

// 注册必需的组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
])

interface Props {
  data: ChartData
  height?: string
  loading?: boolean
  smooth?: boolean
  showSymbol?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  loading: false,
  smooth: true,
  showSymbol: true
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

  return {
    title: props.title ? {
      text: props.title,
      left: 'left',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: 'var(--el-text-color-primary)'
      }
    } : undefined,
    
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#606266'
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    
    legend: {
      show: props.data.series.length > 1,
      top: props.title ? 35 : 10,
      textStyle: {
        color: 'var(--el-text-color-primary)'
      }
    },
    
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: props.title ? (props.data.series.length > 1 ? '20%' : '15%') : (props.data.series.length > 1 ? '15%' : '10%'),
      containLabel: true
    },
    
    toolbox: {
      feature: {
        saveAsImage: {
          title: '保存为图片'
        },
        dataZoom: {
          title: {
            zoom: '区域缩放',
            back: '区域缩放还原'
          }
        }
      },
      right: '2%',
      top: '2%'
    },
    
    xAxis: {
      type: 'category',
      data: props.data.categories,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisLabel: {
        color: '#909399',
        fontSize: 12
      },
      splitLine: {
        show: false
      }
    },
    
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#909399',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    
    series: props.data.series.map((item, index) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: props.smooth,
      showSymbol: props.showSymbol,
      lineStyle: {
        width: 3
      },
      itemStyle: {
        borderRadius: 4,
        borderWidth: 2
      },
      areaStyle: {
        opacity: 0.1
      }
    }))
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
    // 数据更新时的处理逻辑
    console.log('Chart data updated:', newData)
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