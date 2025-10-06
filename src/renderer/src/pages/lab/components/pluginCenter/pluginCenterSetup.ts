import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
import { FormInstanceFunctions, FormProps } from 'tdesign-vue-next';
import { LoadingIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import logoIcon from '@/assets/icon.png';
import { renderError, renderLoading } from '@/utils/common/renderUtils';
import {
  fetchData,
  handleControl,
  handleControlChange,
  handleInstall,
  handleGoDir,
  handleOpenDevtool,
  webviewLoadError,
} from './utils/pluginCenterUtils';

export const usePluginCenterSetup = () => {
  const pluginList = ref<any[]>([]);
  const pluginInfo = ref<{ [key: string]: string }>({});
  const formData = ref({ pluginName: '' });
  const formRef = useTemplateRef<FormInstanceFunctions>('formRef');
  const active = ref({
    nav: '',
    aside: '',
    installDialog: false,
    installLoading: false,
    control: '',
    controlLoad: {},
  });
  const webviewRef = ref<any>(null);

  const label = computed(() => {
    return {
      copy: t('pages.md.label.copy'),
      lang: t('pages.md.label.lang'),
      copySuccess: t('pages.md.label.copySuccess'),
      copyError: t('pages.md.label.copyError'),
    };
  });

  const navList = computed(() => {
    return pluginList.value.map((item) => ({
      type_name: item.pluginName,
      type_id: item.name,
    }));
  });

  // 初始化数据
  const init = () => {
    onMounted(() => {
      fetchData().then((res) => {
        if (res && res.length > 0) {
          pluginList.value = res;
          const item = res[0];
          active.value.aside = item.name;
          pluginInfo.value = item;
        }
      });
    });
  };

  // 处理导航点击
  const handleItemClick = async (name: string) => {
    active.value.aside = name;
    const item = pluginList.value.find((p) => p.name === name);
    pluginInfo.value = item;
    if (pluginInfo.value.type === 'ui')
      nextTick(() => {
        webviewRef.value.removeEventListener('did-fail-load', (err: any) => webviewLoadError(err, webviewRef));
        webviewRef.value.addEventListener('did-fail-load', (err: any) => webviewLoadError(err, webviewRef));
      });
  };

  // 处理操作变更
  const handleOpChange = (type: string) => {
    active.value.nav = '';

    switch (type) {
      case 'install':
        active.value.installDialog = true;
        break;
      case 'file':
        handleGoDir();
        break;
    }
  };

  // 取消安装
  const onCancel = () => {
    active.value.installDialog = false;
  };

  // 提交表单
  const onSubmit: FormProps['onSubmit'] = (e) => {
    formRef.value?.validate().then((validateResult) => {
      if (validateResult && Object.keys(validateResult).length) {
        const firstError = Object.values(validateResult)[0]?.[0]?.message;
        // 这里需要通过emit传递错误信息或者使用全局消息插件
      } else {
        handleInstallAction('install', formData.value.pluginName);
      }
    });
  };

  // 处理安装操作
  const handleInstallAction = async (type: string, name: string) => {
    await handleInstall(
      type,
      name,
      active,
      setActive,
      async (
        type: string,
        name: string,
        pluginList: any[],
        setPluginList: Function,
        setPluginInfo: Function,
        setActiveAside: Function,
      ) => {
        return await handleControl(type, name, pluginList, setPluginList, setPluginInfo, setActiveAside);
      },
      pluginList.value,
      setPluginList,
      setPluginInfo,
      setActiveAside,
    );
  };

  // 处理控制操作
  const handleControlAction = async (type: string, name: string) => {
    await handleControl(type, name, pluginList.value, setPluginList, setPluginInfo, setActiveAside);
  };

  // 处理控制变更
  const handleControlChangeAction = async (type: string, name: string) => {
    await handleControlChange(
      type,
      name,
      active,
      setActive,
      async (
        type: string,
        name: string,
        pluginList: any[],
        setPluginList: Function,
        setPluginInfo: Function,
        setActiveAside: Function,
      ) => {
        return await handleControl(type, name, pluginList, setPluginList, setPluginInfo, setActiveAside);
      },
      pluginList.value,
      setPluginList,
      setPluginInfo,
      setActiveAside,
    );
  };

  // 设置插件列表
  const setPluginList = (list: any[]) => {
    pluginList.value = list;
  };

  // 设置插件信息
  const setPluginInfo = (info: any) => {
    pluginInfo.value = info;
  };

  // 设置活动侧边栏
  const setActiveAside = (name: string) => {
    active.value.aside = name;
  };

  // 设置活动状态
  const setActive = (newActive: any) => {
    active.value = newActive;
  };

  // 打开开发者工具
  const handleOpenDevtoolAction = () => {
    handleOpenDevtool(webviewRef);
  };

  const RULES = {
    pluginName: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  };

  return {
    pluginList,
    pluginInfo,
    formData,
    formRef,
    active,
    webviewRef,
    label,
    renderError,
    renderLoading,
    navList,
    init,
    handleItemClick,
    handleOpChange,
    onCancel,
    onSubmit,
    handleInstallAction,
    handleControlAction,
    handleControlChangeAction,
    handleOpenDevtoolAction,
    RULES,
  };
};
