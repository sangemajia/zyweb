<template>
  <div class="container-aside-film">
    <div v-if="!active.profile" class="contents-wrap">
      <div class="tvg-block">
        <div class="title-album">
          <div class="title-text txthide">{{ info['vod_name'] }}</div>
          <div class="title-desc" @click="active.profile = true">
            <span class="title-unfold">{{ $t('pages.player.film.desc') }}</span>
            <chevron-right-s-icon />
          </div>
        </div>
        <div class="hot-block txthide">
          <span class="rate">
            <star-icon size="12px" />
            {{ info['vod_score'] ? info['vod_score'] : '0.0' }}
          </span>
          <t-divider layout="vertical" v-show="info['type_name']" />
          <span v-show="info['type_name']" class="txthide">{{ formatContent(info['type_name']) }}</span>
          <t-divider layout="vertical" v-show="info['vod_area']" />
          <span v-show="info['vod_area']" class="txthide">{{ formatContent(info['vod_area']) }}</span>
          <t-divider layout="vertical" v-show="info['vod_year']" />
          <span v-show="info['vod_year']" class="txthide">{{ formatContent(info['vod_year']) }}</span>
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
          <div class="func-item download" @click="downloadEvent">
            <download-icon class="icon" />
            <span class="tip">{{ $t('pages.player.function.download') }}</span>
          </div>
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
          <div class="dot"></div>
          <div class="func-item more">
            <t-dropdown trigger="click">
              <t-button theme="default" shape="square" variant="text">
                <more-icon />
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item>
                  <div class="setting-item" @click="settingEvent">
                    <setting-icon />
                    {{ $t('pages.player.function.setting') }}
                  </div>
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </div>
        </div>
        <dialog-setting-view v-model:visible="active.setting" :data="settingFormData" @update="settingUpdateEvent" />
        <dialog-download-view v-model:visible="active.download" :data="downloadFormData" />
      </div>
      <div class="anthology-contents scroll-y">
        <div class="box-anthology-header">
          <div class="left">
            <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
            <div class="box-anthology-analyze" v-show="active.official">
              <t-dropdown placement="bottom" :max-height="250">
                <t-button size="small" theme="default" variant="text" auto-width>
                  <span class="title">{{ $t('pages.player.film.analyze') }}</span>
                  <template #suffix>
                    <chevron-down-icon size="16" />
                  </template>
                </t-button>
                <t-dropdown-menu>
                  <t-dropdown-item
                    v-for="item in analyzeData.list"
                    :key="item.id"
                    :active="item.id === active.analyzeId"
                    @click="switchAnalyzeEvent(item.id)"
                  >
                    <span>{{ item.name }}</span>
                  </t-dropdown-item>
                  <t-dropdown-item v-if="analyzeData.list.length === 0">{{ $t('pages.player.noApi') }}</t-dropdown-item>
                </t-dropdown-menu>
              </t-dropdown>
            </div>
          </div>
          <div class="right">
            <div class="box-anthology-reverse-order" @click="reverseOrderEvent">
              <order-descending-icon v-if="active.reverseOrder" size="1.2em" />
              <order-ascending-icon v-else size="1.2em" />
            </div>
          </div>
        </div>
        <div class="listbox">
          <title-menu
            v-if="lineList.length > 1"
            :list="lineList"
            :active="active.flimSource"
            class="nav"
            @change-key="switchLineEvent"
          />
          <div class="tag-container">
            <div
              v-for="(item, index) in seasonData?.[active.flimSource]"
              :key="item"
              :class="['mainVideo-num', item === active.filmIndex ? 'mainVideo-selected' : '']"
              @click="switchSeasonEvent(item)"
            >
              <t-tooltip :content="formatName(item)">
                <div class="mainVideo_inner">
                  {{
                    formatReverseOrder(
                      active.reverseOrder ? 'positive' : 'negative',
                      index,
                      seasonData?.[active.flimSource]?.length,
                    )
                  }}
                  <div class="playing"></div>
                </div>
              </t-tooltip>
            </div>
          </div>
        </div>
        <div class="recommend" v-show="recommendList.length != 0">
          <div class="component-title">{{ $t('pages.player.film.recommend') }}</div>
          <div class="component-list">
            <div
              v-for="content in recommendList"
              :key="content['id']"
              class="videoItem-card"
              @click="recommendEvent(content)"
            >
              <div class="videoItem-left">
                <t-image
                  class="card-main-item"
                  :src="content['vod_pic']"
                  :style="{ width: '126px', height: '70px', 'border-radius': '5px' }"
                  :lazy="true"
                  fit="cover"
                >
                </t-image>
              </div>
              <div class="videoItem-right">
                <div class="title txthide">{{ content['vod_name'] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="profile">
      <div class="side-head">
        <div class="title">{{ $t('pages.player.film.desc') }}</div>
        <close-icon size="1.3em" class="icon" @click="active.profile = false" />
      </div>
      <t-divider dashed style="margin: 5px 0" />
      <div class="side-body scroll-y">
        <div class="card">
          <div class="cover">
            <t-image
              class="card-main-item"
              :src="info['vod_pic']"
              :style="{ width: '100%', height: '100%', 'border-radius': '5px' }"
              :lazy="true"
              fit="cover"
            />
          </div>
          <div class="content">
            <div class="name" v-show="info['vod_name']">
              {{ formatContent(info['vod_name']) || $t('pages.film.info.unknown') }}
            </div>
            <div class="type" v-show="info['type_name']">{{ formatContent(info['type_name']) }}</div>
            <div class="num" v-show="info['vod_remarks']">{{ formatContent(info['vod_remarks']) }}</div>
          </div>
        </div>
        <div class="background">
          <div class="title">{{ $t('pages.player.film.background') }}</div>
          <div class="content">
            <span class="txt" v-html="formatContent(info['vod_content']) || $t('pages.film.info.unknown')"></span>
          </div>
        </div>
        <div class="case">
          <div class="title">{{ $t('pages.player.film.actors') }}</div>
          <div class="content">
            <div class="director">
              <span class="name">{{ $t('pages.player.film.director') }}: </span>
              <span class="role">{{ formatContent(info['vod_director']) || $t('pages.film.info.unknown') }}</span>
            </div>
            <div class="actor">
              <span class="name">{{ $t('pages.player.film.actor') }}: </span>
              <span class="role">{{ formatContent(info['vod_actor']) || $t('pages.film.info.unknown') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { ref, watch, computed, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { throttle } from 'lodash-es';
import moment from 'moment';
import {
  ChevronDownIcon,
  ChevronRightSIcon,
  CloseIcon,
  DownloadIcon,
  HeartIcon,
  HeartFilledIcon,
  SettingIcon,
  MoreIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
  StarIcon,
  Share1Icon,
} from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import emitter from '@/utils/emitter';
import DialogDownloadView from './DialogDownload.vue';
import DialogSettingView from './DialogSetting.vue';
import SharePopup from '@/components/share-popup/index.vue';
import TitleMenu from '@/components/title-menu/index.vue';

// Import setup module
import { useAsideFilmSetup } from './asideFilmSetup';

// Import utility modules
import {
  fetchBinge,
  putBinge,
  fetchHistory,
  putHistory,
  shareEvent,
  downloadEvent,
  settingEvent,
  defaultEmpConf,
  callPlay,
  switchLineEvent,
  switchAnalyzeEvent,
  switchSeasonEvent,
  reverseOrderEvent,
  settingUpdateEvent,
  fetchRecommend,
  recommendEvent,
  setup,
  timerUpdatePlayProcess,
  handleSeasonActive,
} from './utils/filmUtils';

// Import helper functions
import {
  VIP_LIST,
  fetchBarrageData,
  playHelper,
  reverseOrderHelper,
  fetchRecommSearchHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
} from '@/utils/common/film';

import { fetchRecommPage } from '@/api/site';
import { fetchAnalyzeActive } from '@/api/analyze';

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

const emits = defineEmits(['update', 'play', 'barrage', 'pause']);

const {
  infoConf,
  extConf,
  processConf,
  formData,
  analyzeData,
  bingeData,
  historyData,
  seasonData,
  lineList,
  videoData,
  recommendList,
  shareFormData,
  downloadFormData,
  settingFormData,
  active,
  tmp,
  throttlePutHistory,
  setupLifecycle,
} = useAsideFilmSetup(props, emits);

watch(
  () => props.info,
  (val) => {
    infoConf.value = val;
    formData.value.title = val.vod_name;
  },
  { deep: true },
);
watch(
  () => props.process,
  (val) => {
    processConf.value = val;
  },
  { deep: true },
);
watch(
  () => props.ext,
  (val) => {
    extConf.value = val;
  },
  { deep: true },
);
watch(
  () => processConf.value,
  (val) => {
    timerUpdatePlayProcess(val.currentTime, val.duration);
  },
  { deep: true },
);

// Setup lifecycle
setupLifecycle(setup);
</script>

<style lang="less" scoped></style>
