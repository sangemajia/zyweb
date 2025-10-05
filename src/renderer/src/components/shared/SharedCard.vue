<template>
  <div class="shared-card">
    <div class="shared-card-header" v-if="$slots.header">
      <slot name="header"></slot>
    </div>
    <div class="shared-card-body">
      <slot></slot>
    </div>
    <div class="shared-card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// 共享卡片组件
</script>

<style scoped>
.shared-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
}

.shared-card-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.shared-card-body {
  padding: 16px;
}

.shared-card-footer {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: #f5f5f5;
}
</style>