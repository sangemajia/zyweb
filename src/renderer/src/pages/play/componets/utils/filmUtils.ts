import { MessagePlugin } from 'tdesign-vue-next';
import moment from 'moment';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import {
  VIP_LIST,
  fetchBarrageData,
  playHelper,
  reverseOrderHelper,
  fetchRecommSearchHelper,
  formatName,
  formatIndex,
  formatContent,
  formatSeason,
  formatReverseOrder,
} from '@/utils/common/film';
import { fetchRecommPage } from '@/api/site';
import { fetchAnalyzeActive } from '@/api/analyze';
import { t } from '@/locales';

// 获取收藏
export const fetchBinge = async (extConf: any, infoConf: any, bingeData: any, setActive: (active: any) => void) => {
  const { key } = extConf.site;
  const { vod_id } = infoConf;

  const response = await fetchBingeData(key, vod_id, ['film']);
  const { code } = response;

  if (code === 0) {
    bingeData.value = response.data;
    setActive((prev: any) => ({ ...prev, binge: response.status }));
  }
};

// 更新收藏
export const putBinge = async (bingeData: any, extConf: any, infoConf: any, setActive: (active: any) => void) => {
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
  const { code, data, status } = response;

  if (code === 0) {
    bingeData.value = data;
    setActive((prev: any) => ({ ...prev, binge: status }));
  }
};

// 获取历史
export const fetchHistory = async (
  extConf: any,
  infoConf: any,
  historyData: any,
  active: any,
  videoData: any,
  setActive: (active: any) => void,
) => {
  const { key } = extConf.site;
  const { vod_id } = infoConf;

  const response = await fetchHistoryData(key, vod_id, ['film']);
  const { code, data, status } = response;

  if (code === 0 && status) {
    setActive((prev: any) => ({
      ...prev,
      flimSource: data.siteSource || prev.flimSource,
      filmIndex: data.videoIndex || prev.filmIndex,
    }));

    historyData.value = {
      ...data,
      siteSource: data.siteSource || active.flimSource,
      videoIndex: data.videoIndex || active.filmIndex,
    };

    videoData.value.skipTimeInStart = data.skipTimeInStart;
    videoData.value.skipTimeInEnd = data.skipTimeInEnd;
  }
};

// 更新历史
export const putHistory = async (
  historyData: any,
  extConf: any,
  infoConf: any,
  videoData: any,
  active: any,
  setHistoryData: (data: any) => void,
) => {
  const { id = null } = historyData;
  const { key } = extConf.site;
  const { vod_id, vod_pic, vod_name } = infoConf;
  const { watchTime, duration, playEnd, skipTimeInStart, skipTimeInEnd } = videoData;
  const { flimSource, filmIndex } = active;
  const doc = {
    date: moment().unix(),
    type: 'film',
    relateId: key,
    siteSource: flimSource,
    playEnd: playEnd,
    videoId: vod_id,
    videoImage: vod_pic,
    videoName: vod_name,
    videoIndex: filmIndex,
    watchTime: watchTime,
    duration: duration,
    skipTimeInStart: skipTimeInStart,
    skipTimeInEnd: skipTimeInEnd,
  };

  let response: any;
  if (id) response = await putHistoryData('put', doc, id);
  else response = await putHistoryData('add', doc, null);
  const { code, data, status } = response;

  if (code === 0 && status) {
    setHistoryData(data);
  }
};

// 分享 dialog 数据
export const shareEvent = (
  infoConf: any,
  active: any,
  videoData: any,
  setShareFormData: (data: any) => void,
  setActive: (active: any) => void,
) => {
  const name = `${infoConf['vod_name']} ${formatIndex(active.filmIndex).index}`;
  setShareFormData((prev: any) => ({ ...prev, name, url: videoData.url }));
  setActive((prev: any) => ({ ...prev, share: true }));
};

// 下载 dialog 数据
export const downloadEvent = (
  seasonData: any,
  videoData: any,
  setDownloadFormData: (data: any) => void,
  setActive: (active: any) => void,
) => {
  setDownloadFormData({
    season: seasonData,
    current: videoData.url,
  });
  setActive((prev: any) => ({ ...prev, download: true }));
};

