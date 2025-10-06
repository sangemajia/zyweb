import { MessagePlugin } from 'tdesign-vue-next';
import moment from 'moment';
import { cloneDeep } from 'lodash-es';
import { t } from '@/locales';
import { clearDb, exportDb, webdevLocal2Remote, webdevRemote2Local, initDb } from '@/api/setting';
import { fetchHistoryPage, delHistory, addHistory } from '@/api/history';
import emitter from '@/utils/emitter';

// 刷新事件发射器
const refreshEmitter = (arryList: string[]) => {
  const actions = {
    site: () => {
      emitter.emit('refreshFilmConfig');
      emitter.emit('refreshSiteTable');
    },
    iptv: () => {
      emitter.emit('refreshIptvConfig');
      emitter.emit('refreshIptvTable');
    },
    channel: () => {
      emitter.emit('refreshIptvConfig');
    },
    analyze: () => {
      emitter.emit('refreshAnalyzeConfig');
      emitter.emit('refreshAnalyzeTable');
    },
    drive: () => {
      emitter.emit('refreshDriveConfig');
      emitter.emit('refreshDriveTable');
    },
    history: () => {
      emitter.emit('refreshHistory');
    },
    star: () => {
      emitter.emit('refreshBinge');
    },
    setting: () => {
      emitter.emit('refreshSetting');
    },
  };

  for (const action of arryList) {
    const key = action.indexOf('tbl_') > -1 ? action.split('tbl_')[1] : action;
    if (actions[key]) {
      actions[key]();
    }
  }
};

