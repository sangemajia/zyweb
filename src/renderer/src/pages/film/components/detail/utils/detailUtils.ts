import moment from 'moment';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import {
  VIP_LIST,
  playHelper,
  reverseOrderHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
} from '@/utils/common/film';
import { fetchAnalyzeActive } from '@/api/analyze';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { renderErrorWithHeight, renderLoadingWithHeight } from '@/utils/common/renderUtils';

// 调用本地播放器 + 历史
const callPlay = async (item: any, analyzeData: any, active: any, extConf: any) => {
  let { url } = formatIndex(item);
  url = decodeURIComponent(url);
  const analyzeInfo = analyzeData.list.find((item: any) => item.id === active.analyzeId);
  let analyzeType = analyzeInfo?.type !== undefined ? analyzeInfo?.type : -1;
  if (active.official) {
    if (!analyzeInfo || typeof analyzeInfo !== 'object' || Object.keys(analyzeInfo).length === 0) {
      MessagePlugin.warning(t('pages.film.message.notSelectAnalyze'));
      return;
    }
    url = `${analyzeInfo.url}${url}`;
    analyzeType = analyzeInfo.type;
  } else {
    analyzeType = -1;
  }
  const response = await playHelper(url, extConf.site, active.flimSource, analyzeType, false);
  return response;
};

// 切换线路
const switchLineEvent = (key: string, analyzeData: any, active: any) => {
  active.flimSource = key;
  if (analyzeData.flag.includes(key)) active.official = true;
  else active.official = false;
};

// 切换解析接口
const switchAnalyzeEvent = async (key: string, active: any, callPlay: Function, analyzeData: any, extConf: any) => {
  active.analyzeId = key;
  if (active.filmIndex) {
    const response = await callPlay(active.filmIndex, analyzeData, active, extConf);
    if (response?.url) {
      const { playerMode } = extConf.setting;
      window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: response.url });
      return true;
    }
  }
  return false;
};

// 切换选集
const switchSeasonEvent = async (
  item: any,
  active: any,
  callPlay: Function,
  analyzeData: any,
  extConf: any,
  putHistory: Function,
) => {
  active.filmIndex = item;
  const response = await callPlay(item, analyzeData, active, extConf);
  if (response?.url) {
    const { playerMode } = extConf.setting;
    window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: response.url });
    await putHistory();
  }
};

// 获取收藏
const fetchBinge = async (extConf: any, infoConf: any) => {
  const { key } = extConf.site;
  const { vod_id } = infoConf;

  const response = await fetchBingeData(key, vod_id, ['film']);
  return response;
};

// 更新收藏
const putBinge = async (bingeData: any, active: any, extConf: any, infoConf: any) => {
  const { id = null } = bingeData;
  const { key } = extConf.site;
  const { vod_id, vod_pic, vod_name, type_name, vod_remarks } = infoConf;
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: key,
    videoId: vod_id,
    videoImage: vod_pic,
    videoName: vod_name,
    videoType: type_name,
    videoRemarks: vod_remarks,
  };

  let response: any;
  if (id) response = await putBingeData('del', {}, id);
  else response = await putBingeData('add', doc, null);

  return response;
};

// 剧集顺序
const reverseOrderEvent = (active: any, infoConf: any, seasonData: any) => {
  active.reverseOrder = !active.reverseOrder;
  if (active.reverseOrder) {
    seasonData.value = reverseOrderHelper('positive', infoConf.fullList);
  } else {
    seasonData.value = reverseOrderHelper('negative', seasonData.value);
  }
};

// 获取历史
const fetchHistory = async (extConf: any, infoConf: any) => {
  const { key } = extConf.site;
  const { vod_id } = infoConf;

  const response = await fetchHistoryData(key, vod_id, ['film']);
  return response;
};

// 更新历史
const putHistory = async (historyData: any, active: any, extConf: any, infoConf: any) => {
  const { id = null } = historyData;
  const { key } = extConf.site;
  const { vod_id, vod_pic, vod_name } = infoConf;
  const { flimSource, filmIndex } = active;
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: key,
    siteSource: flimSource,
    playEnd: false,
    videoId: vod_id,
    videoImage: vod_pic,
    videoName: vod_name,
    videoIndex: filmIndex,
    watchTime: 0,
    duration: 0,
    skipTimeInStart: 30,
    skipTimeInEnd: 30,
  };

  let response: any;
  if (id) response = await putHistoryData('put', doc, id);
  else response = await putHistoryData('add', doc, null);

  return response;
};

// 获取播放源及剧集
const setup = async (
  infoConf: any,
  active: any,
  seasonData: any,
  analyzeData: any,
  extConf: any,
  bingeData: any,
  historyData: any,
) => {
  // 1. 格式化剧集数据
  const formattedSeason: any = await formatSeason(infoConf.value);
  if (Object.keys(formattedSeason)?.[0] === 'error') {
    MessagePlugin.warning(t('pages.film.message.formatSeasonError'));
    return false;
  }
  infoConf.value.fullList = formattedSeason;

  // 2. 设置默认选集
  active.value.flimSource = active.value.flimSource || Object.keys(formattedSeason)[0];
  active.value.filmIndex = active.value.filmIndex || formattedSeason[active.value.flimSource][0];

  // 3. 选集排序
  if (active.value.reverseOrder) seasonData.value = formattedSeason;
  else seasonData.value = reverseOrderHelper('negative', formattedSeason);

  // 4. 获取播放记录
  const historyRes = await fetchHistory(extConf.value, infoConf.value);
  const { code, data, status } = historyRes;

  if (code === 0 && status) {
    if (data.siteSource) active.value.flimSource = data.siteSource;
    if (data.videoIndex) active.value.filmIndex = data.videoIndex;
    if (!data.siteSource) data.siteSource = active.value.flimSource;
    if (!data.videoIndex) data.videoIndex = active.value.filmIndex;
    historyData.value = data;
  }

  // 5. 获取解析规则 + 是否显示解析
  const analyzeRes = await fetchAnalyzeActive();
  if (analyzeRes.hasOwnProperty('data')) analyzeData.value.list = analyzeRes['data'];
  if (analyzeRes.hasOwnProperty('default')) active.value.analyzeId = analyzeRes['default']['id'];
  if (analyzeRes.hasOwnProperty('flag')) {
    analyzeData.value.flag = analyzeRes['flag'];
    let vipUrl = formatIndex(active.value.filmIndex)?.url;
    vipUrl = decodeURIComponent(vipUrl);
    const vipUrlHostname = /^(https?:\/\/)/.test(vipUrl) ? new URL(vipUrl)?.hostname : '';
    if (analyzeRes.flag.includes(active.value.flimSource) || VIP_LIST.includes(vipUrlHostname))
      active.value.official = true;
  }

  // 6. 获取收藏(不影响)
  const bingeRes = await fetchBinge(extConf.value, infoConf.value);
  const bingeResponse = bingeRes as { code: number; data: any; status: boolean };
  if (bingeResponse.code === 0) {
    bingeData.value = bingeResponse.data;
    active.value.binge = bingeResponse.status;
  }

  return true;
};

export {
  renderError,
  renderLoading,
  callPlay,
  switchLineEvent,
  switchAnalyzeEvent,
  switchSeasonEvent,
  fetchBinge,
  putBinge,
  reverseOrderEvent,
  fetchHistory,
  putHistory,
  setup,
  formatName,
  formatReverseOrder,
  formatContent,
};
