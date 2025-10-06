import { ref, computed } from 'vue';
import { base64, unicode, html, url, hex, gzip } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';

// 初始化组件状态
export const useCodeConversionSetup = () => {
  const formData = ref({
    input: '',
    output: '',
  });

  const active = ref({
    action: 'html',
  });

  const navList = computed(() => {
    return [
      {
        type_name: t('pages.lab.dataCrypto.codeConversion.html'),
        type_id: 'html',
      },
      {
        type_name: t('pages.lab.dataCrypto.codeConversion.unicode'),
        type_id: 'unicode',
      },
      {
        type_name: t('pages.lab.dataCrypto.codeConversion.base64'),
        type_id: 'base64',
      },
      {
        type_name: t('pages.lab.dataCrypto.codeConversion.url'),
        type_id: 'url',
      },
      {
        type_name: t('pages.lab.dataCrypto.codeConversion.hex'),
        type_id: 'hex',
      },
      {
        type_name: t('pages.lab.dataCrypto.codeConversion.gzip'),
        type_id: 'gzip',
      },
    ];
  });

  const changeNavEvent = (val: string) => {
    active.value.action = val;
    formData.value.input = '';
    formData.value.output = '';
  };

  const codeConversionEvent = (type: 'encode' | 'decode') => {
    try {
      if (!formData.value.input) {
        MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
        return;
      }
      const methodMap = {
        url: url,
        base64: base64,
        unicode: unicode,
        html: html,
        hex: hex,
        gzip: gzip,
      };
      if (type === 'encode') {
        formData.value.output = methodMap[active.value.action].encode(formData.value.input);
      } else {
        formData.value.output = methodMap[active.value.action].decode(formData.value.input);
      }
      MessagePlugin.success(`${t('pages.setting.form.success')}`);
    } catch (err: any) {
      MessagePlugin.error(`${t('pages.setting.form.fail')}: ${err.message}`);
    }
  };

  const copyStrEvent = async (val: string) => {
    if (!val) {
      MessagePlugin.warning(t('pages.lab.dataCrypto.message.copyEmpty'));
      return;
    }
    await copyToClipboardApi(val);
    MessagePlugin.info(t('pages.lab.dataCrypto.message.copySuccess'));
  };

  return {
    formData,
    active,
    navList,
    changeNavEvent,
    codeConversionEvent,
    copyStrEvent,
  };
};
