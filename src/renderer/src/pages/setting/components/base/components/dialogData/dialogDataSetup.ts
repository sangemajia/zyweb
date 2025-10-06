import { ref, watch, reactive } from 'vue';
import { cloneDeep } from 'lodash-es';
import {
  getHistory,
  clearHistory,
  addHistoryItem,
  importData,
  uploadFileEvent,
  exportData,
  getCacheSize,
  delCache,
  getThumbnailSize,
  delThumbnail,
  clearData,
  rsyncRemoteEvent,
  rsyncLocalEvent,
  refreshEmitter,
} from './utils/dialogDataUtils';
import { clearDb } from '@/api/setting';

export const useDialogDataSetup = (props: any, emits: any) => {
  const formVisible = ref(false);
  const formData = ref({
    webdev: {
      sync: false,
      data: { url: '', username: '', password: '' },
    },
    easyConfig: { type: 'tvbox', url: '' },
    completeConfig: { type: 'remote', url: '' },
    clearSeletct: {
      sites: false,
      iptv: false,
      analyze: false,
      drive: false,
      history: false,
      star: false,
      setting: false,
      cache: false,
      thumbnail: false,
    },
    size: { cache: 0, thumbnail: 0 },
  });
  const active = reactive({
    clear: {
      site: false,
      iptv: false,
      channel: false,
      analyze: false,
      drive: false,
      history: false,
      star: false,
      setting: false,
      cache: false,
      thumbnail: false,
    },
    export: {
      site: false,
      iptv: false,
      channel: false,
      analyze: false,
      drive: false,
      history: false,
      star: false,
      setting: false,
    },
  });
  const historyList = ref<any>({
    easyConfig: [],
    completeConfig: [],
  });

  watch(
    () => formVisible.value,
    (val) => {
      emits('update:visible', val);
    },
  );

  watch(
    () => props.visible,
    (val) => {
      formVisible.value = val;
      if (val) {
        Promise.all([getHistory('easyConfig'), getHistory('completeConfig')]);
        Promise.all([getCacheSize(), getThumbnailSize()]);
      }
    },
  );

  watch(
    () => props.data,
    (val) => {
      formData.value.webdev.sync = val.data.sync;
      formData.value.webdev.data = cloneDeep(val.data.data);
    },
    { deep: true },
  );

  // 填充数据
  const handleHistoryFill = async (type: string, id: string) => {
    const item = historyList.value[type].find((item) => item.id === id);
    if (!item) return;
    formData.value[type].url = item.videoId;
    formData.value[type].type = item.relateId;
  };

  // 配置导入
  const handleImportData = async (importType: string, importMode: string) => {
    await importData(
      importType,
      importMode,
      formData.value,
      addHistoryItem,
      getHistory,
      historyList.value,
      refreshEmitter,
    );
  };

  // 文件事件
  const handleUploadFileEvent = async () => {
    const res = await uploadFileEvent();
    if (!res || res.canceled || !res.filePaths.length) return;
    formData.value.completeConfig.url = res.filePaths[0] || '';
  };

  // 导出
  const handleExportData = async () => {
    await exportData(active);
  };

  // 清理缓存
  const handleClearData = async () => {
    await clearData(active, clearDb, getHistory, getCacheSize, getThumbnailSize, delCache, delThumbnail);
  };

  // 保存
  const saveWebdev = () => {
    emits('submit', {
      data: JSON.parse(JSON.stringify(formData.value.webdev)),
      type: 'webdev',
    });
  };

  // 覆盖远端
  const handleRsyncRemoteEvent = async () => {
    await rsyncRemoteEvent(formData.value);
  };

  // 覆盖本地
  const handleRsyncLocalEvent = async () => {
    await rsyncLocalEvent(formData.value, refreshEmitter);
  };

  return {
    formVisible,
    formData,
    active,
    historyList,
    handleHistoryFill,
    handleImportData,
    handleUploadFileEvent,
    handleExportData,
    handleClearData,
    saveWebdev,
    handleRsyncRemoteEvent,
    handleRsyncLocalEvent,
  };
};
