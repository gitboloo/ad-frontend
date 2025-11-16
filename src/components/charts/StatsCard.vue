<template>
  <div class="stats-card" :style="{ background: cardBackground }">
    <div class="stats-content">
      <div class="stats-icon">
        <el-icon :size="32" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stats-data">
        <div class="stats-value">{{ displayValue }}</div>
        <div class="stats-label">{{ title }}</div>
        <div v-if="trend" class="stats-trend">
          <el-icon :size="12">
            <ArrowUp v-if="trendType === 'up'" />
            <ArrowDown v-else />
          </el-icon>
          <span>{{ trend }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: string | number
  icon: string
  color?: string
  trend?: string
  trendType?: 'up' | 'down'
}

const props = withDefaults(defineProps<Props>(), {
  color: '#409eff',
  trendType: 'up'
})

// 计算属性
const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const cardBackground = computed(() => {
  return `linear-gradient(135deg, ${props.color}, ${props.color}dd)`
})

const iconColor = computed(() => {
  return 'rgba(255, 255, 255, 0.9)'
})
</script>

<style lang="scss" scoped>
.stats-card {
  padding: 24px;
  border-radius: 12px;
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.stats-icon {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-data {
  flex: 1;
  
  .stats-value {
    font-size: 28px;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 4px;
  }
  
  .stats-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
  }
  
  .stats-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    opacity: 0.8;
    
    span {
      font-weight: 500;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-card {
    padding: 20px;
    
    .stats-content {
      gap: 12px;
    }
    
    .stats-icon {
      width: 48px;
      height: 48px;
    }
    
    .stats-data {
      .stats-value {
        font-size: 24px;
      }
      
      .stats-label {
        font-size: 13px;
      }
    }
  }
}
</style>