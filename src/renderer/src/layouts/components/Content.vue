<template>
  <div :class="`${prefix}-content-layout`">
    <router-view v-slot="{ Component }">
      <component :is="Component" v-if="Component" />
      <div v-else>加载中...</div>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { prefix } from '@/config/global';
</script>

<style lang="less" scoped>
// 从zyplayer复制的样式
@import '@/style/layout.less';

.@{starter-prefix}-content-layout {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  height: 100%;
  overflow: auto;
}
</style>