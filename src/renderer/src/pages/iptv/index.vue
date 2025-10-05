<template>
  <div class="iptv view-container">
    <common-nav
      :title="$t('pages.iptv.name')"
      :list="iptvConfig.data"
      :active="active.nav"
      search
      @change-key="changeConf"
    />

    <div class="content">
      <IptvHeader 
        :class-list="classList" 
        :active="active" 
        @change-class-event="changeClassEvent" 
      />

      <IptvList 
        :channel-list="channelList" 
        :iptv-config="iptvConfig" 
        :active="active" 
        :is-visible="isVisible" 
        :infinite-id="infiniteId" 
        :render-loading="renderLoading" 
        :render-error="renderError" 
        :options-component="optionsComponent" 
        @load="load" 
        @play-event="playEvent" 
        @con-button-click="conButtonClick" 
        @copy-channel-event="copyChannelEvent" 
        @del-channel-event="delChannelEvent" 
      />
    </div>

    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1.4rem', '0.5rem']" :duration="2000" />
  </div>
</template>

<script setup lang="tsx">
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css';
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';
import moment from 'moment';
import PQueue from 'p-queue';
import { MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { computed, onActivated, onMounted, ref, reactive } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore, useSettingStore } from '@/store';

import { fetchIptvActive, fetchChannelPage, delChannel, putIptvDefault } from '@/api/iptv';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { checkChannel, stopCheckChannel } from '@/utils/channel';
import emitter from '@/utils/emitter';
import { checkIpVersion, copyToClipboardApi } from '@/utils/tool';

import CommonNav from '@/components/common-nav/index.vue';
import IptvHeader from './components/IptvHeader.vue';
import IptvList from './components/IptvList.vue';
import IptvCard from './components/IptvCard.vue';

// 导入iptv组件设置模块
import { useIptvSetup } from './modules/iptvSetup';

// 使用iptv组件设置
const {
  // 数据
  isVisible,
  searchTxt,
  infiniteId,
  infiniteCompleteTip,
  pagination,
  iptvConfig,
  active,
  channelList,
  classList,
  mode,
  optionsComponent,
  channelItem,
  storePlayer,
  storeSetting,

  // 队列
  delayQueue,
  ipversionQueue,
  thumbnailQueue,

  // 方法
  refreshConf,
  defaultConf,
  changeConf,
  searchEvent,
  changeClassEvent,
  load,
  playEvent,
  clearQueue
} = useIptvSetup();

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};

onActivated(() => {
  const isListenedRefreshIptvConfig = emitter.all.get('refreshIptvConfig');
  if (!isListenedRefreshIptvConfig) emitter.on('refreshIptvConfig', refreshConf);
});

emitter.on('searchIptv', (kw: any) => {
  console.log('[iptv][bus][receive]', kw);
  searchTxt.value = kw;
  clearQueue();
  searchEvent();
});

// 右键
const conButtonClick = (item: any, { x, y }: any) => {
  isVisible.contentMenu = true;
  Object.assign(optionsComponent.value, { x, y });
  channelItem.value = item;
};

// 删除
const delChannelEvent = () => {
  const index = channelList.value.indexOf(channelItem.value);
  if (index > -1) {
    channelList.value.splice(index, 1);
    delChannel({ids: [channelItem.value.id]});
  }
  isVisible.contentMenu = false;
};

// 拷贝
const copyToClipboard = async (content, successMessage, errorMessage) => {
  const res = await copyToClipboardApi(content);
  if (res) {
    MessagePlugin.info(successMessage);
  } else {
    MessagePlugin.warning(errorMessage);
  }
};
const copyChannelEvent = async () => {
  const successMessage = t('pages.iptv.message.setSuccess');
  const errorMessage = t('pages.iptv.message.copyFail');
  await copyToClipboard(channelItem.value.url, successMessage, errorMessage);

  isVisible.contentMenu = false;
};
</script>

<style lang="less" scoped>
.iptv {
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;

  .content {
    // width: calc(100% - 170px);
    min-width: 750px;
    position: relative;
    padding: var(--td-pop-padding-l);
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-default);
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--td-size-4);
  }
}
</style>