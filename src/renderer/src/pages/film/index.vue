<template>
  <div class="film view-container">
    <common-nav
      :title="$t('pages.film.name')"
      :list="siteConfig.filterOnlySearchData"
      :active="active.nav"
      search
      @change-key="changeConf"
   />

    <div class="content">
      <FilmHeader 
        :class-config="classConfig" 
        :active="active" 
        :filter-data="filterData" 
        :is-visible="isVisible" 
        @change-class-event="changeClassEvent" 
      />

      <FilmFilter 
        :filter-data="filterData" 
        :active="active" 
        :is-visible="isVisible" 
        @change-filter-event="changeFilterEvent" 
      />

      <FilmList 
        :film-data="filmData" 
        :active="active" 
        :is-visible="isVisible" 
        :infinite-id="infiniteId" 
        :render-loading="renderLoading" 
        :render-error="renderError" 
        @load="load" 
        @play-event="playEvent" 
      />
    </div>

    <detail-view v-model:visible="isVisible.detail" :ext="detailFormData.ext" :info="detailFormData.info" />
    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
    <t-back-top container="#back-top" size="small" :offset="['1.4rem', '0.5rem']" :duration="2000" />
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';
import lazyImg from '@/assets/lazy.png';

import { MessagePlugin } from 'tdesign-vue-next';
import { RootListIcon } from 'tdesign-icons-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onActivated } from 'vue';

import { prefix } from '@/config/global';
import { t } from '@/locales';

import emitter from '@/utils/emitter';

import DetailView from './components/Detail.vue';
import CommonNav from '@/components/common-nav/index.vue';
import FilmHeader from './components/FilmHeader.vue';
import FilmFilter from './components/FilmFilter.vue';
import FilmList from './components/FilmList.vue';

// 导入film组件设置模块
import { useFilmSetup } from './modules/filmSetup';

// 使用film组件设置
const {
  // 数据
  infiniteId,
  searchTxt,
  searchCurrentSite,
  detailFormData,
  isVisible,
  pagination,
  filterData,
  siteConfig,
  active,
  filmData,
  classConfig,
  storePlayer,

  // 方法
  getSetting,
  refreshConf,
  defaultConf,
  changeConf,
  classFilter,
  changeClassEvent,
  changeFilterEvent,
  load,
  searchEvent,
  searchGroup,
  getClassList,
  getFilmList,
  getSearchList,
  playEvent
} = useFilmSetup();

const renderError = () => {
  return (
    <div class="renderIcon" style="height: 100%">
      <img src={lazyImg} style="height: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="height: 100%">
      <img src={lazyImg} style="height: 100%; object-fit: cover;" />
    </div>
  );
};

onActivated(() => {
  const isListenedRefreshFilmConfig = emitter.all.get('refreshFilmConfig');
  if (!isListenedRefreshFilmConfig) emitter.on('refreshFilmConfig', refreshConf);
});

// 非cms筛选：基于请求数据
const filterApiEvent = async () => {
  filmData.value = { list: [], rawList: [] };
  pagination.value.pageIndex = 1;
  infiniteId.value++;
};

emitter.on('searchFilm', (data: any) => {
  console.log('[film][bus][receive]', data);
  const { kw, group, filter } = data;

  searchTxt.value = kw;
  siteConfig.value.filter = filter;
  if (siteConfig.value.search !== group) siteConfig.value.search = group;
  siteConfig.value.searchGroup = searchGroup(group, siteConfig.value.default);

  if (siteConfig.value.searchGroup.length === 0) {
    MessagePlugin.warning(t('pages.film.message.notSelectSourceBeforeSearch'));
    return;
  };

  searchEvent();
});
</script>

<style lang="less" scoped>
.film {
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