<template>
  <div class="example-module">
    <h1>示例模块</h1>
    <p>这个模块展示了如何使用共享组件和工具函数</p>
    
    <!-- 使用共享按钮组件 -->
    <shared-button type="primary" @click="handleButtonClick">
      点击我 ({{ clickCount }}次)
    </shared-button>
    
    <!-- 使用共享卡片组件 -->
    <shared-card>
      <template #header>
        <h2>卡片标题</h2>
      </template>
      <p>这是卡片内容</p>
      <p>当前时间: {{ currentTime }}</p>
      <template #footer>
        <shared-button type="secondary" @click="updateTime">
          更新时间
        </shared-button>
      </template>
    </shared-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// 导入共享工具函数
import { formatDate } from '@/utils/shared-utils';

// 定义响应式数据
const clickCount = ref(0);
const currentTime = ref('');

// 定义方法
const handleButtonClick = () => {
  clickCount.value++;
};

const updateTime = () => {
  // 使用共享工具函数来格式化时间
  currentTime.value = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');
};

// 组件挂载时初始化时间
onMounted(() => {
  updateTime();
});
</script>

<style scoped>
.example-module {
  padding: 20px;
}

.example-module h1 {
  color: #333;
}

.example-module p {
  color: #666;
}
</style>