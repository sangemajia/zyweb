import { ref, watch, onMounted } from 'vue';
import { throttle } from 'lodash-es';
import moment from 'moment';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { fetchBingeData, putBingeData, fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { fetchAnalyzeActive } from '@/api/analyze';
import { fetchAnalyzeHelper } from '@/utils/common/film';

// 初始化组件状态
export const useAnalyzeSetup = (props: any, emits: any) => {
  const infoConf = ref(props.info);
  const extConf = ref(props.ext);
  const processConf = ref(props.process);
  const formData = ref({
    title: props.info.name,
  });
  const seasonList = ref<any[]>([]);
  const active = ref({
    nav: 'season',
    share: false,
    binge: false,
  });
  const shareFormData = ref({
    name: '',
    url: '',
    provider: 'zyfun',
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
    skipTime: 0,
  });

  // 监听props变化
  watch(
    () => props.info,
    (val) => {
      infoConf.value = val;
      formData.value.title = val.name;
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

  const fetchAnalyze = async () => {
    try {
      const data = await fetchAnalyzeActive();
      if (data.hasOwnProperty('default')) {
        extConf.value.site = data['default'];
      }
      if (data.hasOwnProperty('data')) {
        seasonList.value = data['data'];
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 获取收藏
  const fetchBinge = async () => {
    const { key } = extConf.value.site;
    const { url: vod_id } = infoConf.value;

    const response = await fetchBingeData(key, vod_id, ['analyze']);
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
    const { url: vod_id, name: vod_name } = infoConf.value;
    const doc = {
      date: moment().unix(),
      type: 'analyze',
      relateId: key,
      videoId: vod_id,
      videoImage: '',
      videoName: vod_name,
      videoType: '',
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
    const { url: vod_id } = infoConf.value;

    const response = await fetchHistoryData(key, vod_id, ['analyze']);
    const { code, data, status } = response;

    if (code === 0 && status) {
      historyData.value = data;
    }
  };

  // 更新历史
  const putHistory = async () => {
    const { id = null } = historyData.value;
    const { key } = extConf.value.site;
    const { url: vod_id, name: vod_name } = infoConf.value;
    const { watchTime, duration, playEnd, skipTimeInStart, skipTimeInEnd } = videoData.value;
    const doc = {
      date: moment().unix(),
      type: 'analyze',
      relateId: key,
      siteSource: '',
      playEnd: playEnd,
      videoId: vod_id,
      videoImage: '',
      videoName: vod_name,
      videoIndex: `${vod_name}$${vod_id}`,
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

  const changeAnalyzeEvent = async (item) => {
    extConf.value.site = item;
    videoData.value.skipTime = videoData.value.watchTime;
    emits('update', {
      type: 'analyze',
      data: Object.assign({ info: infoConf.value, ext: extConf.value }),
    });
    await callPlay({ url: infoConf.value.url, headers: item?.headers || {} });
  };

  // 分享 dialog 数据
  const shareEvent = () => {
    active.value.share = true;
  };

  // 调用播放器
  const callPlay = async (item) => {
    MessagePlugin.info(t('pages.analyze.message.info'));

    try {
      const { site, headers } = extConf.value;
      const response = await fetchAnalyzeHelper(`${site.url}${item.url}`, site.type, headers);
      if (response?.url) {
        shareFormData.value.url = response.url;
        emits('play', {
          url: response.url,
          headers: response?.headers || {},
          type: response.mediaType,
          startTime: videoData.value.skipTime,
        });
      } else {
        MessagePlugin.error(t('pages.analyze.message.error'));
      }
    } catch (err) {
      console.log(err);
    }
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

    // 2. 获取收藏(不影响)
    fetchBinge();

    // 3. 获取解析(不影响)
    fetchAnalyze();

    // 4. 初始化播放数据
    videoData.value.skipTime = historyData.value.watchTime;

    // 5. 播放
    await callPlay({ url: infoConf.value.url, headers: extConf.value.site.headers || {} });
  };

  // 在组件挂载时初始化
  onMounted(() => {
    setup();
  });

  return {
    formData,
    seasonList,
    active,
    shareFormData,
    extConf,
    videoData,
    bingeData,
    historyData,
    changeAnalyzeEvent,
    shareEvent,
    putBinge,
    setup,
    callPlay,
    timerUpdatePlayProcess,
  };
};
