<template>
  <div class="container-aside-analyze">
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
    <div class="anthology-contents analyze-anthology">
      <div class="box-anthology-header">
        <div class="left">
          <h4 class="box-anthology-title">{{ $t('pages.player.film.analyze') }}</h4>
        </div>
        <div class="right"></div>
      </div>
      <div class="listbox drive-listbox">
        <t-list class="contents-wrap" split :scroll="{ type: 'virtual' }">
          <t-list-item v-for="item in seasonList" :key="item.id" class="content" @click="changeAnalyzeEvent(item)">
            <div class="title-wrap txthide">{{ item['name'] }}</div>
            <div class="status-wrap">
              <span :class="extConf['site']['id'] === item['id'] ? 'useing' : 'unuse'">
                {{
                  extConf['site']['id'] === item['id']
                    ? $t('pages.player.status.useing')
                    : $t('pages.player.status.unuse')
                }}
              </span>
            </div>
          </t-list-item>
        </t-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { HeartIcon, HeartFilledIcon, Share1Icon } from 'tdesign-icons-vue-next';
import { useAnalyzeSetup } from './analyze/analyzeSetup';

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

const { formData, seasonList, active, shareFormData, extConf, changeAnalyzeEvent, shareEvent, putBinge } =
  useAnalyzeSetup(props, emits);
</script>

<style lang="less" scoped>
.container-aside-drive {
  .title-text {
    max-width: 100% !important;
  }
}
</style>
