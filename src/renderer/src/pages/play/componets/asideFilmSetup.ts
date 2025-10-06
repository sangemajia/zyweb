import { ref, computed, onMounted } from 'vue';
import { throttle } from 'lodash-es';
import emitter from '@/utils/emitter';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { reverseOrderHelper, formatSeason } from '@/utils/common/film';
import { fetchAnalyzeActive } from '@/api/analyze';

export const useAsideFilmSetup = (props: any, emits: any) => {
  const infoConf = ref(props.info);
  const extConf = ref(props.ext);
  const processConf = ref(props.process);
  const formData = ref({
    title: props.info.vod_name,
  });
  const analyzeData = ref<{ [key: string]: any[] }>({
    list: [],
    flag: [],
  });
  const bingeData = ref<{ [key: string]: any }>({});
  const historyData = ref<{ [key: string]: any }>({});
  const seasonData = ref<{ [key: string]: any }>({});
  const lineList = computed(() => {
    return Object.keys(seasonData.value).map((item) => ({ type_id: item, type_name: item }));
  });
  const videoData = ref<{ [key: string]: any }>({
    url: '',
    playEnd: false,
    watchTime: 0,
    duration: 0,
    skipTimeInStart: 30,
    skipTimeInEnd: 30,
  });
  const recommendList = ref<any[]>([]);
  const shareFormData = ref({
    name: '',
    url: '',
    provider: 'zyfun',
  });
  const downloadFormData = ref({ season: {}, current: '' });
  const settingFormData = ref({
    skipHeadAndEnd: false,
    skipTimeInStart: 30,
    skipTimeInEnd: 30,
    playNextPreload: false,
    playNextEnabled: true,
    skipAd: false,
  });
  const active = ref({
    profile: false,
    binge: true,
    reverseOrder: true,
    share: false,
    download: false,
    setting: false,
    official: false,
    analyzeId: '',
    filmIndex: '',
    flimSource: '',
  });
  const tmp = ref<{ [key: string]: any }>({
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

  // 节流更新历史
  const throttlePutHistory = throttle(
    () => {
      // This will be implemented in the component
    },
    3000,
    {
      leading: true, // 节流开始前，默认true
      trailing: false, // 节流结束后，默认true
    },
  );

  // lifecycle functions
  const setupLifecycle = (setup: () => Promise<void>) => {
    onMounted(() => {
      setup();
    });
  };

  return {
    infoConf,
    extConf,
    processConf,
    formData,
    analyzeData,
    bingeData,
    historyData,
    seasonData,
    lineList,
    videoData,
    recommendList,
    shareFormData,
    downloadFormData,
    settingFormData,
    active,
    tmp,
    throttlePutHistory,
    setupLifecycle,
  };
};
