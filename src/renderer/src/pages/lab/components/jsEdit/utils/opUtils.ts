import { MessagePlugin } from 'tdesign-vue-next';
import JSON5 from 'json5';
import { t } from '@/locales';
import { fetchJsEditPdfa, fetchJsEditPdfh, fetchJsEditMuban, fetchJsEditDebug } from '@/api/lab';
import {
  fetchCmsHome,
  fetchCmsHomeVod,
  fetchCmsDetail,
  fetchCmsCategory,
  fetchCmsPlay,
  fetchCmsSearch,
  fetchCmsInit,
  fetchCmsRunMain,
  putSiteDefault,
  fetchCmsProxy,
} from '@/api/site';
import { setT3Proxy } from '@/api/proxy';
import { fetchLog, clearLog } from '@/api/plugin';
import { utilsRead, utilsWrite, utilsPutSite, utilsGetLog, utilsDecode } from './fileUtils';

export const getTemplate = async (setMubanData: (data: any) => void) => {
  const res = await fetchJsEditMuban();
  if (typeof res === 'object' && Object.keys(res).length > 0) {
    setMubanData(res);
  }
};

export const confirmTemplate = (
  formTemplate: string,
  mubanData: any,
  setContentJs: (js: string) => void,
  setTemplateVisible: (visible: boolean) => void,
) => {
  try {
    const text = mubanData[formTemplate];
    setContentJs(`var rule = ${JSON5.stringify(text, null, 2)}`);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.error(`[confirmTemplate][Error]:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  }
  setTemplateVisible(false);
};

export const handleImportFile = async (setContentJs: (js: string) => void) => {
  try {
    const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
      action: 'showOpenDialog',
      config: {
        properties: ['openFile', 'showHiddenFiles'],
        filters: [
          { name: 'JavaScript Files', extensions: ['js'] },
          { name: 'Py Files', extensions: ['py'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      },
    });
    if (!res || res.canceled || !res.filePaths.length) return;

    const fileContent = await window.electron.ipcRenderer.invoke('manage-file', {
      action: 'read',
      config: {
        path: res.filePaths[0],
      },
    });

    setContentJs(fileContent || '');
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err: any) {
    console.error(`[handleImportFile] err:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

export const handleExportFile = async (contentJs: string, mode: string) => {
  try {
    const content = (contentJs || '').trim();

    if (!content) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    }

    const basePath = await utilsBasePath(mode);
    let defaultPath = '';
    if (mode === 't3py') {
      defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `source.py`);
    } else {
      const title =
        content
          .match(/title:(.*?),/)?.[1]
          ?.replace(/['"]/g, '')
          ?.trim() || 'source';
      defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `${title}.js`);
    }

    const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
      action: 'showSaveDialog',
      config: {
        defaultPath: defaultPath,
        properties: ['showHiddenFiles'],
      },
    });
    if (!res || res.canceled || !res.filePath) return;

    const writeStatus = await window.electron.ipcRenderer.invoke('manage-file', {
      action: 'write',
      config: {
        path: res.filePath,
        content: content,
      },
    });

    if (writeStatus) MessagePlugin.success(t('pages.setting.data.success'));
    else MessagePlugin.error(t('pages.setting.data.fail'));
  } catch (err: any) {
    console.error(`[handleExportFile] err:`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

export const handleDebug = async (contentJs: string, debugId: string, mode: string, router: any) => {
  try {
    const content = contentJs;
    if (!content || content.trim().length === 0) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    }
    await utilsPutSite(mode, content, debugId);
    await putSiteDefault(debugId);
    // emitter.emit('refreshFilmConfig');
    router.push({ name: 'FilmIndex' });
  } catch (err) {
    console.log(`[setting][editSource][debugEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

export const handleDecode = async (
  contentJs: string,
  setContentJs: (js: string) => void,
  setEditor: (editor: string) => void,
) => {
  setEditor('js');

  try {
    const content = (contentJs || '').trim();
    if (!content) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
      return;
    }

    setContentJs(await utilsDecode(content));
    MessagePlugin.success(t('pages.setting.data.success'));
  } catch (err) {
    console.log(`[setting][editSource][decodeEvent][err]`, err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
  }
};

export const handleOpChange = (
  type: string,
  setTemplateVisible: (visible: boolean) => void,
  setNav: (nav: string) => void,
  router: any,
) => {
  setNav('');

  switch (type) {
    case 'template':
      setTemplateVisible(true);
      break;
    case 'doc':
      window.electron.ipcRenderer.send(
        'open-url',
        'https://github.com/Hiram-Wong/ZyPlayer/wiki/%E5%86%99%E6%BA%90%E5%B7%A5%E5%85%B7',
      );
      break;
    case 'debug':
      handleDebug();
      break;
  }
};

export const handleOpFileChange = (type: string, setTmpFile: (file: string) => void, t: (key: string) => string) => {
  setTmpFile(t('pages.lab.jsEdit.fileManage'));

  switch (type) {
    case 'file':
      window.electron.ipcRenderer.send('open-path', 'file');
      break;
    case 'import':
      handleImportFile();
      break;
    case 'export':
      handleExportFile();
      break;
    case 'decode':
      handleDecode();
      break;
  }
};

export const handleDomDebugPdfa = async (rule: string, html: string, logRef: any) => {
  if (!rule) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoRule'));
    return;
  }

  await handleDomDebug('pdfa', rule, html, logRef);
};

export const handleDomDebugPdfh = async (rule: string, html: string, logRef: any) => {
  if (!rule) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoRule'));
    return;
  }

  await handleDomDebug('pdfh', rule, html, logRef);
};

export const handleDomDebug = async (type: string, rule: string, html: string, logRef: any) => {
  const content = (html || '').trim();
  if (!content) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.ruleNoHtml'));
    return;
  }

  const methodMap = {
    pdfa: fetchJsEditPdfa,
    pdfh: fetchJsEditPdfh,
  };

  try {
    const res = await methodMap[type]({ html: content, rule });
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, res);

    logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(res);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    console.error(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, err);

    logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(err, 'error');
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

export const handleModeToggle = async (
  mode: string,
  setMode: (mode: string) => void,
  setContentJs: (js: string) => void,
  debugId: string,
) => {
  const defaultMode = ['t3js', 't3py', 't4'];
  const activeIndex = defaultMode.indexOf(mode);
  const status = activeIndex + 1 === defaultMode.length ? defaultMode[0] : defaultMode[activeIndex + 1];
  setMode(status);
  if (status === 't4') {
    MessagePlugin.info(t('pages.lab.jsEdit.message.modeT4'));
  } else if (status === 't3py') {
    MessagePlugin.info(t('pages.lab.jsEdit.message.modeT3py'));
  }
  setContentJs(await utilsRead(status));
  await utilsPutSite(status, contentJs, debugId);
};

export const handleDataDebugLog = async (mode: string, debugId: string, logRef: any) => {
  try {
    const res = await utilsGetLog(mode, debugId);

    res.forEach(([_type, time, content]) => {
      console.info(`log: ${moment(time).format('YYYY-MM-DD HH:mm:ss')}`, content);

      logRef.value?.write(`log: ${moment(time).format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
      logRef.value?.write(content);
    });
  } catch (err: any) {
    console.warn(`log: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, err);

    logRef.value?.write(`log: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    logRef.value?.write(err, 'error');
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

export const handleDataDebugInit = async (
  debug: boolean,
  editTime: number,
  initTime: number,
  auto: boolean,
  mode: string,
  contentJs: string,
  debugId: string,
  setContentJs: (js: string) => void,
) => {
  await handleDataDebug('init', { debug: true }, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugHome = async (
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  await handleDataDebug('home', {}, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugHomeVod = async (
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  await handleDataDebug('homeVod', {}, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugCategory = async (
  t: string,
  f: string,
  pg: number,
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  if (!f) f = '{}';
  f = Function('return (' + f + ')')();

  if (!t) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.listNoT'));
    return;
  }
  const data = {
    tid: t,
    page: pg || 1,
    filter: !!f,
    f: JSON.stringify(f),
  };
  await handleDataDebug('category', data, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugDetail = async (
  ids: string,
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  if (!ids) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.detailNoIds'));
    return;
  }

  await handleDataDebug('detail', { id: ids }, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugSearch = async (
  wd: string,
  pg: number,
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  if (!wd) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.searchNoWd'));
    return;
  }

  const data = {
    wd,
    quick: false,
    pg: pg === 1 ? null : pg,
  };
  await handleDataDebug('search', data, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugPlay = async (
  flag: string,
  play: string,
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  if (!flag) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.playNoFlag'));
    return;
  }

  if (!play) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.playNoPlay'));
    return;
  }

  const data = {
    flag: flag,
    input: play,
  };
  await handleDataDebug('play', data, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
};

export const handleDataDebugProxy = async (
  url: string,
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  if (!url) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyNoUrl'));
    return;
  }

  if (url && url.startsWith('http')) {
    if (!url.startsWith('http://127.0.0.1:9978/')) {
      const formatUrl = `http://127.0.0.1:9978/proxy?do=js&url=${url}`;
      // setProxyUrl(formatUrl);
      url = formatUrl;
    }
    const formatUrl = new URL(url);
    const params = Object.fromEntries(formatUrl.searchParams.entries());
    await handleDataDebug('proxy', params, debugId, mode, contentJs, editTime, initTime, auto, setContentJs);
  }
};

export const handleDataDebugProxyUpload = async (upload: string, url: string) => {
  try {
    let content: any[] = [];

    if (!url) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyNoUrl'));
      return;
    }

    if (!upload) {
      MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyUploadNoData'));
      return;
    } else {
      try {
        // const jsonStr = JSON5.parse(upload);
        const jsonStr = new Function(`return ${upload}`)();
        if (jsonStr && Array.isArray(jsonStr) && jsonStr.length === 3) {
          content = jsonStr;
        } else {
          MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyUploadNoJson'));
          return;
        }
      } catch {
        MessagePlugin.warning(t('pages.lab.jsEdit.message.proxyUploadNoJson'));
        return;
      }
    }

    const formatUrl = new URL(url);
    const params = Object.fromEntries(formatUrl.searchParams.entries());
    await setT3Proxy({ text: content, url: params.url });

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    console.error('[editSource][proxyUpload][err]', err);
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};

export const handleDataDebug = async (
  type: string,
  data: { [key: string]: any } = {},
  debugId: string,
  mode: string,
  contentJs: string,
  editTime: number,
  initTime: number,
  auto: boolean,
  setContentJs: (js: string) => void,
) => {
  // 1. 判断编辑器内容是否为空
  const content = (contentJs || '').trim();
  if (!content) {
    MessagePlugin.warning(t('pages.lab.jsEdit.message.initNoData'));
    return;
  }

  // 2.自动初始化则上传并初始化
  const edit = editTime;
  const init = initTime;
  if (type === 'init' || (edit > init && auto)) {
    const currentTime = moment().unix();
    // setLastEditTimeInit(currentTime);
    if (type !== 'init') {
      await fetchCmsInit({ sourceId: debugId, debug: true });
    }
  }

  // 3.执行
  const methodMap = {
    init: fetchCmsInit,
    home: fetchCmsHome,
    homeVod: fetchCmsHomeVod,
    detail: fetchCmsDetail,
    category: fetchCmsCategory,
    search: fetchCmsSearch,
    play: fetchCmsPlay,
    proxy: fetchCmsProxy,
    log: fetchCmsRunMain,
  };

  try {
    const res = await methodMap[type]({ ...data, sourceId: debugId });
    // if (type === 'proxy') setProxyUpload(JSON5.stringify(res));
    console.info(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, res);

    // logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    // logRef.value?.write(res);
    MessagePlugin.success(`${t('pages.setting.data.success')}`);
  } catch (err: any) {
    console.warn(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, err);

    // logRef.value?.write(`${type}: ${moment().format('YYYY-MM-DD HH:mm:ss')} > `, 'info', false);
    // logRef.value?.write(err, 'error');
    MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
  }
};
