import dayjs from 'dayjs';
import { getOriginalJs } from './crypto';
import { fetchCmsRunMain, putSite, addSite } from '@/api/site';
import { setT3Proxy } from '@/api/proxy';
import { fetchLog, clearLog } from '@/api/plugin';

// common
export const utilsReadFile = async (filePath: string) => {
  return await window.electron.ipcRenderer.invoke('manage-file', { action: 'read', config: { path: filePath } });
};

export const utilsWriteFile = async (filePath: string, content: string) => {
  return await window.electron.ipcRenderer.invoke('manage-file', {
    action: 'write',
    config: { path: filePath, content: content },
  });
};

export const utilsT3JsBasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/drpy_dzlive/drpy_js/`);
  return defaultPath;
};

export const utilsT3PyBasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `file/py/`);
  return defaultPath;
};

export const utilsT4BasePath = async () => {
  const userDataPath = await window.electron.ipcRenderer.invoke('get-app-path', 'userData');
  const defaultPath = await window.electron.ipcRenderer.invoke('path-join', userDataPath, `plugin/drpy-node/js/`);
  return defaultPath;
};

export const utilsBasePath = async (mode: string) => {
  if (mode === 't3js') {
    return await utilsT3JsBasePath();
  } else if (mode === 't3py') {
    return await utilsT3PyBasePath();
  } else if (mode === 't4') {
    return await utilsT4BasePath();
  }
};

export const utilsLocal = async (content: string) => {
  return await getOriginalJs(content);
};

export const utilsDecode = async (content: string) => {
  return await utilsLocal(content);
};

export const utilsReadT3JsFile = async () => {
  try {
    const basePath = await utilsT3JsBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    const content = await utilsReadFile(defaultPath);
    return content;
  } catch (err) {
    console.error(`[utilsReadT3JsFile][Error]:`, err);
    return '';
  }
};

export const utilsReadT3PyFile = async () => {
  try {
    const basePath = await utilsT3PyBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.py`);
    const content = await utilsReadFile(defaultPath);
    return content;
  } catch (err) {
    console.error(`[utilsReadT3PyFile][Error]:`, err);
    return '';
  }
};

export const utilsReadT4File = async () => {
  try {
    const basePath = await utilsT4BasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    const content = await utilsReadFile(defaultPath);
    return content;
  } catch (err) {
    console.error(`[utilsReadT4File][Error]:`, err);
    return '';
  }
};

export const utilsRead = async (mode: string) => {
  if (mode === 't3js') {
    return await utilsReadT3JsFile();
  } else if (mode === 't3py') {
    return await utilsReadT3PyFile();
  } else if (mode === 't4') {
    return await utilsReadT4File();
  }
};

export const utilsWriteT3JsFile = async (val: string) => {
  try {
    const basePath = await utilsT3JsBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    await utilsWriteFile(defaultPath, val);
    return true;
  } catch (err) {
    console.error(`[utilsWriteT3JsFile][Error]:`, err);
    return false;
  }
};

