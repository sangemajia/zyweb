import { MessagePlugin } from 'tdesign-vue-next';
import JSON5 from 'json5';
import jsBeautify from 'js-beautify';
import { t } from '@/locales';
import { copyToClipboardApi } from '@/utils/tool';
import { gzip } from '@/utils/crypto';
import { fetchStaticFilterFilter, fetchStaticFilterCategory } from '@/api/lab';
import { fetchHtml } from '@/api/setting';

export const demoConfEvent = (setReqFormData: (data: any) => void, setForm: (form: any) => void) => {
  setReqFormData({
    url: 'https://www.dianying101.xyz/index.php/vod/show/id/1.html',
  });
  setForm({
    class_parse: String.raw`.myui-header__menu li.hidden-sm;a&&Text;a&&href;/type/id/(\d+).html`,
    reurl: 'https://www.dianying101.xyz/index.php/vod/show/id/fyclass.html',
    cate_exclude: '首页|更新|热搜榜',
    filter: 'body&&.myui-screen__list',
    filterInfo: ';.text-muted&&Text;body&&a;a&&Text;a&&href',
    matchs: {
      年份: '(/year.*?)\.html@@',
      语言: '(/lang.*?)\.html@@',
      字母: '(/letter.*?)\.html@@',
      类型: '',
      剧情: 'show(.*?)/id',
      地区: 'show(.*?)/id',
      排序: '(/by.*?)/id',
    },
  });
};

export const changeNav = async (
  nav: string,
  action: string,
  formNav: string,
  setFormNav: (nav: string) => void,
  codeEditConf: any,
  setCodeEditConf: (conf: any) => void,
  content: any,
  setContentText: (text: string) => void,
) => {
  nav = nav || formNav;
  setFormNav(nav);

  switch (nav) {
    case 'source':
      setCodeEditConf({ ...codeEditConf, language: 'html', readOnly: true });
      break;
    case 'rule':
      setCodeEditConf({ ...codeEditConf, language: 'json', readOnly: true });
      break;
    default:
      break;
  }

  const contentText = typeof content[nav] === 'object' ? JSON5.stringify(content[nav], null, 2) : content[nav];

  setContentText(contentText);
};

export const getMatchs = async (
  filterInfo: string,
  filter: string,
  exclude_keys: string,
  matchs: any,
  contentHtml: string,
  setMatchs: (matchs: any) => void,
) => {
  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoFilterAndFilterInfo'));
    return;
  }

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.sourceFirst'));
    return;
  }

  try {
    const response = await fetchStaticFilterFilter({
      html: contentHtml,
      ci: '',
      f: filter,
      f1: filterInfo,
      matchs: {},
      exclude_keys: exclude_keys,
    });
    const updatedMatchs = response?.fl.reduce((acc, item) => {
      if (!matchs.hasOwnProperty(item)) {
        acc[item] = '';
      } else acc[item] = matchs[item];
      return acc;
    }, {});

    setMatchs({ ...updatedMatchs });
  } catch (err) {
    console.error('Error in getMatchs:', err);
  }
};

export const uniqueObjectsByProperty = (array: any[], key: string) => {
  const map = new Map();
  array.forEach((item) => {
    const keyValue = item[key];
    map.set(keyValue, item);
  });
  return Array.from(map.values());
};

export const concatenateObjects = (array: any[]) => {
  return array.reduce(
    (accumulator, current) => {
      accumulator.m = accumulator.m ? `${accumulator.m}&${current.m}` : current.m;
      accumulator.title = accumulator.title ? `${accumulator.title}&${current.title}` : current.title;
      return accumulator;
    },
    { m: '', title: '' },
  );
};

export const actionClass = async (
  class_parse: string,
  class_name: string,
  class_url: string,
  cate_exclude: string,
  reurl: string,
  url: string,
  contentHtml: string,
  setContentDebug: (debug: any) => void,
  setClassName: (name: string) => void,
  setClassUrl: (url: string) => void,
  setClassResult: (result: any) => void,
  changeNav: (nav: string, action: string) => void,
) => {
  if (!class_parse && !class_name && !class_url) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoClassParse'));
    return;
  }

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.sourceFirst'));
    return;
  }

  let response = await fetchStaticFilterCategory({
    contentHtml,
    class_parse,
    cate_exclude,
    reurl,
    url,
  });
  let set = new Set();
  if (class_name && class_url) {
    if (response.hasOwnProperty('m')) {
      response.m += '&' + class_url;
      response.title += '&' + class_name;
    }
  }

  if (Object.keys(response).length > 0) {
    response.m.split('&').map((x: string, i: number) => {
      set.add({ m: x, title: (response as any).title.split('&')[i] });
    });

    let rs = uniqueObjectsByProperty(Array.from(set), 'm');
    if (cate_exclude.length > 0) {
      let excludeCategories = cate_exclude.split(/\|/).filter((e) => e);
      rs = rs.filter((x: any) => !excludeCategories.some((s) => s.includes(x.title)));
    }

    response = concatenateObjects(rs);
  }

  if (Object.keys(response).length == 0) {
    if (class_name && class_url) {
      response.m = class_url;
      response.title = class_name;
    }
  }

  const transformData = (data: any) => {
    const titles = data.title.split('&');
    const ms = data.m.split('&');

    return titles.map((title: string, index: number) => ({
      title: title.trim(),
      id: ms[index].trim(),
      surl: reurl.replace('fyclass', ms[index].trim()),
    }));
  };

  if (response?.title && response?.m) setContentDebug(transformData(response));
  setClassName(response?.title || '');
  setClassUrl(response?.m || '');
  setClassResult(transformData(response));
  changeNav('debug', 'class');
};

