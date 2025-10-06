import { ref, watch, onMounted } from 'vue';
import { throttle } from 'lodash-es';
import moment from 'moment';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { fetchChannelPage, fetchChannelEpg } from '@/api/iptv';
import { formatEpgStatus } from './utils/iptvUtils';

// 初始化组件状态
export const useIptvSetup = (props: any, emits: any) => {
  const infoConf = ref(props.info);
  const extConf = ref(props.ext);
  const processConf = ref(props.process);
  const infiniteId = ref(+new Date());
  const formData = ref({
    title: props.info.name,
  });
  const channelList = ref<any[]>([]);
  const classList = ref<any[]>([]);
  const epgList = ref([]);
  const active = ref({
    nav: 'epg',
    class: '全部',
    share: false,
    binge: false,
  });
  const shareFormData = ref({
    name: '',
    url: '',
    provider: 'zyfun',
  });
  const pagination = ref({
    pageIndex: 1,
    pageSize: 32,
    count: 0,
  });
  const bingeData = ref<{ [key: string]: any }>({});
  const historyData = ref<{ [key: string]: any }>({});
  const videoData = ref<{ [key: string]: any }>({
    url: '',
    playEnd: false,
    watchTime: 0,
    duration: 0,
    skipTimeInStart: 0,
    skipTimeInEnd: 0,
  });

  // 监听props变化
  watch(
    () => props.info,
    (val) => {
      infoConf.value = val;
      formData.value.title = val.name;
      getEpgList(val.name, moment().format('YYYY-MM-DD'));
    },
    { deep: true },
  );

  watch(
    () => props.ext,
    (val) => {
      extConf.value = val;
    },
    { deep: true },
  );

  watch(
    () => props.process,
    (val) => {
      processConf.value = val;
    },
    { deep: true },
  );

  watch(
    () => processConf.value,
    (val) => {
      timerUpdatePlayProcess(val.currentTime, val.duration);
    },
    { deep: true },
  );

  // 获取收藏
  const fetchBinge = async () => {
    const { key } = extConf.value.site;
    const { id: vod_id } = infoConf.value;

    const response = await fetchBingeData(key, vod_id, ['film']);
    const { code } = response;

    if (code === 0) {
      bingeData.value = response.data;
      active.value.binge = response.status;
    }
  };

  // 更新收藏
  const putBinge = async () => {
    const { id = null } = bingeData.value;
    const { key } = extConf.value.site;
    const { id: vod_id, logo: vod_pic, name: vod_name, group: type_name } = infoConf.value;
    const doc = {
      date: moment().unix(),
      type: 'iptv',
      relateId: key,
      videoId: vod_id,
      videoImage: vod_pic,
      videoName: vod_name,
      videoType: type_name,
      videoRemarks: '',
    };

    let response: any;
    if (id) response = await putBingeData('del', {}, id);
    else response = await putBingeData('add', doc, null);
    const { code, data, status } = response;

    if (code === 0) {
      bingeData.value = data;
      active.value.binge = status;
    }
  };

  // 获取历史
  const fetchHistory = async () => {
    const { key } = extConf.value.site;
    const { id: vod_id } = infoConf.value;

    const response = await fetchHistoryData(key, vod_id, ['iptv']);
    const { code, data, status } = response;

    if (code === 0 && status) {
      historyData.value = data;
    }
  };

  // 更新历史
  const putHistory = async () => {
    const { id = null } = historyData.value;
    const { key } = extConf.value.site;
    const { id: vod_id, logo: vod_pic, name: vod_name, url: vod_url, group: type_name } = infoConf.value;
    const { watchTime, duration, playEnd, skipTimeInStart, skipTimeInEnd } = videoData.value;
    const doc = {
      date: moment().unix(),
      type: 'iptv',
      relateId: key,
      siteSource: type_name,
      playEnd: playEnd,
      videoId: vod_id,
      videoImage: vod_pic,
      videoName: vod_name,
      videoIndex: `${vod_name}$${vod_url}`,
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
      historyData.value = data;
    }
  };

  // 节流更新历史
  const throttlePutHistory = throttle(putHistory, 3000, {
    leading: true,
    trailing: false,
  });

  // 获取直播列表
  const getChannelList = async () => {
    const { pageIndex, pageSize } = pagination.value;

    const res = await fetchChannelPage({ page: pageIndex, pageSize, kw: '', group: active.value.class });
    if (Array.isArray(res['class']) && res['class'].length > 0) {
      classList.value = res['class'];
      classList.value.unshift({ type_id: '全部', type_name: '全部' });
    }
    if (res.hasOwnProperty('total')) pagination.value.count = res['total'];
    channelList.value = [...channelList.value, ...res.data];

    pagination.value.pageIndex++;
    return res.data.length;
  };

  // 加载channel
  const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
    console.log('[iptv][channel]loading...');
    try {
      const resLength = await getChannelList();
      console.log(`[iptv][channel]return length: ${resLength}`);
      if (resLength === 0) $state.complete();
      else $state.loaded();
    } catch (err) {
      console.error(err);
      $state.error();
    }
  };

  /**
   * 获取epg列表
   * @param name 频道名称
   * @param date 日期
   */
  const getEpgList = async (name: string, date: string) => {
    try {
      const res = await fetchChannelEpg({ name, date });
      epgList.value = res;
    } catch (err: any) {
      console.log(`[iptv][epg][error]${err.message}`);
    }
  };

  // 切换channel
  const changeChannelEvent = async (item) => {
    emits('update', {
      type: 'iptv',
      data: Object.assign({ info: item, ext: extConf.value }),
    });
    await callPlay({ url: item.url, isLive: true });
  };

  // 切换nav
  const changeNavEvent = (key: string) => {
    active.value.class = key;
    channelList.value = [];
    pagination.value.pageIndex = 1;
    infiniteId.value++;
  };

  // 分享 dialog 数据
  const shareEvent = () => {
    let name = infoConf.value['name'];
    if (infoConf.value.group) name = `${infoConf.value['group']}-${infoConf.value['name']}`;
    shareFormData.value = { ...shareFormData.value, name, url: infoConf.value.url };
    active.value.share = true;
  };

  // 调用播放器
  const callPlay = async (item) => {
    emits('play', { ...item });
  };

  // 定时更新播放进度
  const timerUpdatePlayProcess = async (currentTime: number, duration: number) => {
    // 1.不处理当前或总进度为0或负数
    if (!currentTime || !duration || currentTime < 0 || duration < 0) return;

    // 2.获取跳过时间
    const watchTime = currentTime;

    // 3.更新播放记录
    videoData.value.watchTime = currentTime;
    videoData.value.duration = duration;
    if (watchTime >= duration) videoData.value.playEnd = true;
    throttlePutHistory();
  };

  const setup = async () => {
    // 1. 获取播放记录
    await fetchHistory();
    if (!historyData.value?.id) await putHistory();

    // 2. 获取电子节目单(不影响)
    getEpgList(formData.value.title, moment().format('YYYY-MM-DD'));

    // 3. 获取收藏(不影响)
    fetchBinge();

    // 4. 播放
    await callPlay({ url: infoConf.value.url, isLive: true });
  };

  // 在组件挂载时初始化
  onMounted(() => {
    setup();
  });

  return {
    formData,
    channelList,
    classList,
    epgList,
    active,
    shareFormData,
    infiniteId,
    pagination,
    bingeData,
    historyData,
    videoData,
    load,
    changeChannelEvent,
    changeNavEvent,
    shareEvent,
    putBinge,
    setup,
    formatEpgStatus,
  };
};