// 设置事件
export const settingEvent = (
  extConf: any,
  videoData: any,
  setSettingFormData: (data: any) => void,
  setActive: (active: any) => void,
) => {
  const playConf = extConf.setting.playConf;
  setSettingFormData({
    skipHeadAndEnd: playConf.skipHeadAndEnd,
    playNextPreload: playConf.playNextPreload,
    playNextEnabled: playConf.playNextEnabled,
    skipAd: playConf.skipAd,
    skipTimeInStart: videoData.skipTimeInStart,
    skipTimeInEnd: videoData.skipTimeInEnd,
  });
  setActive((prev: any) => ({ ...prev, setting: true }));
};

// 默认临时配置
export const defaultEmpConf = (setTmp: (tmp: any) => void) => {
  setTmp({
    preloadNext: {
      id: '',
      url: '',
      quality: [],
      headers: {},
      load: false,
      init: false,
      barrage: { barrage: [], id: null },
      mediaType: '',
    },
    end: false,
  });
};

// 调用播放器
export const callPlay = async (
  item: string,
  active: any,
  analyzeData: any,
  tmp: any,
  extConf: any,
  infoConf: any,
  videoData: any,
  setVideoData: (data: any) => void,
  setActive: (active: any) => void,
  defaultEmpConf: () => void,
  emits: any,
) => {
  try {
    let { url } = formatIndex(item);
    url = decodeURIComponent(url);
    const originUrl = url;
    setActive((prev: any) => ({ ...prev, filmIndex: item }));
    const analyzeInfo = analyzeData.list.find((i: any) => i.id === active.analyzeId);
    let response;
    if (tmp.preloadNext.init && tmp.preloadNext.load && tmp.preloadNext.id === item) {
      response = {
        url: tmp.preloadNext.url,
        quality: tmp.preloadNext.quality,
        headers: tmp.preloadNext.headers,
        mediaType: tmp.preloadNext.mediaType,
      };
    } else {
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
      response = await playHelper(url, extConf.site, active.flimSource, analyzeType, extConf.setting.playConf.skipAd);
    }

    if (!response?.url || !/^(https?:\/\/)/.test(response.url)) {
      MessagePlugin.warning(t('pages.player.message.noPlayUrl'));
      return;
    } else {
      setVideoData((prev: any) => ({ ...prev, url: response.url }));
      emits('update', {
        type: 'film',
        data: Object.assign({
          info: { ...infoConf, name: `${infoConf.vod_name} ${formatIndex(active.filmIndex).index}` },
          ext: extConf,
        }),
      });
      emits('play', {
        url: response.url,
        next: !handleSeasonActive()?.isLast,
        quality: response.quality,
        type: response.mediaType! || '',
        headers: response.headers,
        startTime: videoData.skipTime,
      });
    }

    let barrageRes: { barrage: string[]; id: string | number | null } = { barrage: [], id: null };
    if (tmp.preloadNext.init && tmp.preloadNext.load && tmp.preloadNext.id === item) {
      if (tmp.preloadNext.barrage.barrage.length > 0 && tmp.preloadNext.barrage.id)
        barrageRes = tmp.preloadNext.barrage;
    } else {
      barrageRes = await fetchBarrageData(originUrl, extConf.setting.barrage, active);
    }
    if (Array.isArray(barrageRes.barrage) && barrageRes.barrage.length > 0 && barrageRes.id) {
      emits('barrage', { comments: barrageRes.barrage, url: extConf.setting.barrage.url, id: barrageRes.id });
    }
  } finally {
    // 临时数据恢复默认
    defaultEmpConf();
  }
};

// 切换线路
export const switchLineEvent = (key: string, analyzeData: any, setActive: (active: any) => void) => {
  setActive((prev: any) => ({
    ...prev,
    flimSource: key,
    official: analyzeData.flag.includes(key),
  }));
};

// 切换解析接口
export const switchAnalyzeEvent = async (
  key: string,
  setActive: (active: any) => void,
  active: any,
  callPlay: (item: string) => Promise<void>,
) => {
  setActive((prev: any) => ({ ...prev, analyzeId: key }));
  if (active.filmIndex) await callPlay(active.filmIndex);
};

