import dayjs from 'dayjs';
import size from 'lodash-es/size';
import findIndex from 'lodash-es/findIndex';
import reject from 'lodash-es/reject';
import { MessagePlugin } from 'tdesign-vue-next';
import PQueue from 'p-queue';
import { delStar, fetchStarPage } from '@/api/star';
import { fetchCmsDetail, fetchCmsInit } from '@/api/site';
import { putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';
import { fetchIptvActive, fetchChannelDetail } from '@/api/iptv';
import { fetchAnalyzeHelper } from '@/utils/common/film';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { base64 } from '@/utils/crypto';
import { t } from '@/locales';

// 获取收藏列表
const getBingeList = async (pagination: any, bingeConfig: any) => {
  let length = 0;
  const { pageIndex, pageSize } = pagination.value;
  try {
    const res = await fetchStarPage({ page: pageIndex, pageSize, type: ['film', 'iptv', 'drive', 'analyze'] });
    if (res?.list && Array.isArray(res?.list) && res?.list?.length > 0) {
      bingeConfig.value.data = bingeConfig.value.data.concat(res.list);
      pagination.value.count = res.total;
      pagination.value.pageIndex++;
      length = res.list.length;
    }
    return length;
  } catch (err) {
    console.error(err);
    length = 0;
  } finally {
    console.log(`[binge] load data length: ${length}`);
    return length;
  }
};

// 处理电影播放
const handleFilmPlay = async (item: any, storePlayer: any, detailFormData: any, isVisible: any) => {
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
const handleIptvPlay = async (item: any, storePlayer: any) => {
  const { videoName, videoId, videoImage, relateSite } = item;
  const infoData = await fetchChannelDetail(videoId);
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: infoData.url });
    // 记录播放记录
    const historyRes = await fetchHistoryData(relateSite.key, videoId, ['iptv']);
    const doc = {
      date: dayjs().unix(),
      type: 'iptv',
      relateId: relateSite.key,
      siteSource: infoData.group,
      playEnd: false,
      videoId: videoId,
      videoImage: videoImage,
      videoName: videoName,
      videoIndex: `${videoName}${infoData.url}`,
      watchTime: 0,
      duration: 0,
      skipTimeInStart: 0,
      skipTimeInEnd: 0,
    };

    if (historyRes.code === 0 && historyRes.status) {
      await putHistoryData('put', doc, historyRes.data.id);
    } else {
      await putHistoryData('add', doc, null);
    }
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
const handleDrivePlay = async (item: any, storePlayer: any) => {
  const { videoName, videoImage, videoId, videoType, relateSite } = item;
  await putAlistInit({ sourceId: relateSite.id });
  const infoData = await fetchAlistFile({ path: base64.decode(videoId), sourceId: relateSite.id });
  const dirData = await fetchAlistDir({ path: videoType, sourceId: relateSite.id });
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: infoData.url });
    // 记录播放记录
    const historyRes = await fetchHistoryData(relateSite.key, videoId, ['drive']);
    const doc = {
      date: dayjs().unix(),
      type: 'drive',
      relateId: relateSite.key,
      siteSource: videoType,
      playEnd: false,
      videoId: videoId,
      videoImage: videoImage,
      videoName: videoName,
      videoIndex: `${videoName}${infoData.url}`,
      watchTime: 0,
      duration: 0,
      skipTimeInStart: 0,
      skipTimeInEnd: 0,
    };

    if (historyRes.code === 0 && historyRes.status) {
      await putHistoryData('put', doc, historyRes.data.id);
    } else {
      await putHistoryData('add', doc, null);
    }
  } else {
    const doc = {
      info: {
        id: videoId,
        name: videoName,
        url: infoData.url,
        thumb: videoImage,
        remark: infoData.remark,
        path: videoType,
      },
      ext: { files: dirData?.list || [], site: relateSite },
    };
    storePlayer.updateConfig({ type: 'drive', status: true, data: doc });
    window.electron.ipcRenderer.send('open-win', { action: 'play' });
  }
};

