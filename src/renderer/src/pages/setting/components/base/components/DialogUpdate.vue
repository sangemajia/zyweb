<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
    :footer="false"
    :close-on-esc-keydown="false"
    :close-on-overlay-click="false"
  >
    <template #header>
      {{ $t('pages.setting.update.title') }}
    </template>
    <template #body>
      <div class="dialog-container-padding">
        <t-loading
          v-if="active.check"
          size="small"
          :text="$t('pages.setting.update.checkWait')"
          style="min-height: 30px;"
        />

        <div v-else class="wrapper top">
          <template v-if="updateInfo.errText">
            <div class="data-item">
              <p class="title-label mg-b">{{ $t('pages.setting.update.errorlog') }}</p>
              <div style="margin-bottom: var(--td-comp-margin-m);">{{ updateInfo.errText }}</div>
              <t-button block @click="handleReCheck">{{ $t('pages.setting.update.reCheck') }}</t-button>
            </div>
          </template>
          <template v-else>
            <template v-if="updateInfo.available">
              <div class="data-item">
                <p class="title-label mg-b">{{ $t('pages.setting.update.foundNewVersion') }}: {{ updateInfo.version }}</p>
              </div>
              <div class="data-item">
                <p class="title-label mg-b">{{ $t('pages.setting.update.changelog') }}</p>
                <div class="text-black content">
                  <div ref="textRef" class="leading-relaxed break-words">
                    <div class="markdown-body" v-html="updateInfo.releaseNotes"></div>
                  </div>
                </div>
              </div>
              <div class="optios">
                <div style="float: right">
                  <template v-if="platform === 'win32'">
                    <t-button
                      v-if="!active.downloaded"
                      variant="outline"
                      :loading="active.download"
                      :disabled="active.download"
                      @click="handleDownStart"
                    >
                      <span v-if="active.download">{{ $t('pages.setting.update.downloadProcess') }} {{ updateInfo.downProcess }}%</span>
                      <span v-else>{{ $t('pages.setting.update.download') }}</span>
                    </t-button>
                    <t-button
                      theme="primary"
                      :disabled="!active.downloaded"
                      @click="handleInstallAfterDown"
                    >
                      {{ $t('pages.setting.update.install')}}
                    </t-button>
                  </template>
                  <template v-else>
                    <t-button theme="primary" @click="handleOpenDownLink">
                      {{ $t('pages.setting.update.download')}}
                    </t-button>
                  </template>
                </div>
              </div>
            </template>
            <template v-else>
              <p>{{ $t('pages.setting.update.noUpdate') }}</p>
            </template>
          </template>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import '@/components/markdown-render/style/index.less';

import { ref, watch } from 'vue';

import { platform } from '@/utils/tool';

defineOptions({ name: 'SettingBaseDialogUpdate' });

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible']);

const formVisible = ref(false);
const updateInfo = ref({
  available: false,
  version: '',
  releaseNotes: '',
  errText: '',
  downProcess: 0,
});
const active = ref({
  check: true,
  download: false,
  downloaded: false,
});

watch(() => formVisible.value, (val) => emit('update:visible', val));
watch(() => props.visible, (val) => {
  formVisible.value = val;
  if (val) handleReCheck();
});

const resetConf = () => {
  updateInfo.value = {
    available: false,
    version: '',
    releaseNotes: '',
    errText: '',
    downProcess: 0,
  };

  active.value = {
    check: true,
    download: false,
    downloaded: false,
  };
};

const handleInstallAfterDown = () => {
  // Web应用中不支持自动安装更新，提示用户手动下载
  MessagePlugin.info('请手动下载最新版本');
  handleOpenDownLink();
};

const handleOpenDownLink = () => {
  // Web应用中使用window.open打开链接
  window.open('https://github.com/Hiram-Wong/ZyPlayer/releases/latest', '_blank');
};

const handleDownStart = () => {
  onIpcDown();
};

const handleReCheck = () => {
  resetConf();
  setupUpdateListeners();
  // Web应用中不支持自动检查更新，提示用户手动检查
  MessagePlugin.info('请访问GitHub页面检查更新');
  handleOpenDownLink();
};

const setupUpdateListeners = () => {
  offIpcListeners();
  // Web应用中不支持IPC更新检查，移除监听器
};

const onIpcDown = () => {
  // Web应用中不支持IPC下载更新
  MessagePlugin.info('请手动下载更新');
  handleOpenDownLink();
};

const offIpcListeners = () => {
  // Web应用中不需要移除IPC监听器
};
</script>

<style lang="less" scoped>
.data-item {
  .title-label {
    font-weight: 500;
  }
}

.content {
  height: 300px;
  overflow-x: hidden;
  overflow-y: scroll;

  :deep(blockquote p) {
    padding: 0 var(--td-comp-paddingLR-s);
  }

  :deep(a) {
    pointer-events: none;
  }
}
</style>