// 获取历史
const getHistory = async (type: string) => {
  try {
    const res = await fetchHistoryPage({ page: 1, pageSize: 5, type: [type] });
    return res;
  } catch (err: any) {
    console.error('Failed to fetch history:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err.message}`);
    throw err;
  }
};

// 清除数据
const clearHistory = async (type: string) => {
  try {
    await delHistory({ type });
  } catch (err: any) {
    console.error('Failed to clear history:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err.message}`);
    throw err;
  }
};

// 增加历史记录
const addHistoryItem = async (type: string, data: { [key: string]: string }, historyList: any) => {
  try {
    const doc = {
      date: moment().unix(),
      relateId: data.relateId,
      videoName: data.videoName,
      videoId: data.videoId,
      type,
    };

    const isExist = historyList[type].some((item) => item.videoId === doc.videoId);
    if (isExist) return;

    await addHistory(doc);
  } catch (err: any) {
    console.error('Failed to add history:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err.message}`);
    throw err;
  }
};

// 配置导入
const importData = async (
  importType: string,
  importMode: string,
  formData: any,
  addHistoryItem: Function,
  getHistory: Function,
  historyList: any,
  refreshEmitter: Function,
) => {
  try {
    let url, type, host;
    if (importType === 'easyConfig') {
      url = formData.easyConfig.url;
      type = formData.easyConfig.type;
    } else {
      url = formData.completeConfig.url;
      type = formData.completeConfig.type;
    }

    if (!url) {
      MessagePlugin.warning(t('pages.setting.data.noData'));
      return;
    }

    try {
      host = new URL(url).host;
    } catch {
      host = url;
    }

    const res = await initDb({ url, importType, remoteType: type, importMode });
    await addHistoryItem(importType, { relateId: type, videoName: host, videoId: url }, historyList);
    await getHistory(importType);
    refreshEmitter(res?.table);
    MessagePlugin.success(t('pages.setting.data.success'));
    return res;
  } catch (err) {
    console.error('Failed to init db:', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    throw err;
  }
};

// 文件事件
const uploadFileEvent = async () => {
  try {
    const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
      action: 'showOpenDialog',
      config: {
        properties: ['openFile', 'showHiddenFiles'],
        filters: [
          { name: 'Json Files', extensions: ['json'] },
          { name: 'Text Files', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      },
    });
    return res;
  } catch (err: any) {
    console.error(`[uploadFileEvent] err:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    throw err;
  }
};

// 导出
const exportData = async (active: any) => {
  if (!Object.values(active.export).some((value) => value)) {
    MessagePlugin.warning(t('pages.setting.data.noSelectData'));
    return;
  }

  const activeList = Object.keys(active.export).filter((key) => active.export[key]);
  const dbData = await exportDb(activeList);
  const str = JSON.stringify(dbData, null, 2);

  try {
    const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
      action: 'showSaveDialog',
      config: {
        defaultPath: `zyfun_config_${moment().format('YYYYMMDD_HHmmss')}.json`,
        properties: ['showHiddenFiles'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      },
    });

    if (!res || res.canceled || !res.filePath) return;

    const writeStatus = await window.electron.ipcRenderer.invoke('manage-file', {
      action: 'write',
      config: {
        path: res.filePath,
        content: str,
      },
    });

    if (writeStatus) MessagePlugin.success(t('pages.setting.data.success'));
    else MessagePlugin.error(t('pages.setting.data.fail'));
    return writeStatus;
  } catch (err: any) {
    console.error(`[exportData] err:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    throw err;
  }
};

// 获取 cache 大小
const getCacheSize = async (): Promise<number> => {
  const size = await window.electron.ipcRenderer.invoke('manage-session', { action: 'size' });
  return size;
};

// 删除 cache
const delCache = async (): Promise<void> => {
  await window.electron.ipcRenderer.invoke('manage-session', { action: 'clearCache' });
};

//  获取 thumbnail 文件夹大小
const getThumbnailSize = async (): Promise<number> => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, 'tmp/thumbnail');
  const size = await window.electron.ipcRenderer.invoke('manage-file', {
    action: 'size',
    config: { path: defaultPath },
  });
  return size;
};

// 删除 thumbnail 文件夹
const delThumbnail = async (): Promise<void> => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, 'tmp/thumbnail');
  await window.electron.ipcRenderer.invoke('manage-file', { action: 'rm', config: { path: defaultPath } });
};

// 清理缓存
const clearData = async (
  active: any,
  clearDb: Function,
  getHistory: Function,
  getCacheSize: Function,
  getThumbnailSize: Function,
  delCache: Function,
  delThumbnail: Function,
) => {
  if (!Object.values(active.clear).some((value) => value)) {
    MessagePlugin.warning(t('pages.setting.data.noSelectData'));
    return;
  }

  try {
    const activeList = Object.keys(active.clear).filter((key) => active.clear[key]);
    const activeToRemove = ['thumbnail'];
    const formatActive = activeList.filter((item) => !activeToRemove.includes(item));
    await clearDb(formatActive);

    const actions = {
      site: async () => {
        emitter.emit('refreshFilmConfig');
        emitter.emit('refreshSiteTable');
      },
      iptv: async () => {
        emitter.emit('refreshIptvConfig');
        emitter.emit('refreshIptvTable');
      },
      channel: async () => {
        emitter.emit('refreshIptvConfig');
      },
      analyze: async () => {
        emitter.emit('refreshAnalyzeConfig');
        emitter.emit('refreshAnalyzeTable');
      },
      drive: async () => {
        emitter.emit('refreshDriveConfig');
        emitter.emit('refreshDriveTable');
      },
      history: async () => {
        emitter.emit('refreshHistory');
        await getHistory('easyConfig');
        await getHistory('completeConfig');
      },
      star: () => {
        emitter.emit('refreshBinge');
      },
      cache: async () => {
        await delCache();
        return await getCacheSize();
      },
      thumbnail: async () => {
        await delThumbnail();
        const size = await getThumbnailSize();
        emitter.emit('refreshIptvConfig');
        return size;
      },
    };

    for (const action of activeList) {
      if (actions.hasOwnProperty(action)) {
        await actions[action]();
      }
    }

    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log('[setting][clearData] error', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    throw err;
  }
};

// 覆盖远端
const rsyncRemoteEvent = async (formData: any) => {
  const { url, username, password } = formData.webdev.data;
  if (!url || !username || !password) {
    MessagePlugin.warning(t('pages.setting.data.noData'));
    return false;
  }
  const res = await webdevLocal2Remote();
  if (res) {
    MessagePlugin.success(t('pages.setting.data.success'));
  } else {
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  return res;
};

// 覆盖本地
const rsyncLocalEvent = async (formData: any, refreshEmitter: Function) => {
  const { url, username, password } = formData.webdev.data;
  if (!url || !username || !password) {
    MessagePlugin.warning(t('pages.setting.data.noData'));
    return false;
  }
  const res = await webdevRemote2Local();
  if (res) {
    refreshEmitter(['site', 'iptv', 'channel', 'analyze', 'drive', 'history', 'star', 'setting']);
    MessagePlugin.success(t('pages.setting.data.success'));
  } else {
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  return res;
};

export {
  refreshEmitter,
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
};
