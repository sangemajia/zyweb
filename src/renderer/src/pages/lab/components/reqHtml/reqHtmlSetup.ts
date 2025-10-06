import { ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { fetchHtml } from '@/api/setting';

// 请求方法选项
export const reqMethods = [
  {
    label: 'GET',
    value: 'GET',
  },
  {
    label: 'POST',
    value: 'POST',
  },
  {
    label: 'DELETE',
    value: 'DELETE',
  },
  {
    label: 'PUT',
    value: 'PUT',
  },
  {
    label: 'OPTIONS',
    value: 'OPTIONS',
  },
  {
    label: 'HEAD',
    value: 'HEAD',
  },
];

// 编码选项
export const reqEncode = [
  {
    label: 'UTF-8',
    value: 'UTF-8',
  },
  {
    label: 'GB2312',
    value: 'GB2312',
  },
  {
    label: 'GBK',
    value: 'GBK',
  },
  {
    label: 'GB18030',
    value: 'GB18030',
  },
];

// 内容类型选项
export const reqContentTypes = [
  {
    label: 'application/json',
    value: 'application/json',
  },
  {
    label: 'application/x-www-form-urlencoded',
    value: 'application/x-www-form-urlencoded',
  },
];

// 初始化组件状态
export const useReqHtmlSetup = (props: any, emits: any) => {
  const formData = ref(props.data);
  watch(
    () => props.data,
    (val) => {
      formData.value = val;
    },
    { deep: true },
  );

  const active = ref({
    reqDialog: false,
  });

  const prepareRequestOptions = (method = 'GET', header = '{}', body = '{}', contentType = 'application/json') => {
    if (!header) header = '{}';
    if (!body) body = '{}';
    const parsedHeader = Function('return (' + header + ')')();
    let parsedBody = Function('return (' + body + ')')();

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

  const onSubmit = async () => {
    let { url, method, encode, header, body, contentType } = formData.value;

    if (!url) {
      MessagePlugin.warning(t('pages.lab.staticFilter.message.htmlNoUrl'));
      return;
    }

    if (!url.startsWith('http')) {
      url = 'http://' + url;
    }

    try {
      const { parsedHeader, parsedBody } = prepareRequestOptions(method, header, body, contentType);
      const response = await fetchHtml({
        url,
        method,
        encode,
        headers: parsedHeader,
        data: parsedBody,
      });
      if (response) {
        emits('source', response);
        MessagePlugin.success(`${t('pages.setting.data.success')}`);
      }
    } catch (err) {
      console.error('Error parsing header or body:', err);
      MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    }
  };

  const onReset = () => {
    formData.value.header = '{}';
    formData.value.body = '{}';
    formData.value.encode = 'UTF-8';
    formData.value.contentType = 'application/json';
  };

  const RULES = {
    encode: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  };

  return {
    formData,
    active,
    reqMethods,
    reqEncode,
    reqContentTypes,
    prepareRequestOptions,
    onSubmit,
    onReset,
    RULES,
  };
};
