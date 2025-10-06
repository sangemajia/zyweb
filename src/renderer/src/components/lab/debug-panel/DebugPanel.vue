<template>
  <t-tabs v-model="activeTab" theme="card" lazy>
    <t-tab-panel :label="$t('pages.lab.jsEdit.debug.dom')" value="dom">
      <DomDebug
        :req-data="reqData"
        :pdfa-rule="pdfaRule"
        :pdfh-rule="pdfhRule"
        @source="handleSourceFetch"
        @pdfa-debug="handlePdfaDebug"
        @pdfh-debug="handlePdfhDebug"
      />
    </t-tab-panel>
    <t-tab-panel :label="$t('pages.lab.jsEdit.debug.data')" value="data">
      <DataDebug
        :is-auto-mode="isAutoMode"
        :category="category"
        :detail="detail"
        :search="search"
        :play="play"
        :proxy="proxy"
        @init-debug="handleInitDebug"
        @log-debug="handleLogDebug"
        @home-debug="handleHomeDebug"
        @home-vod-debug="handleHomeVodDebug"
        @category-debug="handleCategoryDebug"
        @detail-debug="handleDetailDebug"
        @search-debug="handleSearchDebug"
        @play-debug="handlePlayDebug"
        @proxy-debug="handleProxyDebug"
        @proxy-upload-debug="handleProxyUploadDebug"
        @toggle-auto-mode="toggleAutoMode"
      />
    </t-tab-panel>
    <t-tab-panel :label="$t('pages.lab.jsEdit.debug.preview')" value="preview">
      <PreviewPanel
        :webview-url="webviewUrl"
        :is-webview-visible="isWebviewVisible"
        @webview-control="handleWebviewControl"
        @webview-load="handleWebviewLoad"
      />
    </t-tab-panel>
  </t-tabs>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import DomDebug from './DomDebug.vue';
import DataDebug from './DataDebug.vue';
import PreviewPanel from './PreviewPanel.vue';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'dom',
  },
  reqData: {
    type: Object,
    default: () => ({}),
  },
  pdfaRule: {
    type: String,
    default: '',
  },
  pdfhRule: {
    type: String,
    default: '',
  },
  isAutoMode: {
    type: Boolean,
    default: false,
  },
  category: {
    type: Object,
    default: () => ({}),
  },
  detail: {
    type: Object,
    default: () => ({}),
  },
  search: {
    type: Object,
    default: () => ({}),
  },
  play: {
    type: Object,
    default: () => ({}),
  },
  proxy: {
    type: Object,
    default: () => ({}),
  },
  webviewUrl: {
    type: String,
    default: '',
  },
  isWebviewVisible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'update:activeTab',
  'source',
  'pdfa-debug',
  'pdfh-debug',
  'init-debug',
  'log-debug',
  'home-debug',
  'home-vod-debug',
  'category-debug',
  'detail-debug',
  'search-debug',
  'play-debug',
  'proxy-debug',
  'proxy-upload-debug',
  'toggle-auto-mode',
  'webview-control',
  'webview-load',
]);

const handleSourceFetch = (source: any) => {
  emit('source', source);
};

const handlePdfaDebug = () => {
  emit('pdfa-debug');
};

const handlePdfhDebug = () => {
  emit('pdfh-debug');
};

const handleInitDebug = () => {
  emit('init-debug');
};

const handleLogDebug = () => {
  emit('log-debug');
};

const handleHomeDebug = () => {
  emit('home-debug');
};

const handleHomeVodDebug = () => {
  emit('home-vod-debug');
};

const handleCategoryDebug = () => {
  emit('category-debug');
};

const handleDetailDebug = () => {
  emit('detail-debug');
};

const handleSearchDebug = () => {
  emit('search-debug');
};

const handlePlayDebug = () => {
  emit('play-debug');
};

const handleProxyDebug = () => {
  emit('proxy-debug');
};

const handleProxyUploadDebug = () => {
  emit('proxy-upload-debug');
};

const toggleAutoMode = () => {
  emit('toggle-auto-mode');
};

const handleWebviewControl = (action: string) => {
  emit('webview-control', action);
};

const handleWebviewLoad = () => {
  emit('webview-load');
};
</script>
