<template>
  <div v-if="platform !== 'darwin'" class="system-controls-placeholder"></div>
</template>

<script setup lang="ts">
import { platform } from '@/utils/tool';
</script>

<style lang="less" scoped>
.system-controls-placeholder {
  width: 102px;
  height: 100%;
}
</style>