// 切换选集
export const switchSeasonEvent = async (
  item: string,
  active: any,
  historyData: any,
  extConf: any,
  videoData: any,
  setVideoData: (data: any) => void,
  callPlay: (item: string) => Promise<void>,
) => {
  setActive((prev: any) => ({ ...prev, filmIndex: item }));

  // 当前源dataHistory.value.siteSource 选择源active.flimSource；当前集dataHistory.value.videoIndex 选择源index
  // 1. 同源 不同集 变   return true
  // 2. 同源 同集 不变   return true
  // 3. 不同源 不同集 变 return true
  // 4. 不同源 同集 不变 return true
  // 待优化 不同源的index不同，要重新索引  但是 综艺不对应
  if (historyData['siteSource'] === active.flimSource) {
    // 同源
    if (formatIndex(historyData['videoIndex']).index !== formatIndex(active.filmIndex).index) {
      setVideoData((prev: any) => ({ ...prev, watchTime: 0, playEnd: false }));
    }
  } else if (formatIndex(historyData['videoIndex']).index !== formatIndex(active.filmIndex).index) {
    // 不同源
    setVideoData((prev: any) => ({ ...prev, watchTime: 0, playEnd: false }));
  }

  setVideoData((prev: any) => ({
    ...prev,
    skipTime: prev.watchTime,
  }));

  if (extConf.setting.playConf.skipHeadAndEnd) {
    setVideoData((prev: any) => ({
      ...prev,
      skipTime: prev.skipTime < prev.skipTimeInStart ? prev.skipTimeInStart : prev.skipTime,
    }));
  }

  await callPlay(active.filmIndex);
};

// 剧集顺序
export const reverseOrderEvent = (
  active: any,
  infoConf: any,
  seasonData: any,
  setSeasonData: (data: any) => void,
  setActive: (active: any) => void,
) => {
  setActive((prev: any) => ({ ...prev, reverseOrder: !prev.reverseOrder }));
  if (!active.reverseOrder) {
    setSeasonData(reverseOrderHelper('positive', infoConf.fullList));
  } else {
    setSeasonData(reverseOrderHelper('negative', seasonData));
  }
};

// 设置更新事件
export const settingUpdateEvent = (
  item: any,
  historyData: any,
  videoData: any,
  extConf: any,
  infoConf: any,
  setHistoryData: (data: any) => void,
  setVideoData: (data: any) => void,
  setExtConf: (extConf: any) => void,
  emits: any,
) => {
  setHistoryData((prev: any) => ({
    ...prev,
    skipTimeInStart: item.skipTimeInStart,
    skipTimeInEnd: item.skipTimeInEnd,
  }));

  setVideoData((prev: any) => ({
    ...prev,
    skipTimeInStart: item.skipTimeInStart,
    skipTimeInEnd: item.skipTimeInEnd,
  }));

  setExtConf((prev: any) => ({
    ...prev,
    setting: {
      ...prev.setting,
      playConf: {
        ...prev.setting.playConf,
        skipHeadAndEnd: item.skipHeadAndEnd,
        playNextPreload: item.playNextPreload,
        playNextEnabled: item.playNextEnabled,
        skipAd: item.skipAd,
      },
    },
  }));

  emits('update', {
    type: 'film',
    setting: extConf.setting,
    data: Object.assign({}, { info: infoConf, ext: extConf }),
  });
};

// 获取豆瓣影片推荐
export const fetchRecommend = async (infoConf: any, setRecommendList: (list: any[]) => void) => {
  let { vod_name: name, vod_year: year, vod_douban_id: doubanId, vod_douban_type: doubanType } = infoConf;
  if (!year) year = new Date().getFullYear();
  const res = await fetchRecommPage({ id: doubanId, type: doubanType, name, year });
  setRecommendList(res || []);
};

// 推荐刷新数据
export const recommendEvent = async (
  item: any,
  extConf: any,
  setInfoConf: (info: any) => void,
  setRecommendList: (list: any[]) => void,
  setHistoryData: (data: any) => void,
  setSeasonData: (data: any) => void,
  setVideoData: (data: any) => void,
  setActive: (active: any) => void,
  setup: () => Promise<void>,
  emits: any,
) => {
  const { site } = extConf;
  const res = await fetchRecommSearchHelper(site, item.vod_name);

  if (Object.keys(res).length > 0) {
    setInfoConf(res);
    setRecommendList([]);
    setHistoryData({});
    setSeasonData({});
    setVideoData({
      url: '',
      playEnd: false,
      watchTime: 0,
      duration: 0,
      skipTimeInStart: 30,
      skipTimeInEnd: 30,
    });
    setActive({
      profile: false,
      binge: false,
      reverseOrder: true,
      share: false,
      download: false,
      setting: false,
      official: false,
      analyzeId: '',
      filmIndex: '',
      flimSource: '',
    });

    emits('update', {
      type: 'film',
      data: Object.assign({}, { info: item, ext: extConf }),
    });
    setup();
  } else {
    MessagePlugin.warning(t('pages.player.message.noRecommendSearch'));
  }
};

