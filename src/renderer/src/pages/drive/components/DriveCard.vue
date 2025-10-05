<template>
  <t-col :md="2" :lg="2" :xl="2" :xxl="1" class="card" @click="getFileOrFolder(item)">
    <div class="card-container">
      <div class="card-main">
        <t-image
          class="card-main-item"
          fit="contain"
          shape="round"
          :src="item.thumb"
          :style="{ width: '100px', height: '90px', background: 'none' }"
          :lazy="true"
          :loading="renderLoading"
          :error="renderError"
        />
      </div>
      <div class="card-footer">
        <span class="card-footer-title">{{ item.name }}</span>
      </div>
    </div>
  </t-col>
</template>

<script setup lang="tsx">
import { FolderIcon, LoadingIcon } from 'tdesign-icons-vue-next';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  renderLoading: {
    type: Function,
    required: true
  },
  renderError: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['getFileOrFolder']);

const getFileOrFolder = (item: any) => {
  emit('getFileOrFolder', item);
};

const renderError = () => {
  return (
    <div class="renderIcon">
      <FolderIcon size="1.5em" stroke-width="2" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon">
      <LoadingIcon size="1.5em" stroke-width="2" />
    </div>
  );
};
</script>

<style lang="less" scoped>
.card {
  box-sizing: border-box;
  width: inherit;
  position: relative;
  cursor: pointer;

  &:hover {
    .card-container {
      background-color: var(--td-bg-color-container-hover);
    }
  }

  .card-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--td-comp-paddingLR-xs) var(--td-comp-paddingTB-s);
    border-radius: var(--td-radius-default);
  }

  .card-main {
    .card-main-item {
      width: 100px;
      height: 90px;
      border-radius: var(--td-radius-default);
      overflow: hidden;
    }
  }

  .card-footer {
    width: 100%;

    .card-footer-title {
      width: 100%;
      text-align: center;
      font-size: 14px;
      line-height: 1.5;
      max-width: 100%;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      overflow-wrap: break-word;
      margin-bottom: 2px;
      -webkit-transition: color .3s ease;
      transition: color .3s ease;
    }
  }
}

:deep(.renderIcon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.72);
}
</style>