import { computed, onActivated, ref, reactive } from 'vue';
import { prefix } from '@/config/global';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import emitter from '@/utils/emitter';

import {
  getHistoryList,
  playEvent,
  removeEvent,
  clearEvent,
  filterDate,
  formatProgress,
  defaultSet,
  refreshHistory,
  formatIndex,
} from './utils/historyUtils';

export const useHistorySetup = () => {
  const storePlayer = usePlayStore();

  const translateDate = computed(() => {
    return {
      today: t('pages.chase.date.today'),
      week: t('pages.chase.date.week'),
      ago: t('pages.chase.date.ago'),
    };
  });

  const options = ref({
    today: [],
    week: [],
    ago: [],
  });

  const pagination = ref({
    pageIndex: 1,
    pageSize: 32,
    count: 0,
  });

  const detailFormData = ref({
    info: {},
    ext: { site: {}, setting: {} },
  }); //  详情组件源传参

  const isVisible = reactive({
    detail: false,
    loading: false,
  });

  const infiniteId = ref(+new Date());

  // 初始化
  const init = () => {
    onActivated(() => {
      const isListenedRefreshHistory = emitter.all.get('refreshHistory');
      if (!isListenedRefreshHistory)
        emitter.on('refreshHistory', () => {
          refreshHistory(() => {
            defaultSet(options, infiniteId, pagination);
          });
        });
    });
  };

  // 加载数据
  const load = async ($state: any) => {
    console.log('[history] loading...');

    try {
      const resLength = await getHistoryList(pagination, options);
      if (resLength === 0) $state.complete();
      else $state.loaded();
    } catch (err) {
      console.log(err);
      $state.error();
    }
  };

  // 播放事件
  const handlePlayEvent = async (item: any) => {
    await playEvent(item, storePlayer, detailFormData, isVisible);
  };

  // 删除事件
  const handleRemoveEvent = async (item: any) => {
    await removeEvent(item, options, pagination);
  };

  // 清除事件
  const handleClearEvent = () => {
    clearEvent(() => {
      defaultSet(options, infiniteId, pagination);
    });
  };

  return {
    translateDate,
    options,
    pagination,
    detailFormData,
    isVisible,
    infiniteId,
    renderError,
    renderLoading,
    init,
    load,
    handlePlayEvent,
    handleRemoveEvent,
    handleClearEvent,
    filterDate,
    formatProgress,
    formatIndex,
    prefix,
    t,
  };
};