// 设置函数
export const setup = async (
  infoConf: any,
  active: any,
  seasonData: any,
  analyzeData: any,
  setInfoConf: (info: any) => void,
  setSeasonData: (data: any) => void,
  setActive: (active: any) => void,
  setAnalyzeData: (data: any) => void,
  fetchHistory: () => Promise<void>,
  putHistory: () => Promise<void>,
  fetchAnalyzeActive: () => Promise<any>,
) => {
  // 1. 格式化剧集数据
  const formattedSeason: any = await formatSeason(infoConf);
  setInfoConf((prev: any) => ({ ...prev, fullList: formattedSeason }));
  if (Object.keys(formattedSeason)?.[0] === 'error') {
    MessagePlugin.warning(t('pages.film.message.formatSeasonError'));
    return;
  }

  // 2. 设置默认选集
  setActive((prev: any) => ({
    ...prev,
    flimSource: prev.flimSource || Object.keys(formattedSeason)[0],
    filmIndex: prev.filmIndex || formattedSeason[prev.flimSource || Object.keys(formattedSeason)[0]][0],
  }));

  // 3. 选集排序
  if (active.reverseOrder) setSeasonData(formattedSeason);
  else setSeasonData(reverseOrderHelper('negative', formattedSeason));

  // 4. 获取播放记录
  await fetchHistory();
  if (!historyData?.id) await putHistory();

  // 5. 获取解析规则 + 是否显示解析
  const analyzeRes = await fetchAnalyzeActive();
  if (analyzeRes.hasOwnProperty('data')) setAnalyzeData((prev: any) => ({ ...prev, list: analyzeRes['data'] }));
  if (analyzeRes.hasOwnProperty('default'))
    setActive((prev: any) => ({ ...prev, analyzeId: analyzeRes['default']['id'] }));
  if (analyzeRes.hasOwnProperty('flag')) {
    setAnalyzeData((prev: any) => ({ ...prev, flag: analyzeRes['flag'] }));
    let vipUrl = formatIndex(active.filmIndex)?.url;
    vipUrl = decodeURIComponent(vipUrl);
    const vipUrlHostname = /^(https?:\/\/)/.test(vipUrl) ? new URL(vipUrl)?.hostname : '';
    setActive((prev: any) => ({
      ...prev,
      official: analyzeRes.flag.includes(prev.flimSource) || VIP_LIST.includes(vipUrlHostname),
    }));
  }
};

