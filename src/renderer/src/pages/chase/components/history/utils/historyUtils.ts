import size from 'lodash-es/size';
import reject from 'lodash-es/reject';
import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';
import { delHistory, fetchHistoryPage } from '@/api/history';
import { fetchCmsDetail, fetchCmsInit } from '@/api/site';
import { putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';
import { fetchIptvActive, fetchChannelDetail } from '@/api/iptv';
import { fetchAnalyzeHelper } from '@/utils/common/film';
import { base64 } from '@/utils/crypto';
import { formatIndex } from '@/utils/common/film';
import { t } from '@/locales';

// 获取历史列表
export const getHistoryList = async (pagination: any, options: any) => {
  let length = 0;
  const { pageIndex, pageSize } = pagination.value;
  try {
    const res = await fetchHistoryPage({ page: pageIndex, pageSize, type: ['film', 'iptv', 'drive', 'analyze'] });

    if (res?.list && Array.isArray(res?.list) && res?.list?.length > 0) {
      for (const item of res.list) {
        const timeDiff = filterDate(item.date);
        let timeKey;
        if (timeDiff === 0) timeKey = 'today';
        else if (timeDiff < 7) timeKey = 'week';
        else timeKey = 'ago';
        options.value[timeKey].push(item);
      }
      pagination.value.count = res.total;
      pagination.value.pageIndex++;
      length = res.list.length || 0;
    }
    return length;
  } catch (err) {
    console.error(err);
    length = 0;
  } finally {
    console.log(`[history] load data length: ${length}`);
    return length;
  }
};

// 处理电影播放
export const handleFilmPlay = async (item: any, storePlayer: any, detailFormData: any, isVisible: any) => {
  const { videoName, videoImage, videoId, relateSite } = item;
  await fetchCmsInit({ sourceId: relateSite.id });
  const response = await fetchCmsDetail({ sourceId: relateSite.id, id: videoId });
  const info = response?.list[0];
  if (!info?.vod_name) info.vod_name = videoName;
  if (!info?.vod_pic) info.vod_pic = videoImage;
  if (!info?.vod_id) info.vod_id = videoId;
  const doc = {
    info: { ...info },
    ext: { site: relateSite, setting: storePlayer.setting },
  };
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    detailFormData.value = doc;
    isVisible.detail = true;
  } else {
    storePlayer.updateConfig({ type: 'film', status: true, data: doc });
    window.electron.ipcRenderer.send('open-win', { action: 'play' });
  }
};

// 处理IPTV播放
export const handleIptvPlay = async (item: any, storePlayer: any) => {
  const { videoName, videoId, videoImage, relateSite } = item;
  const infoData = await fetchChannelDetail(videoId);
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: infoData.url });
  } else {
    const response = await fetchIptvActive();
    const { epg, markIp, logo } = response['ext'];
    const doc = {
      info: { id: videoId, logo: videoImage, name: videoName, url: infoData.url, group: infoData.group },
      ext: { epg, markIp, logo, site: relateSite, setting: storePlayer.setting },
    };
    storePlayer.updateConfig({ type: 'iptv', status: true, data: doc });
    window.electron.ipcRenderer.send('open-win', { action: 'play' });
  }
};

// 处理网盘播放
export const handleDrivePlay = async (item: any, storePlayer: any) => {
  const { videoName, videoImage, videoId, siteSource, relateSite } = item;
  await putAlistInit({ sourceId: relateSite.id });
  const infoData = await fetchAlistFile({ path: base64.decode(videoId), sourceId: relateSite.id });
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: infoData.url });
  } else {
    const dirData = await fetchAlistDir({ path: siteSource, sourceId: relateSite.id });
    const doc = {
      info: {
        id: videoId,
        name: videoName,
        url: infoData.url,
        thumb: videoImage,
        remark: infoData.remark,
        path: siteSource,
      },
      ext: { files: dirData?.list || [], site: relateSite },
    };
    storePlayer.updateConfig({ type: 'drive', status: true, data: doc });
    window.electron.ipcRenderer.send('open-win', { action: 'play' });
  }
};

// 处理解析播放
export const handleAnalyzePlay = async (item: any, storePlayer: any) => {
  const { relateSite, videoName, videoId } = item;
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    const response = await fetchAnalyzeHelper(`${relateSite.url}${videoId}`, relateSite.type);
    if (!response.url) {
      MessagePlugin.error(t('pages.analyze.message.error'));
      return;
    }
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: response.url });
  } else {
    const doc = {
      info: { name: videoName, url: videoId },
      ext: { site: relateSite, setting: storePlayer.setting },
    };
    storePlayer.updateConfig({ type: 'analyze', status: true, data: doc });
    window.electron.ipcRenderer.send('open-win', { action: 'play' });
  }
};

// 播放事件
export const playEvent = async (item: any, storePlayer: any, detailFormData: any, isVisible: any) => {
  isVisible.loading = true;

  try {
    const { type } = item;
    const methodMap = {
      film: handleFilmPlay,
      iptv: handleIptvPlay,
      drive: handleDrivePlay,
      analyze: handleAnalyzePlay,
    };
    await methodMap[type](item, storePlayer, detailFormData, isVisible);
  } catch (err) {
    console.error(`[history][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

// 删除事件
export const removeEvent = async (item: any, options: any, pagination: any) => {
  const { id } = item;
  const timeDiff = filterDate(item.date);
  let timeKey;
  await delHistory({ ids: [id] });
  if (timeDiff === 0) timeKey = 'today';
  else if (timeDiff < 7) timeKey = 'week';
  else timeKey = 'ago';
  options.value[timeKey] = reject(options.value[timeKey], { id });
  pagination.value.count--;
};

// 清除事件
export const clearEvent = async (defaultSet: Function) => {
  // 这里应该通过emit触发确认对话框
  // 确认后调用:
  // await delHistory({type: 'film'});
  // defaultSet();
};

// 日期计算
export const filterDate = (date: number) => {
  const timeToday = dayjs().format('YYYY-MM-DD');
  const timeSource = dayjs.unix(date).format('YYYY-MM-DD'); // Parse Unix timestamp
  const timeDiff = dayjs(timeToday).diff(timeSource, 'days');
  return timeDiff;
};

// 播放进度
export const formatProgress = (start: number, all: number) => {
  const progress = Math.trunc((start / all) * 100);
  if (progress === Infinity) return '100%';
  if (progress === 0) return '0%';
  return progress;
};

// 默认设置
export const defaultSet = (options: any, infiniteId: any, pagination: any) => {
  options.value = {
    today: [],
    week: [],
    ago: [],
  };
  if (!size(options.value)) infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 刷新历史
export const refreshHistory = (defaultSet: Function) => {
  console.log('[history][bus][refresh]');
  defaultSet();
};

export { formatIndex };
