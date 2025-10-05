import { ref, reactive, onMounted, onActivated } from 'vue';
import { usePlayStore } from '@/store';
import { prefix } from '@/config/global';
import { t } from '@/locales';
import emitter from '@/utils/emitter';
import { fetchSiteActive, fetchCmsInit } from '@/api/site';

// 工具函数
import { searchGroup, searchEvent } from './searchUtils';
import { getClassList, getFilmList, getSearchList } from './filmUtils';
import { playEvent } from './playUtils';

// 初始化配置
export const useFilmSetup = () => {
  // 存储
  const storePlayer = usePlayStore();

  // 响应式数据
  const infiniteId = ref(+new Date());
  const searchTxt = ref('');
  const searchCurrentSite = ref();
  const detailFormData = ref({
    info: {},
    ext: { site: {}, setting: {} },
  });
  const isVisible = reactive({
    toolbar: false,
    detail: false,
    loadClass: false,
    loading: false,
    lazyload: false
  });
  const pagination = ref({
    pageIndex: 1,
    pageSize: 36,
    count: 0,
    total: 0,
  });
  const filterData = ref({});
  const siteConfig = ref({
    default: {
      id: '',
      type: 0,
      categories: '',
      ext: ''
    },
    search: '',
    filter: false,
    data: [],
    filterOnlySearchData: [],
    searchGroup: []
  });
  const active = ref({
    nav: null,
    class: 'homeVod',
    tmpClass: '',
    tmpId: '',
    infiniteType: 'loading',
    filter: {}
  });
  const filmData = ref({
    list: [],
    rawList: [],
  });
  const classConfig = ref({
    data: []
  });

  // 生命周期钩子
  onMounted(() => {
    getSetting();
  });

  onActivated(() => {
    const isListenedRefreshFilmConfig = emitter.all.get('refreshFilmConfig');
    if (!isListenedRefreshFilmConfig) emitter.on('refreshFilmConfig', refreshConf);
  });

  // 获取设置
  const getSetting = async () => {
    try {
      const data = await fetchSiteActive();
      if (data.hasOwnProperty('default')) {
        siteConfig.value.default = data["default"];
        active.value.nav = data["default"]["id"];
        active.value.infiniteType = 'noMore';
      } else {
        active.value.infiniteType = 'noData';
      }
      if (Array.isArray(data['data']) && data["data"].length > 0) {
        siteConfig.value.data = data["data"];
        siteConfig.value.filterOnlySearchData = data["data"].filter((item) => item["search"] !== 2);
      }
      if (data.hasOwnProperty('filter')) {
        siteConfig.value.filter = data["filter"];
      }
      if (data.hasOwnProperty('search')) {
        siteConfig.value.search = data["search"];
      }
    } catch (err) {
      active.value.infiniteType = 'noData';
    } finally {
      isVisible.lazyload = true;
    }
  };

  // 刷新配置
  const refreshConf = async () => {
    console.log('[film][bus][refresh]');
    defaultConf();
    await getSetting();
  };

  // 默认配置
  const defaultConf = () => {
    isVisible.lazyload = true;
    isVisible.loadClass = false;
    active.value.infiniteType = 'noData';
    active.value.class = 'homeVod';
    active.value.tmpClass = '';
    active.value.tmpId = '';
    searchTxt.value = '';
    active.value.nav = '';
    siteConfig.value.default = {};
    classConfig.value.data = [];
    filmData.value = { list: [], rawList: [] };
    filterData.value = {};
    emitter.emit('refreshSearchConfig');
    pagination.value.pageIndex = 1;
    infiniteId.value++;
  };

  // 切换配置
  const changeConf = async (id: string) => {
    try {
      defaultConf();
      active.value.nav = id;
      siteConfig.value.default = siteConfig.value.data.find(item => item.id === id);
      active.value.infiniteType = 'noMore';
    } catch (err) {
      active.value.infiniteType = 'noData';
    } finally {
      isVisible.lazyload = true;
    }
  };

  // 过滤条件-选中第一项
  const classFilter = () => {
    const result = {};

    if (filterData[active.value.class]) {
      filterData[active.value.class].forEach((item) => {
        result[item.key] = item.value[0]?.v ?? '全部';
      });
    }

    active.value.filter = result;
  };

  // 切换分类
  const changeClassEvent = (key: string) => {
    active.value.class = key;
    active.value.tmpClass = '';

    classFilter();
    searchTxt.value = '';
    active.value.infiniteType = 'noMore';
    filmData.value = { list: [], rawList: [] };
    emitter.emit('refreshSearchConfig');
    pagination.value.pageIndex = 1;
    infiniteId.value++;
  };

  // 筛选条件切换
  const changeFilterEvent = (key, item) => {
    console.log(`[film] change filter: ${key}:${item}`);
    active.value.filter[key] = item;

    // 非cms筛选：基于请求数据
    filmData.value = { list: [], rawList: [] };
    pagination.value.pageIndex = 1;
    infiniteId.value++;
  };

  // 加载
  const load = async ($state: { complete: () => void; loaded: () => void; error: () => void }) => {
    console.log('[film] loading...');
    try {
      const checkComplete = () => {
        const stopFlag = ['noData', 'networkError', 'categoryError']
        return stopFlag.includes(active.value.infiniteType)
      }
      if (checkComplete()) {
        $state.complete();
        return;
      };
      const defaultSite = searchTxt.value ? searchCurrentSite.value : siteConfig.value.default;

      // setp1: 初始化
      if (!active.value.tmpId || active.value.tmpId !== defaultSite.id) {
        await fetchCmsInit({ sourceId: defaultSite.id });
        active.value.tmpId = defaultSite.id;
        pagination.value.pageIndex = 1;
      };

      // setp2: 获取分类
      if (classConfig.value.data.length <= 1 && !searchTxt.value) {
        const result = await getClassList(defaultSite, classConfig.value, active.value, filterData.value);
        classConfig.value = result.classConfig;
        active.value = result.active;
        filterData.value = result.filterData;
        if (checkComplete()) {
          $state.complete();
          return;
        };
      };

      // setp3: 加载数据
      const loadFunction = searchTxt.value ? getSearchList : getFilmList;
      const result = await loadFunction(
        searchTxt.value,
        pagination.value,
        siteConfig.value,
        searchCurrentSite.value,
        filmData.value,
        active.value,
        siteConfig.value.filter
      );

      filmData.value = result.filmData;
      pagination.value = result.pagination;
      active.value = result.active;
      searchCurrentSite.value = result.searchCurrentSite;

      if (result.length === 0 || filmData.value.list.filter((item) => item.vod_id === 'no_data').length > 0) {
        $state.complete();
      } else $state.loaded();
    } catch (err) {
      console.error(err);
      $state.error();
    }
  };

  return {
    // 数据
    infiniteId,
    searchTxt,
    searchCurrentSite,
    detailFormData,
    isVisible,
    pagination,
    filterData,
    siteConfig,
    active,
    filmData,
    classConfig,
    storePlayer,

    // 方法
    getSetting,
    refreshConf,
    defaultConf,
    changeConf,
    classFilter,
    changeClassEvent,
    changeFilterEvent,
    load,
    searchEvent,
    searchGroup,
    getClassList,
    getFilmList,
    getSearchList,
    playEvent
  };
};