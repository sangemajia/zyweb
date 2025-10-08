<template>
  <div class="drive view-container">
    <common-nav
      :title="$t('pages.drive.name')"
      :list="driveConfig.data"
      :active="active.nav"
      search
      @change-key="changeConf"
    />

    <div class="content">
      <DriveHeader :breadcrumb="breadcrumb" @goto-breadcrumb-path="gotoBreadcrumbPath" />

      <DriveList
        :drive-content="driveContent"
        :active="active"
        :is-visible="isVisible"
        :render-loading="renderLoading"
        :render-error="renderError"
        @get-file-or-folder="getFileOrFolder"
      />
    </div>

    <t-loading :attach="`.${prefix}-content`" size="medium" :loading="isVisible.loading" />
    <t-back-top
      container=".container"
      :visible-height="200"
      size="small"
      :offset="['1.4rem', '0.5rem']"
      :duration="2000"
      :firstload="false"
    />
  </div>
</template>

<script setup lang="tsx">
import 'v3-infinite-loading/lib/style.css';

import dayjs from 'dayjs';
import { FolderIcon, LoadingIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onActivated, onMounted, reactive, ref } from 'vue';
import InfiniteLoading from 'v3-infinite-loading';

import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { base64 } from '@/utils/crypto';

import { fetchDriveActive, putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import emitter from '@/utils/emitter';

import CommonNav from '@/components/common-nav/index.vue';
import DriveHeader from './components/DriveHeader.vue';
import DriveList from './components/DriveList.vue';
import DriveCard from './components/DriveCard.vue';

// 导入drive组件设置模块
import { useDriveSetup } from './modules/driveSetup';

// 使用drive组件设置
const {
  // 数据
  driveConfig,
  active,
  isVisible,
  driveContent,
  breadcrumb,
  storePlayer,

  // 方法
  refreshConf,
  defaultConf,
  changeConf,
  gotoBreadcrumbPath,
  getFileOrFolder,
  getCloudFolderHandler,
} = useDriveSetup();

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

onMounted(async () => {
  await getSetting(driveConfig.value, active.value);
  if (active.value.nav) await initCloud(driveConfig.value, isVisible, getCloudFolderHandler);
});

onActivated(() => {
  const isListenedRefreshDriveConfig = emitter.all.get('refreshDriveConfig');
  if (!isListenedRefreshDriveConfig) emitter.on('refreshDriveConfig', refreshConf);
});
</script>

<style lang="less" scoped>
.drive {
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

:deep(.renderIcon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.72);
}
</style>
