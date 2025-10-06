import 'v3-infinite-loading/lib/style.css';
import { AssignmentCheckedIcon, DeleteIcon } from 'tdesign-icons-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import InfiniteLoading from 'v3-infinite-loading';
import { onActivated, ref, reactive } from 'vue';
import { usePlayStore } from '@/store';
import emitter from '@/utils/emitter';
import { prefix } from '@/config/global';
import { t } from '@/locales';

import {
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
} from './utils/bingeUtils';

export const useBingeSetup = () => {
  const storePlayer = usePlayStore();

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

  const bingeConfig = ref<any>({
    data: [],
  });

  const siteConfig = ref({
    data: [],
  });

  const infiniteId = ref(+new Date());

  // 初始化
  const init = () => {
    onActivated(() => {
      const isListenedRefreshBinge = emitter.all.get('refreshBinge');
      if (!isListenedRefreshBinge)
        emitter.on('refreshBinge', () => {
          refreshBinge(() => {
            defaultSet(bingeConfig, infiniteId, pagination);
          });
        });
    });
  };

  // 加载数据
  const load = async ($state: any) => {
    console.log('[binge] loading...');
    try {
      const resLength = await getBingeList(pagination, bingeConfig);
      if (resLength === 0) $state.complete();
      else $state.loaded();
    } catch (error) {
      $state.error();
    }
  };

  // 播放事件
  const handlePlayEvent = async (item: any) => {
    await playEvent(item, storePlayer, detailFormData, isVisible);
  };

  // 删除事件
  const handleRemoveEvent = async (item: any) => {
    await removeEvent(item, bingeConfig, pagination);
  };

  // 检查更新事件
  const handleCheckUpdaterEvent = async () => {
    await checkUpdaterEvent(bingeConfig);
  };

  // 清除事件
  const handleClearEvent = () => {
    clearEvent(() => {
      defaultSet(bingeConfig, infiniteId, pagination);
    });
  };

  return {
    pagination,
    detailFormData,
    isVisible,
    bingeConfig,
    siteConfig,
    infiniteId,
    renderError,
    renderLoading,
    init,
    load,
    handlePlayEvent,
    handleRemoveEvent,
    handleCheckUpdaterEvent,
    handleClearEvent,
    prefix,
    t,
  };
};