// 处理解析播放
const handleAnalyzePlay = async (item: any, storePlayer: any) => {
  const { videoName, videoId, relateSite } = item;
  const playerMode = storePlayer.getSetting.playerMode;
  if (playerMode.type === 'custom') {
    const response = await fetchAnalyzeHelper(`${relateSite.url}${videoId}`, relateSite.type);
    if (!response.url) {
      MessagePlugin.error(t('pages.analyze.message.error'));
      return;
    }
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: response.url });
    const historyRes = await fetchHistoryData(relateSite.key, videoId, ['analyze']);
    const doc = {
      date: dayjs().unix(),
      type: 'analyze',
      relateId: relateSite.key,
      siteSource: '',
      playEnd: false,
      videoId: videoId,
      videoImage: '',
      videoName: videoName,
      videoIndex: `${videoName}${response.url}`,
      watchTime: 0,
      duration: 0,
      skipTimeInStart: 0,
      skipTimeInEnd: 0,
    };

    if (historyRes.code === 0 && historyRes.status) {
      await putHistoryData('put', doc, historyRes.data.id);
    } else {
      await putHistoryData('add', doc, null);
    }
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
const playEvent = async (item: any, storePlayer: any, detailFormData: any, isVisible: any) => {
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
    console.error(`[binge][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};

// 删除事件
const removeEvent = async (item: any, bingeConfig: any, pagination: any) => {
  const { id } = item;
  await delStar({ ids: [id] });
  bingeConfig.value.data = reject(bingeConfig.value.data, { id }) as any;
  pagination.value.count--;
};

// 更新视频备注
const updateVideoRemarks = (item: any, res: any, bingeConfig: any) => {
  const index = findIndex(bingeConfig.value.data, { ...item });
  const isUpdate = res.vod_remarks !== bingeConfig.value.data[index].videoRemarks;
  bingeConfig.value.data[index].videoUpdate = isUpdate;
  bingeConfig.value.data[index].videoRemarks = res.vod_remarks;
};

// 检查更新事件
const checkUpdaterEvent = async (bingeConfig: any) => {
  if (!size(bingeConfig.value.data)) {
    MessagePlugin.info(t('pages.chase.binge.message.noCheckData'));
    return;
  }

  try {
    MessagePlugin.info(t('pages.setting.message.checking'));
    const queue = new PQueue({ concurrency: 5 }); // 设置并发限制为5
    const fetchAndUpdateVideoRemarks = async (item: any) => {
      if (!item.siteName) return;
      // const { site, videoId } = item;
      // try {
      //   if (site.type === 7) await t3RuleInit(site);
      //   else if (site.type === 8) await catvodRuleInit(site);
      //   else if (site.type === 9) await xbpqInit(site);
      //   const [res] = await fetchDetail(site, videoId);
      //   if (res.vod_remarks) {
      //     updateVideoRemarks(item, res);
      //   }
      // } catch (err) {
      //   console.error(err);
      // }
    };
    await Promise.all(
      bingeConfig.value.data.map((item: any) => {
        queue.add(() => fetchAndUpdateVideoRemarks(item));
      }),
    );
    MessagePlugin.success(t('pages.setting.form.success'));
  } catch (err) {
    console.log('[chase][binge][checkUpdaterEvent][error]', err);
    MessagePlugin.error(t('pages.setting.form.fail'));
  }
};

// 清除事件
const clearEvent = async (defaultSet: Function) => {
  // 这里应该通过emit触发确认对话框
  // 确认后调用:
  // await delStar({});
  // defaultSet();
};

// 默认设置
const defaultSet = (bingeConfig: any, infiniteId: any, pagination: any) => {
  bingeConfig.value.data = [];
  if (!size(bingeConfig.value.data)) infiniteId.value++;
  pagination.value.pageIndex = 1;
};

// 刷新收藏
const refreshBinge = (defaultSet: Function) => {
  console.log('[binge][bus][refresh]');
  defaultSet();
};

export {
  getBingeList,
  handleFilmPlay,
  handleIptvPlay,
  handleDrivePlay,
  handleAnalyzePlay,
  playEvent,
  removeEvent,
  updateVideoRemarks,
  checkUpdaterEvent,
  clearEvent,
  defaultSet,
  refreshBinge,
};
