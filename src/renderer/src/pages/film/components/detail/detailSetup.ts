import { ref, watch, computed } from 'vue';
import { renderError, renderLoading } from '@/utils/common/renderUtils';
import {
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
} from './utils/detailUtils';

export const useDetailSetup = (props: any, emit: any) => {
  const formVisible = ref(false);
  const infoConf = ref(props.info);
  const extConf = ref(props.ext);
  const bingeData = ref<{ [key: string]: any }>({});
  const historyData = ref<{ [key: string]: any }>({});
  const seasonData = ref<{ [key: string]: any }>({});
  const lineList = computed(() => {
    return Object.keys(seasonData.value).map((item) => ({ type_id: item, type_name: item }));
  });
  const analyzeData = ref<{ [key: string]: any[] }>({
    list: [],
    flag: [],
  });
  const active = ref({
    binge: true,
    reverseOrder: true,
    official: false,
    flimSource: '',
    filmIndex: '',
    analyzeId: '',
  });

  const resetStates = () => {
    active.value.flimSource = active.value.filmIndex = active.value.analyzeId = '';
    active.value.official = active.value.binge = false;
    active.value.reverseOrder = true;
    seasonData.value = [];
    historyData.value = bingeData.value = {};
    analyzeData.value = { list: [], flag: [] };
  };

  watch(
    () => formVisible.value,
    (val) => {
      emit('update:visible', val);

      if (val) {
        setup(infoConf, active, seasonData, analyzeData, extConf, bingeData, historyData);
      } else {
        resetStates();
      }
    },
  );

  watch(
    () => props.visible,
    (val) => {
      formVisible.value = val;
    },
  );

  watch(
    () => props.info,
    (val) => {
      infoConf.value = val;
    },
  );

  watch(
    () => props.ext,
    (val) => {
      extConf.value = val;
    },
    { deep: true },
  );

  // 更新收藏
  const handlePutBinge = async () => {
    const response = await putBinge(bingeData.value, active.value, extConf.value, infoConf.value);
    const { code, data, status } = response;

    if (code === 0) {
      bingeData.value = data;
      active.value.binge = status;
    }
  };

  // 剧集顺序
  const handleReverseOrder = () => {
    reverseOrderEvent(active.value, infoConf.value, seasonData);
  };

  // 更新历史
  const handlePutHistory = async () => {
    const response = await putHistory(historyData.value, active.value, extConf.value, infoConf.value);

    const { code, data, status } = response;

    if (code === 0 && status) {
      historyData.value = data;
    }
  };

  // 切换线路
  const handleSwitchLine = (key: string) => {
    switchLineEvent(key, analyzeData.value, active.value);
  };

  // 切换解析接口
  const handleSwitchAnalyze = async (key: string) => {
    const success = await switchAnalyzeEvent(
      key,
      active.value,
      async (item: any, analyzeData: any, active: any, extConf: any) => {
        return await callPlay(item, analyzeData, active, extConf);
      },
      analyzeData.value,
      extConf.value,
    );

    if (success) {
      await handlePutHistory();
    }
  };

  // 切换选集
  const handleSwitchSeason = async (item: any) => {
    await switchSeasonEvent(
      item,
      active.value,
      async (item: any, analyzeData: any, active: any, extConf: any) => {
        return await callPlay(item, analyzeData, active, extConf);
      },
      analyzeData.value,
      extConf.value,
      handlePutHistory,
    );
  };

  return {
    formVisible,
    infoConf,
    bingeData,
    historyData,
    seasonData,
    lineList,
    analyzeData,
    active,
    renderError,
    renderLoading,
    formatName,
    formatReverseOrder,
    formatContent,
    handlePutBinge,
    handleReverseOrder,
    handleSwitchLine,
    handleSwitchAnalyze,
    handleSwitchSeason,
  };
};
