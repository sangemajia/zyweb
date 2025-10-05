<template>
  <header class="header" v-if="classConfig.data.length > 0">
    <div class="header-nav">
      <title-menu :list="classConfig.data" :active="active.class" @change-key="changeClassEvent" />
    </div>
    <t-button theme="default" shape="square" variant="text" v-if="filterData[active.class]" class="quick_filter">
      <root-list-icon @click="isVisible.toolbar = !isVisible.toolbar" />
    </t-button>
  </header>
</template>

<script setup lang="ts">
import { RootListIcon } from 'tdesign-icons-vue-next';
import TitleMenu from '@/components/title-menu/index.vue';

// 定义组件属性
defineProps({
  classConfig: {
    type: Object,
    required: true
  },
  active: {
    type: Object,
    required: true
  },
  filterData: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Object,
    required: true
  }
});

// 定义事件发射器
const emit = defineEmits(['changeClassEvent']);

// 分类切换事件处理函数
const changeClassEvent = (key: string) => {
  emit('changeClassEvent', key);
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

  :deep(.t-button) {
    &:not(.t-is-disabled):not(.t-button--ghost) {
      --ripple-color: transparent;
    }
  }

  :deep(.t-button__text) {
    svg {
      color: var(--td-text-color-placeholder);
    }
  }

  :deep(.t-button--variant-text) {
    &:hover {
      border-color: transparent;
      background-color: transparent;

      .t-button__text {
        svg {
          color: var(--td-primary-color);
        }
      }
    }
  }

  .quick_filter {
    margin-right: -6px;
  }
}
</style>