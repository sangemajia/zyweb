<template>
  <div class="layout">
    <t-layout>
      <t-header height=32 :class="`${prefix}-header`">
        <header-view class="header" :title="headerFormData.title"/>
      </t-header>
      <t-layout>
        <t-content :class="`${prefix}-content`">
          <multi-player ref="playerRef" :class='["subject", active.aside ? "subject-ext": "" ]' @update-time="handleTimeUpdate"/>
          <div class="btn-box dock-show" @click="toggleAside">
            <chevron-left-icon v-if="active.aside" class="btn-icon" />
            <chevron-right-icon v-else class="btn-icon" />
          </div>
        </t-content>
        <t-aside key="side" :class="`${prefix}-aside`" v-show="!active.aside">
          <aside-analyze-view class="container-aside"
            v-if="storeConf.type === 'analyze'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            :process="processFormData"
            @update="updateConf"
            @play="updatePlay"
            @pause="updatePause"
          />
          <aside-drive-view class="container-aside"
            v-if="storeConf.type === 'drive'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            :process="processFormData"
            @update="updateConf"
            @play="updatePlay"
            @pause="updatePause"
          />
          <aside-film-view
            class="container-aside"
            v-if="storeConf.type === 'film'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            :process="processFormData"
            @update="updateConf"
            @play="updatePlay"
            @barrage="updateBarrage"
            @pause="updatePause"
          />
          <aside-iptv-view class="container-aside"
            v-if="storeConf.type === 'iptv'"
            :info="asideFormData.info"
            :ext="asideFormData.ext"
            :process="processFormData"
            @update="updateConf"
            @play="updatePlay"
            @pause="updatePause"
          />
        </t-aside>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import './index.less';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon } from 'tdesign-icons-vue-next';
import { usePlayStore } from '@/store';
import { prefix } from '@/config/global';
import HeaderView from './componets/Header.vue';
import AsideAnalyzeView from './componets/AsideAnalyze.vue';
import AsideFilmView from './componets/AsideFilm.vue';
import AsideIptvView from './componets/AsideIptv.vue';
import AsideDriveView from './componets/AsideDrive.vue';
import { MultiPlayer } from '@/components/player';
import type { MultiPlayerInstance } from '@/components/player';


const store: { [key: string]: any } = usePlayStore();
const active = ref({
  aside: false
});
const storeConf = computed(() => {
  return {
    type: store.type,
    info: store.data.info,
    ext: store.data.ext,
    setting: store.setting
  }
});
const headerFormData = ref({
  title: '',
});
const playerFormData = ref({
  url: '',
  next: false,
  quality: [],
  isLive: false,
  headers: {},
  type: '',
  startTime: 0,
  container: 'play-mse'
});
const asideFormData = ref({
  info: storeConf.value.info,
  ext: storeConf.value.ext
});
const processFormData = ref({
  currentTime: 0,
  duration: 0
});
const playerRef = useTemplateRef<MultiPlayerInstance | null>('playerRef');

onMounted(() => {
  setupConf();
});

const toggleAside = () => {
  active.value.aside = !active.value.aside;
};

const setupConf = () => {
  headerFormData.value.title = storeConf.value.info.name;
  asideFormData.value = { info: storeConf.value.info, ext: storeConf.value.ext };
};

const updateConf = (item) => {
  store.updateConfig({ ...item });
  setupConf();
};

const updatePlay = async (item) => {
  playerFormData.value = { ...playerFormData.value, ...item };

  const playerMode = storeConf.value.setting.playerMode;
      // Web应用中不支持外部播放器，直接使用内置播放器
      await playerRef.value?.create({ ...playerFormData.value }, playerMode.type);
      await playerRef.value?.onTimeUpdate();
};

const updateBarrage = async (item) => {
  if (playerRef.value) {
    setTimeout(async () => {
      await playerRef.value?.barrage(item.comments, item.url, item.id);
    }, 0);
  }
};

const updatePause = async () => {
  if (playerRef.value) {
    playerRef.value?.pause();
  }
};

const handleTimeUpdate = (time) => {
  processFormData.value = time;
};

// Web应用中不需要监听Electron IPC事件
// 页面关闭时自动清理播放器状态
window.addEventListener('beforeunload', () => {
  store.updateConfig({ status: false });
});

// Web应用中不支持外部媒体控制
</script>

<style lang="less" scoped>
</style>
