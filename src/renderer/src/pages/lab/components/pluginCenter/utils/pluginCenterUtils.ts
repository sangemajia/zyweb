import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { list, install, uninstall, start, stop } from '@/api/plugin';

// 获取插件列表
const fetchData = async () => {
  const res = await list();
  return res;
};

// 处理控制操作
const handleControl = async (
  type: string,
  name: string,
  pluginList: any[],
  setPluginList: Function,
  setPluginInfo: Function,
  setActiveAside: Function,
) => {
  const methodMap = {
    start: start,
    stop: stop,
    uninstall: uninstall,
    install: install,
  };

  if (!methodMap?.[type]) return;

  try {
    const updatedPluginList = await methodMap[type]([name]);
    const checkSuccess = () => {
      return type === 'uninstall' ? true : updatedPluginList && updatedPluginList.length > 0;
    };

    if (checkSuccess()) {
      MessagePlugin.success(`${t('pages.setting.form.success')}`);
      if (type === 'uninstall') {
        const newPluginList = pluginList.filter((p) => p.name !== name);
        setPluginList(newPluginList);
        const newPluginInfo = newPluginList.length > 0 ? newPluginList[0] : {};
        setPluginInfo(newPluginInfo);
        setActiveAside(newPluginList.length > 0 ? newPluginList[0].name : '');
      } else if (type === 'install') {
        const installIndex = pluginList.findIndex((p) => p.name === updatedPluginList[0].name);
        let newPluginList;
        if (installIndex > -1) {
          newPluginList = [...pluginList];
          newPluginList[installIndex] = updatedPluginList[0];
        } else {
          newPluginList = [...pluginList, updatedPluginList[0]];
        }
        setPluginList(newPluginList);
        setPluginInfo(updatedPluginList[0]);
        setActiveAside(updatedPluginList[0].name);
      } else {
        const updateIndex = pluginList.findIndex((p) => p.name === name);
        if (updateIndex > -1) {
          const newPluginList = [...pluginList];
          newPluginList[updateIndex] = updatedPluginList[0];
          setPluginList(newPluginList);
          setPluginInfo(updatedPluginList[0]);
        }
      }
      return true;
    } else {
      MessagePlugin.warning(`${t('pages.setting.form.fail')}`);
      return false;
    }
  } catch (err: any) {
    console.log(`[pluginCenter][${type}][error]`, err);
    MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
    return false;
  }
};

// 处理控制变更
const handleControlChange = async (
  type: string,
  name: string,
  active: any,
  setActive: Function,
  handleControl: Function,
  pluginList: any[],
  setPluginList: Function,
  setPluginInfo: Function,
  setActiveAside: Function,
) => {
  setActive({ ...active.value, control: '' });

  if (!['install', 'uninstall', 'start', 'stop', 'update', 'upgrade'].includes(type)) return;
  if (active.value.controlLoad?.[name]) {
    MessagePlugin.warning(t('pages.lab.pluginCenter.control.cancelTip'));
    return;
  }

  const newControlLoad = { ...active.value.controlLoad, [name]: true };
  setActive({ ...active.value, controlLoad: newControlLoad });

  const result = await handleControl(type, name, pluginList, setPluginList, setPluginInfo, setActiveAside);

  const newControlLoadAfter = { ...active.value.controlLoad, [name]: false };
  setActive({ ...active.value, controlLoad: newControlLoadAfter });

  return result;
};

// 处理安装
const handleInstall = async (
  type: string,
  name: string,
  active: any,
  setActive: Function,
  handleControl: Function,
  pluginList: any[],
  setPluginList: Function,
  setPluginInfo: Function,
  setActiveAside: Function,
) => {
  if (active.value.installLoading) {
    MessagePlugin.warning(t('pages.lab.pluginCenter.control.cancelTip'));
    return;
  }

  setActive({ ...active.value, installLoading: true });

  const result = await handleControl(type, name, pluginList, setPluginList, setPluginInfo, setActiveAside);

  setActive({ ...active.value, installLoading: false, installDialog: false });

  return result;
};

// 打开目录
const handleGoDir = async () => {
  window.electron.ipcRenderer.send('open-path', 'plugin');
};

// 打开开发者工具
const handleOpenDevtool = (webviewRef: any) => {
  if (webviewRef.value) {
    webviewRef.value?.openDevTools();
  } else {
    MessagePlugin.warning(`${t('pages.lab.pluginCenter.control.devtoolDomAttchErrTip')}`);
  }
};

// WebView加载错误处理
const webviewLoadError = (err: any, webviewRef: any) => {
  MessagePlugin.warning(`${t('pages.lab.pluginCenter.control.loadUiEntryError')}: ${err.errorDescription}`);
  webviewRef.value.src = 'about:blank';
};

export {
  fetchData,
  handleControl,
  handleControlChange,
  handleInstall,
  handleGoDir,
  handleOpenDevtool,
  webviewLoadError,
};