// 定时更新播放进度
export const timerUpdatePlayProcess = async (
  currentTime: number,
  duration: number,
  active: any,
  seasonData: any,
  extConf: any,
  videoData: any,
  tmp: any,
  setVideoData: (data: any) => void,
  throttlePutHistory: () => void,
  switchSeasonEvent: (item: string) => Promise<void>,
  emits: any,
) => {
  // 1.不处理当前或总进度为0或负数
  if (!currentTime || !duration || currentTime < 0 || duration < 0) return;

  const index = seasonData[active.flimSource].indexOf(active.filmIndex);
  if (index === -1) return;

  const isLast = () => {
    if (active.reverseOrder) {
      return seasonData[active.flimSource].length === index + 1;
    } else {
      return index === 0;
    }
  };

  // 2.获取跳过时间
  const { playConf, barrage } = extConf.setting;
  const watchTime = playConf.skipHeadAndEnd ? currentTime + videoData.skipTimeInEnd : currentTime;

  // 3.更新播放记录
  setVideoData((prev: any) => ({
    ...prev,
    watchTime: currentTime,
    duration: duration,
    playEnd: watchTime >= duration,
  }));

  throttlePutHistory();

  // 5.播放下集 观看时间+尾部跳过时间 >= 总时长
  // 5.1 开启续集 & 不是最后一集 -> 播放下集
  // 5.2 未触发下集 -> 暂停播放
  if (watchTime >= duration && duration !== 0) {
    if (!isLast() && playConf.playNextEnabled && !tmp.end) {
      setTmp((prev: any) => ({ ...prev, end: true })); // 标识是否触发下集

      const nextIndex = active.reverseOrder ? index + 1 : index - 1;
      const nextInfo = seasonData[active.flimSource][nextIndex];
      await switchSeasonEvent(nextInfo);
      return;
    } else {
      emits('pause');
    }
  }

  // 6.播放下集  不是最后一集 & 开启续集 & 观看时间+尾部跳过时间 >= 总时长
  if (!isLast() && playConf.playNextEnabled && watchTime >= duration && duration !== 0 && !tmp.end) {
    setTmp((prev: any) => ({ ...prev, end: true })); // 标识是否触发下集

    const nextIndex = active.reverseOrder ? index + 1 : index - 1;
    const nextInfo = seasonData[active.flimSource][nextIndex];
    await switchSeasonEvent(nextInfo);
    return;
  }

  // 5.预加载下集链接 不是最后一集 & 开启预加载 & 提前30秒预加载+观看时间+尾部跳过时间 >= 总时长
  if (!isLast() && playConf.playNextPreload && watchTime + 30 >= duration && duration !== 0 && !tmp.preloadNext.load) {
    setTmp((prev: any) => ({ ...prev, preloadNext: { ...prev.preloadNext, load: true } })); // 标识是否触发预加载

    try {
      const nextIndex = active.reverseOrder ? index + 1 : index - 1;
      const nextInfo = seasonData[active.flimSource][nextIndex];
      let url = formatIndex(nextInfo).url;
      url = decodeURIComponent(url);
      const originUrl = url;
      const analyzeInfo = analyzeData.list.find((item: any) => item.id === active.analyzeId);
      let analyzeType = analyzeInfo?.type !== undefined ? analyzeInfo?.type : -1;
      if (active.official) {
        if (!analyzeInfo || typeof analyzeInfo !== 'object' || Object.keys(analyzeInfo).length === 0) return;
        url = `${analyzeInfo.url}${url}`;
        analyzeType = analyzeInfo.type;
      } else {
        analyzeType = -1;
      }
      const response = await playHelper(url, extConf.site, active.flimSource, analyzeType, playConf.skipAd);
      if (response?.url && /^(https?:\/\/)/.test(response.url)) {
        setTmp((prev: any) => ({
          ...prev,
          preloadNext: {
            ...prev.preloadNext,
            id: nextInfo,
            url: response.url,
            quality: response.quality,
            headers: response.headers,
            mediaType: response.mediaType,
            init: true,
          },
        })); // 标识是否预加载完毕

        const barrageRes: { barrage: string[]; id: string | number | null } = await fetchBarrageData(
          originUrl,
          barrage,
          active,
        );
        if (Array.isArray(barrageRes.barrage) && barrageRes.barrage.length > 0 && barrageRes.id) {
          setTmp((prev: any) => ({
            ...prev,
            preloadNext: {
              ...prev.preloadNext,
              barrage: barrageRes,
            },
          }));
        }
      }
    } catch (err: any) {
      console.log(`[player][timeUpdate][preloadNext][error]`, err);
    }
  }
};

// 处理季节激活
export const handleSeasonActive = (active: any, seasonData: any) => {
  const { flimSource, filmIndex, reverseOrder } = active;

  if (!['number', 'string'].includes(typeof flimSource)) return undefined;
  if (!['number', 'string'].includes(typeof filmIndex)) return undefined;
  if (typeof reverseOrder !== 'boolean') return undefined;

  const seasonList = seasonData?.[flimSource];
  if (!Array.isArray(seasonList) || seasonList.length === 0) return undefined;

  const index = seasonList.indexOf(filmIndex);
  if (index === -1) return undefined;

  const isLast: boolean = reverseOrder ? index === seasonList.length - 1 : index === 0;
  let nextIndex: number | undefined = undefined;
  if (!isLast) nextIndex = reverseOrder ? index + 1 : index - 1;

  return { isLast, currIndex: index, nextIndex, reverseOrder, seasonList };
};
