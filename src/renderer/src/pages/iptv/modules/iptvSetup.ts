import { ref, reactive, onMounted, onActivated, computed } from 'vue';
import { usePlayStore, useSettingStore } from '@/store';
import { prefix } from '@/config/global';
import { t } from '@/locales';
import emitter from '@/utils/emitter';
import { putIptvDefault } from '@/api/iptv';

// 工具函数
import { getSetting, getChannel } from './iptvUtils';
import { playEvent } from './playUtils';
import { delayQueue, ipversionQueue, thumbnailQueue, checkChannelDelay, checkChannelIp, generateThumbnail, clearQueue } from './queueUtils';

// 初始化配置
export const useIptvSetup = () => {
  // 存储
  const storePlayer = usePlayStore();
  const storeSetting = useSettingStore();

  // 响应式数据
  const isVisible = reactive({
    contentMenu: false,
    lazyload: false,
    loading: false
  });
  const searchTxt = ref('');
  const infiniteId = ref(+new Date());
  const infiniteCompleteTip = ref('noMore');
  const pagination = ref({
    pageIndex: 1,
    pageSize: 32,
    count: 0,
  });

  const iptvConfig = ref({
    default: {},
    data: [],
    ext: {
      epg: "https://epg.112114.eu.org/?ch={name}&date={date}",
      logo: "https://epg.112114.eu.org/logo/{name}.png",
      markIp: true,
      delay: false,
      thumbnail: false
    },
    ua: ""
  })

  const active = ref({
    nav: '',
    class: '全部',
    infiniteType: 'loading',
  })

  const channelList = ref<any[]>([]);
  const classList = ref<any[]>([]);

  const mode = computed(() => {
    return storeSetting.displayMode;
  });

  const optionsComponent = ref({
    zIndex: 15,
    width: 160,
    x: 500,
    y: 200,
    theme: mode.value === 'light' ? 'default' : 'mac dark',
  });

  const channelItem = ref<any>(null);

  // 生命周期钩子
  onMounted(() => {
    getSetting(iptvConfig.value, active.value, isVisible);
  });

  onActivated(() => {
    const isListenedRefreshIptvConfig = emitter.all.get('refreshIptvConfig');
    if (!isListenedRefreshIptvConfig) emitter.on('refreshIptvConfig', refreshConf);
  });

  // 刷新配置
  const refreshConf = async () => {
    console.log('[iptv][bus][refresh]');
    defaultConf();
    await getSetting(iptvConfig.value, active.value, isVisible);
  };

  // 默认配置
  const defaultConf = () => {
    clearQueue();
    isVisible.lazyload = false;
    active.value.infiniteType = 'noData';
    searchTxt.value = '';
    classList.value = [];
    active.value.class = '全部';
    active.value.nav = '';
    channelList.value = [];
    emitter.emit('refreshSearchConfig');
    pagination.value.pageIndex = 1;
    infiniteId.value++;
  };

  // 切换配置
  const changeConf = async (id: string) => {
    console.log(`[iptv] change source: ${id}`);
    try {
      defaultConf();
      active.value.class = '全部';
      active.value.nav = id;
      await putIptvDefault(id);
      active.value.infiniteType = 'noMore';
    } catch (err) {
      active.value.infiniteType = 'noData';
    } finally {
      isVisible.lazyload = true;
    }
  };

  // 搜索
  const searchEvent = async () => {
    console.log(`[iptv] search keyword: ${searchTxt.value}`);
    infiniteCompleteTip.value = 'noMore';
    channelList.value = [];
    pagination.value.pageIndex = 1;
    infiniteId.value++;
  };

  // 切换分类
  const changeClassEvent = (id: string) => {
    clearQueue();
    infiniteCompleteTip.value = 'noMore';
    active.value.class = id;
    channelList.value = [];
    infiniteId.value++;
    pagination.value.pageIndex = 1;
  };

  // 加载
  const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
    console.log('[iptv] loading...');
    try {
      if (active.value.infiniteType === 'noData') {
        $state.complete();
        return;
      };

      const result = await getChannel(
        pagination.value, 
        searchTxt.value, 
        active.value, 
        channelList.value, 
        classList.value, 
        iptvConfig.value
      );

      channelList.value = result.channelList;
      classList.value = result.classList;
      pagination.value = result.pagination;

      // 处理延迟检查
      if (iptvConfig.value.ext.delay) {
        channelList.value = await checkChannelDelay(pagination.value.pageIndex - 1, pagination.value.pageSize, channelList.value);
      }
      
      // 处理缩略图生成
      if (iptvConfig.value.ext.thumbnail) {
        channelList.value = await generateThumbnail(pagination.value.pageIndex - 1, pagination.value.pageSize, channelList.value);
      }
      
      // 处理IP检查
      if (iptvConfig.value.ext.markIp) {
        channelList.value = await checkChannelIp(pagination.value.pageIndex - 1, pagination.value.pageSize, channelList.value);
      }

      if (result.length === 0) $state.complete();
      else $state.loaded();
    } catch (err) {
      console.log(err);
      $state.error();
    }
  };

  return {
    // 数据
    isVisible,
    searchTxt,
    infiniteId,
    infiniteCompleteTip,
    pagination,
    iptvConfig,
    active,
    channelList,
    classList,
    mode,
    optionsComponent,
    channelItem,
    storePlayer,
    storeSetting,

    // 队列
    delayQueue,
    ipversionQueue,
    thumbnailQueue,

    // 方法
    refreshConf,
    defaultConf,
    changeConf,
    searchEvent,
    changeClassEvent,
    load,
    playEvent,
    clearQueue
  };
};