export const batchResults = async (
  classResult: any,
  filterInfo: string,
  filter: string,
  exclude_keys: string,
  matchs: any,
  setContentDebug: (debug: any) => void,
  changeNav: (nav: string, action: string) => void,
  setBatchFetchLoading: (loading: boolean) => void,
) => {
  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoFilterAndFilterInfo'));
    return;
  }

  if (Object.keys(classResult).length == 0) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.classResultisEmpty'));
    return;
  }

  try {
    setBatchFetchLoading(true);

    const results = await batchFetch(classResult);
    const promises = results.map(async (item: any) => {
      const response = await fetchStaticFilterFilter({
        html: item.body,
        ci: item.id,
        f: filter,
        f1: filterInfo,
        matchs: matchs,
        exclude_keys: exclude_keys,
      });
      return { id: item.id, filters: response?.filters };
    });

    const responses = await Promise.all(promises);
    const rs = {};
    responses.forEach((res: any) => {
      if (res.filters) {
        (rs as any)[res.id] = res.filters;
      }
    });

    setContentDebug(JSON.stringify(rs, null, 2));

    changeNav('debug', 'class');
  } catch (err) {
    console.log(`[editSource][sift][batchResults][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    setBatchFetchLoading(false);
  }
};

export const prepareRequestOptions = (method: string, header: string, body: string, contentType: string) => {
  const parsedHeader = JSON5.parse(header || '{}');
  let parsedBody = JSON5.parse(body || '{}');

  if (method !== 'GET' && parsedBody) {
    parsedHeader['Content-Type'] = contentType;
    if (contentType === 'application/x-www-form-urlencoded') {
      parsedBody instanceof URLSearchParams ? parsedBody : (parsedBody = new URLSearchParams(parsedBody));
    }
  }

  let parseHeaderKeys: string[];
  parseHeaderKeys = Object.keys(parsedHeader).map((it) => it.toLowerCase());
  if (!parseHeaderKeys.includes('accept')) {
    parsedHeader['Accept'] = '*/*';
  }

  return { parsedHeader, parsedBody };
};

export const batchFetch = async (obj: any, reqFormData: any) => {
  const { method, encode, header, body, contentType } = reqFormData;

  try {
    const { parsedHeader, parsedBody } = prepareRequestOptions(method, header, body, contentType);
    const promises = obj.map((x: any) =>
      fetchHtml({
        url: x.surl.trim(),
        method,
        encode,
        headers: parsedHeader,
        data: parsedBody,
      }),
    );
    const responses = await Promise.all(promises);
    const results = responses.map((response, index) => ({
      id: obj[index].id,
      body: response,
    }));
    return results;
  } catch (error) {
    console.error('Error in batch fetch:', error);
    throw error;
  }
};

export const actionFilter = async (
  filterInfo: string,
  filter: string,
  exclude_keys: string,
  matchs: any,
  contentHtml: string,
  setContentDebug: (debug: any) => void,
  changeNav: (nav: string, action: string) => void,
) => {
  if (!filterInfo || !filter) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.inputNoFilterAndFilterInfo'));
    return;
  }

  if (!contentHtml.trim()) {
    MessagePlugin.warning(t('pages.lab.staticFilter.message.sourceFirst'));
    return;
  }

  const response = await fetchStaticFilterFilter({
    html: contentHtml,
    ci: '',
    f: filter,
    f1: filterInfo,
    matchs: matchs,
    exclude_keys: exclude_keys,
  });

  setContentDebug(response.filters);
  changeNav('debug', 'filter');
};

export const debugEvent = async (
  clickType: string,
  contentText: string,
  contentDebug: any,
  setContentText: (text: string) => void,
  setClickType: (type: string) => void,
) => {
  try {
    const type = clickType;

    if (type === 'copy') {
      await copyToClipboardApi(contentText);
    } else if (type === 'encode') {
      const dataBase64 = gzip.encode(contentDebug);
      setContentText(dataBase64);
    }

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sift][debugEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    setClickType('');
  }
};

export const sourceEvent = (
  clickType: string,
  contentSource: string,
  setContentText: (text: string) => void,
  setClickType: (type: string) => void,
) => {
  try {
    const type = clickType;
    const html = contentSource;
    if (type === 'reset') {
      setContentText(html);
    } else if (type === 'format') {
      const formattedHtml: any = jsBeautify.html(html, {
        preserve_newlines: false,
      });
      setContentText(formattedHtml);
    }

    MessagePlugin.info(`${t('pages.setting.data.success')}`);
  } catch (err) {
    console.log(`[editSource][sift][sourceEvent][err]${err}`);
    MessagePlugin.error(`${t('pages.setting.data.fail')}`);
  } finally {
    setClickType('');
  }
};

export const handleOpChange = (type: string, setNav: (nav: string) => void, demoConfEvent: () => void) => {
  setNav('');
  switch (type) {
    case 'demo':
      demoConfEvent();
      break;
  }
};

export const htmlSourceEvent = (
  data: string,
  setContentSource: (source: string) => void,
  setContentText: (text: string) => void,
  setFormNav: (nav: string) => void,
) => {
  setFormNav('source');
  setContentSource(data);
  setContentText(data);
};
