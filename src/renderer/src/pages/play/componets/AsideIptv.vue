<template>
  <div class="container-aside-iptv">
    <div class="tvg-block">
      <div class="title-album">
        <p class="title-text txthide">{{ formData.title }}</p>
      </div>
      <div class="function">
        <div class="func-item like" @click="putBinge">
          <span>
            <heart-filled-icon class="icon" v-if="active.binge" />
            <heart-icon class="icon" v-else />
          </span>
          <span class="tip">{{ $t('pages.player.function.like') }}</span>
        </div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="func-item share" @click="shareEvent">
          <share-popup v-model:visible="active.share" :data="shareFormData">
            <template #customize>
              <div style="display: flex; flex-direction: row; align-items: center">
                <share1-icon class="icon" />
                <span class="tip">{{ $t('pages.player.function.share') }}</span>
              </div>
            </template>
          </share-popup>
        </div>
      </div>
    </div>
    <div class="anthology-contents iptv-anthology">
      <t-tabs v-model="active.nav" class="listbox iptv-listbox">
        <t-tab-panel value="epg" :label="$t('pages.player.iptv.epg')">
          <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }" v-if="active.nav === 'epg'">
            <t-list-item v-for="(item, index) in epgList" :key="index" class="content">
              <div class="time-warp">{{ item['start'] }}</div>
              <div class="title-wrap txthide">{{ item['title'] }}</div>
              <div class="status-wrap">
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'played'" class="played">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'playing'" class="playing">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
                <span v-if="formatEpgStatus(item['start'], item['end']) === 'unplay'" class="unplay">
                  {{ $t(`pages.player.status.${formatEpgStatus(item['start'], item['end'])}`) }}
                </span>
              </div>
            </t-list-item>
          </t-list>
        </t-tab-panel>
        <t-tab-panel value="channel" :label="$t('pages.player.iptv.channel')">
          <title-menu :list="classList" :active="active.class" class="nav" @change-key="changeNavEvent" />
          <div class="contents-wrap scroll-y channel-wrap">
            <div v-for="item in channelList" :key="item['id']" class="content">
              <div class="content-item content-item-start" @click="changeChannelEvent(item)">
                <div class="logo-wrap">
                  <t-image
                    class="logo"
                    fit="contain"
                    :src="item.logo"
                    :style="{ width: '64px', height: '32px', maxHeight: '32px', background: 'none' }"
                    :lazy="true"
                    :loading="renderLoading"
                    :error="renderError"
                  >
                  </t-image>
                </div>
                <div class="title-wrap txthide title-warp-channel">{{ item['name'] }}</div>
                <div class="status-wrap">
                  <span :class="item['id'] === info['id'] ? 'playing' : 'unplay'">
                    {{
                      item['id'] === info['id'] ? $t('pages.player.status.playing') : $t('pages.player.status.unplay')
                    }}
                  </span>
                </div>
              </div>
              <t-divider dashed style="margin: 5px 0" />
            </div>
            <infinite-loading
              class="infinite-loading-container"
              target=".channel-wrap"
              :identifier="infiniteId"
              :distance="200"
              @infinite="load"
            >
              <template #complete>{{ $t('pages.player.infiniteLoading.complete') }}</template>
              <template #error>{{ $t('pages.player.infiniteLoading.error') }}</template>
            </infinite-loading>
          </div>
        </t-tab-panel>
      </t-tabs>
    </div>
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import { Tv1Icon, LoadingIcon, HeartIcon, HeartFilledIcon, Share1Icon } from 'tdesign-icons-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import TitleMenu from '@/components/title-menu/index.vue';
import { useIptvSetup } from './iptv/iptvSetup';

const props = defineProps({
  info: {
    type: Object,
    default: {},
  },
  ext: {
    type: Object,
    default: {},
  },
  process: {
    type: Object,
    default: {
      currentTime: 0,
      duration: 0,
    },
  },
});

const emits = defineEmits(['update', 'play']);

const {
  formData,
  channelList,
  classList,
  epgList,
  active,
  shareFormData,
  infiniteId,
  load,
  changeChannelEvent,
  changeNavEvent,
  shareEvent,
  putBinge,
  setup,
  formatEpgStatus,
} = useIptvSetup(props, emits);

import { renderError, renderLoading } from '@/utils/common/renderUtils';

const renderError = () => {
  return renderError();
};

const renderLoading = () => {
  return renderLoading();
};
</script>

<style lang="less" scoped>
.container-aside-iptv {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
