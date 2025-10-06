<template>
  <div class="container">
    <div class="content-wrapper" id="back-top">
      <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
        <FilmCard
          v-for="item in filmData.list"
          :key="item.vod_id"
          :item="item"
          :render-loading="renderLoading"
          :render-error="renderError"
          @play-event="playEvent"
        />
      </t-row>

      <div class="infinite-loading">
        <infinite-loading
          v-if="isVisible.lazyload"
          class="infinite-loading-container"
          :identifier="infiniteId"
          :duration="200"
          @infinite="load"
        >
          <template #complete>{{ $t(`pages.film.infiniteLoading.${active.infiniteType}`) }}</template>
          <template #error>{{ $t('pages.film.infiniteLoading.error') }}</template>
        </infinite-loading>
        <infinite-loading v-else="isVisible.lazyload" class="infinite-loading-container" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref } from 'vue';
import InfiniteLoading from 'v3-infinite-loading';
import FilmCard from './FilmCard.vue';

// 定义组件属性
const props = defineProps({
  filmData: {
    type: Object,
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
  infiniteId: {
    type: Number,
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

// 定义事件发射器
const emit = defineEmits(['load', 'playEvent']);

// 无限加载处理函数
const load = ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  emit('load', $state);
};

// 播放事件处理函数
const playEvent = (item: any) => {
  emit('playEvent', item);
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
