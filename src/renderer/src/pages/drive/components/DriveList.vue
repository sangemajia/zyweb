<template>
  <div class="container">
    <div class="content-wrapper" id="back-top">
      <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
        <DriveCard
          v-for="item in driveContent"
          :key="item.id"
          :item="item"
          :render-loading="renderLoading"
          :render-error="renderError"
          @get-file-or-folder="getFileOrFolder"
        />
      </t-row>

      <div>
        <infinite-loading v-if="isVisible.lazyload" class="infinite-loading-container" />
        <div v-else class="infinite-loading-container" style="min-height: 1px; text-align: center; margin-bottom: 2em">
          {{ $t(`pages.drive.infiniteLoading.${active.infiniteType}`) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'v3-infinite-loading/lib/style.css';
import InfiniteLoading from 'v3-infinite-loading';

defineProps({
  driveContent: {
    type: Array,
    required: true,
  },
  active: {
    type: Object,
    required: true,
  },
  isVisible: {
    type: Object,
    required: true,
  },
  renderLoading: {
    type: Function,
    required: true,
  },
  renderError: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(['getFileOrFolder']);

const getFileOrFolder = (item: any) => {
  emit('getFileOrFolder', item);
};
</script>

<style lang="less" scoped>
.container {
  flex: 1;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .content-wrapper {
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
    position: relative;
  }
}
</style>
