import { ref, reactive, onActivated, onMounted } from 'vue';
import { usePlayStore } from '@/store';
import { prefix } from '@/config/global';
import { t } from '@/locales';
import emitter from '@/utils/emitter';
import { MessagePlugin } from 'tdesign-vue-next';
import { fetchAlistDir } from '@/api/drive';

// 工具函数
import { getSetting, initCloud, formatBreadcrumb, getCloudFile, getCloudFolder } from './driveUtils';
import { playEvent } from './playUtils';

// 初始化配置
export const useDriveSetup = () => {
  // 存储
  const storePlayer = usePlayStore();

  // 响应式数据
  const driveConfig = ref<{ [key: string]: any }>({
    data: [],
    default: {
      id: '',
      name: '',
      server: '',
      startPage: '',
      search: false,
      headers: {},
      params: {},
    },
  });
  const active = ref({
    nav: '',
    infiniteType: 'noMore',
  });
  const isVisible = reactive({
    loading: false,
    lazyload: false,
  });
  const driveContent = ref<any[]>([]);
  const breadcrumb = ref<any[]>([]);

  // 生命周期钩子
  onMounted(async () => {
    await getSetting(driveConfig.value, active.value);
    if (active.value.nav) await initCloud(driveConfig.value, isVisible, getCloudFolderHandler);
  });

  onActivated(() => {
    const isListenedRefreshDriveConfig = emitter.all.get('refreshDriveConfig');
    if (!isListenedRefreshDriveConfig) emitter.on('refreshDriveConfig', refreshConf);
  });

  // 获取云文件夹处理函数
  const getCloudFolderHandler = async (item) => {
    try {
      const result = await getCloudFolder(
        item,
        driveConfig.value,
        isVisible,
        driveContent.value,
        breadcrumb.value,
        formatBreadcrumb,
      );
      driveContent.value = result.driveContent;
      breadcrumb.value = result.breadcrumb;
    } catch (err) {
      console.log(err);
      MessagePlugin.error(t('pages.drive.message.reqError'));
    }
  };

  // 刷新配置
  const refreshConf = async () => {
    console.log('[drive][bus][refresh]');

    defaultConf();

    driveConfig.value = {
      data: [],
      default: {
        id: '',
        name: '',
        server: '',
        startPage: '',
        search: false,
        headers: {},
        params: {},
      },
    };
    await getSetting(driveConfig.value, active.value);
    if (active.value.nav) await initCloud(driveConfig.value, isVisible, getCloudFolderHandler);
  };

  // 默认配置
  const defaultConf = () => {
    driveContent.value = [];
    breadcrumb.value = [];
    active.value.nav = '';
    active.value.infiniteType = 'noMore';
  };

  // 切换配置
  const changeConf = async (id: string) => {
    console.log(`[drive] change source: ${id}`);

    const item: any = driveConfig.value.data.find((item) => item.id === id);
    item.startPage = item?.startPage ? item.startPage : '/';

    defaultConf();
    active.value.nav = id;
    driveConfig.value.default = item;
    await initCloud(driveConfig.value, isVisible, getCloudFolderHandler);
  };

  // 面包屑跳转
  const gotoBreadcrumbPath = async (path: string) => {
    isVisible.lazyload = true;

    try {
      const { id } = driveConfig.value.default;
      const res = await fetchAlistDir({ path, sourceId: id });
      driveContent.value = res.list;
      breadcrumb.value = formatBreadcrumb(path);
    } finally {
      isVisible.lazyload = false;
    }
  };

  // 获取文件或文件夹
  const getFileOrFolder = (item) => {
    const isFolder = item.type === 0;
    if (isFolder) {
      getCloudFolderHandler(item);
    } else {
      playEvent(item, driveConfig.value, storePlayer, isVisible, driveContent.value, breadcrumb.value);
    }
  };

  return {
    // 数据
    driveConfig,
    active,
    isVisible,
    driveContent,
    breadcrumb,
    storePlayer,

    // 方法
    refreshConf,
    defaultConf,
    changeConf,
    gotoBreadcrumbPath,
    getFileOrFolder,
    getCloudFolderHandler,
  };
};
