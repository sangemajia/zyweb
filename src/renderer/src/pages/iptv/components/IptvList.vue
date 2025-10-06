<template>
  <div class="container">
    <div class="content-wrapper" id="back-top">
      <t-row :gutter="[16, 4]" style="margin-left: -8px; margin-right: -8px">
        <IptvCard
          v-for="item in channelList"
          :key="item.id"
          :item="item"
          :iptv-config="iptvConfig"
          :render-loading="renderLoading"
          :render-error="renderError"
          @play-event="playEvent"
          @con-button-click="conButtonClick"
        />
        <context-menu :show="isVisible.contentMenu" :options="optionsComponent" @close="isVisible.contentMenu = false">
          <context-menu-item :label="$t('pages.iptv.contextMenu.copyChannel')" @click="copyChannelEvent" />
          <context-menu-item :label="$t('pages.iptv.contextMenu.delChannel')" @click="delChannelEvent" />
        </context-menu>
      </t-row>

      <div class="infinite-loading">
        <infinite-loading
          v-if="isVisible.lazyload"
          class="infinite-loading-container"
          :identifier="infiniteId"
          :duration="200"
          @infinite="load"
        >
          <template #complete>{{ $t(`pages.iptv.infiniteLoading.${active.infiniteType}`) }}</template>
          <template #error>{{ $t('pages.iptv.infiniteLoading.error') }}</template>
        </infinite-loading>
        <infinite-loading v-else="isVisible.lazyload" class="infinite-loading-container" />
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'v3-infinite-loading/lib/style.css';

import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';
import InfiniteLoading from 'v3-infinite-loading';
import { computed } from 'vue';

import { useSettingStore } from '@/store';

const storeSetting = useSettingStore();

const props = defineProps({
  channelList: {
    type: Array,
    required: true,
  },
  iptvConfig: {
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
  optionsComponent: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['load', 'playEvent', 'conButtonClick', 'copyChannelEvent', 'delChannelEvent']);

const mode = computed(() => {
  return storeSetting.displayMode;
});

const load = ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
  emit('load', $state);
};

const playEvent = (item: any) => {
  emit('playEvent', item);
};

const conButtonClick = (item: any, event: any) => {
  emit('conButtonClick', item, event);
};

const copyChannelEvent = () => {
  emit('copyChannelEvent');
};

const delChannelEvent = () => {
  emit('delChannelEvent');
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
