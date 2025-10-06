<template>
  <header class="header" v-if="classList.length > 0">
    <div class="header-nav">
      <title-menu :list="classList" :active="active.class" @change-key="changeClassEvent" />
    </div>
  </header>
</template>

<script setup lang="ts">
import TitleMenu from '@/components/title-menu/index.vue';

defineProps({
  classList: {
    type: Array,
    required: true,
  },
  active: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['changeClassEvent']);

const changeClassEvent = (id: string) => {
  emit('changeClassEvent', id);
};
</script>

<style lang="less" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  flex-shrink: 0;
  width: 100%;

  .header-nav {
    width: 100%;
    overflow: hidden;
  }
}
</style>