export const utilsWriteT3PyFile = async (val: string) => {
  try {
    const basePath = await utilsT3PyBasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.py`);
    await utilsWriteFile(defaultPath, val);
    return true;
  } catch (err) {
    console.error(`[utilsWriteT3PyFile][Error]:`, err);
    return false;
  }
};

export const utilsWriteT4File = async (val: string) => {
  try {
    const basePath = await utilsT4BasePath();
    const defaultPath = await window.electron.ipcRenderer.invoke('path-join', basePath, `debug.js`);
    await utilsWriteFile(defaultPath, val);
    return true;
  } catch (err) {
    console.error(`[utilsWriteT4File][Error]:`, err);
    return false;
  }
};

export const utilsWrite = async (val: string, mode: string) => {
  if (mode === 't3js') {
    return await utilsWriteT3JsFile(val);
  } else if (mode === 't3py') {
    return await utilsWriteT3PyFile(val);
  } else if (mode === 't4') {
    return await utilsWriteT4File(val);
  }
};

export const utilsGetLogT3Js = async (debugId: string) => {
  try {
    const res = await fetchCmsRunMain({
      func: 'function main() { return getLogRecord() }',
      arg: '',
      sourceId: debugId,
    });
    return res;
  } catch (err) {
    console.error(`[utilsGetLogT3Js][Error]:`, err);
    return [];
  }
};

export const utilsGetLogT3Py = async (debugId: string) => {
  try {
    const res = await fetchCmsRunMain({
      func: 'function main() { return getLogRecord() }',
      arg: '',
      sourceId: debugId,
    });
    return res;
  } catch (err) {
    console.error(`[utilsGetLogT3Py][Error]:`, err);
    return [];
  }
};

export const utilsGetLogT4 = async () => {
  try {
    const res = await fetchLog('drpy-node');
    return res;
  } catch (err) {
    console.error(`[utilsGetLogT4][Error]:`, err);
    return [];
  }
};

export const utilsGetLog = async (mode: string, debugId: string) => {
  if (mode === 't3js') {
    return await utilsGetLogT3Js(debugId);
  } else if (mode === 't3py') {
    return await utilsGetLogT3Py(debugId);
  } else if (mode === 't4') {
    return await utilsGetLogT4();
  }
};

export const utilsClearLogT3Js = async (debugId: string) => {
  try {
    const res = await fetchCmsRunMain({
      func: 'function main() { return clearLogRecord() }',
      arg: '',
      sourceId: debugId,
    });
    return res;
  } catch (err) {
    console.error(`[utilsClearLogT3Js][Error]:`, err);
    return [];
  }
};

export const utilsClearLogT3Py = async (debugId: string) => {
  try {
    const res = await fetchCmsRunMain({
      func: 'function main() { return clearLogRecord() }',
      arg: '',
      sourceId: debugId,
    });
    return res;
  } catch (err) {
    console.error(`[utilsClearLogT3Py][Error]:`, err);
    return [];
  }
};

export const utilsClearLogT4 = async () => {
  try {
    const res = await clearLog('drpy-node');
    return res;
  } catch (err) {
    console.error(`[utilsClearLogT4][Error]:`, err);
    return [];
  }
};

export const utilsClearLog = async (mode: string, debugId: string) => {
  if (mode === 't3js') {
    return await utilsClearLogT3Js(debugId);
  } else if (mode === 't3py') {
    return await utilsClearLogT3Py(debugId);
  } else if (mode === 't4') {
    return await utilsClearLogT4();
  }
};

export const utilsPutSiteT3Js = async (id: string, content: string) => {
  await utilsWriteT3JsFile(content);
  await putSite({
    ids: [id],
    doc: { type: 7, api: './drpy.min.js', ext: 'http://127.0.0.1:9978/api/v1/file/drpy_dzlive/drpy_js/debug.js' },
  });
};

export const utilsPutSiteT3Py = async (id: string, content: string) => {
  await utilsWriteT3PyFile(content);
  await putSite({ ids: [id], doc: { type: 12, api: 'http://127.0.0.1:9978/api/v1/file/py/debug.py', ext: '' } });
};

export const utilsPutSiteT4 = async (id: string, content: string) => {
  await utilsWriteT4File(content);
  await putSite({ ids: [id], doc: { type: 6, api: 'http://127.0.0.1:5757/api/debug', ext: '' } });
};

export const utilsPutSite = async (mode: string, content: string, id: string) => {
  if (mode === 't3js') {
    return await utilsPutSiteT3Js(id, content);
  } else if (mode === 't3py') {
    return await utilsPutSiteT3Py(id, content);
  } else if (mode === 't4') {
    return await utilsPutSiteT4(id, content);
  }
};

export const setupData = async (
  debugId: string,
  setDebugId: (id: string) => void,
  mode: string,
  setMode: (mode: string) => void,
  setContent: (content: string) => void,
) => {
  const debugRes = await fetchCmsRunMain({
    func: 'function main() { return getDebugInfo() }',
    arg: '',
    sourceId: debugId,
  });
  const typeMap = {
    7: 't3js',
    12: 't3py',
    6: 't4',
  };

  if (debugRes?.id) {
    setDebugId(debugRes.id);
    const type = debugRes.type;
    const mode = typeMap[type];
    setMode(mode);
    setContent(await utilsRead(mode));
  } else {
    const siteRes = await addSite({
      name: 'debug',
      key: 'debug',
      // @ts-ignore
      type: ((mode) => {
        if (mode === 't3js') return 7;
        else if (mode === 't3py') return 12;
        else if (mode === 't4') return 6;
      })(mode),
      // @ts-ignore
      api: ((mode) => {
        if (mode === 't3js') return './drpy.min.js';
        else if (mode === 't3py') return 'http://127.0.0.1:9978/api/v1/file/py/debug.py';
        else if (mode === 't4') return 'http://127.0.0.1:5757/api/debug';
      })(mode),
      search: 1,
      playUrl: '',
      group: 'debug',
      category: '',
      ext: '',
    });
    if (Array.isArray(siteRes) && siteRes.length > 0 && siteRes[0].hasOwnProperty('id')) {
      setDebugId(siteRes[0].id);
    } else return;
  }
};
