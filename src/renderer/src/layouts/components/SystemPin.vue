<template>
  <div class="system-pin">
    <t-button theme="default" shape="square" variant="text">
      <pin-filled-icon v-if="active.pin" />
      <pin-icon v-else />
    </t-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PinFilledIcon, PinIcon } from 'tdesign-icons-vue-next';

const active = ref({
  pin: false,
});

// 窗口置顶功能在Web版本中不适用
const toggleAlwaysOnTop = async () => {
  // Web版本中不实现窗口置顶功能
  console.log('窗口置顶功能在Web版本中不适用');
};
</script>