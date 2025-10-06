import { ref, computed } from 'vue';
import { rsa, aes, rc4, des, tripleDES, rabbit, rabbitLegacy, sm4 } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';

// 初始化组件状态
export const useEncodeDecodeSetup = () => {
  const formData = ref({
    input: '',
    output: '',
    rsa: {
      padding: 'PKCS1',
      encode: 'base64',
      key: '',
    },
    crypto: {
      mode: 'cbc',
      padding: 'Pkcs7Padding',
      encode: 'base64',
      iv: '',
      key: '',
      ivEncode: 'utf8',
      keyEncode: 'utf8',
      outputEncode: 'base64',
    },
    sm4: {
      mode: 'cbc',
      padding: 'Pkcs7Padding',
      encode: 'base64',
      iv: '',
      key: '',
      ivEncode: 'utf8',
      keyEncode: 'utf8',
      outputEncode: 'base64',
    },
  });

  const active = ref({
    action: 'rsa',
  });

  const navList = computed(() => {
    return [
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.rsa.name'),
        type_id: 'rsa',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.rc4.name'),
        type_id: 'rc4',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.aes.name'),
        type_id: 'aes',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.des.name'),
        type_id: 'des',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.tripleDES.name'),
        type_id: 'tripleDES',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.rabbit.name'),
        type_id: 'rabbit',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.rabbitLegacy.name'),
        type_id: 'rabbitLegacy',
      },
      {
        type_name: t('pages.lab.dataCrypto.encodeDecode.sm4.name'),
        type_id: 'sm4',
      },
    ];
  });

  const padList = computed(() => {
    return [
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.pkcs7'),
        value: 'Pkcs7Padding',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.ansiX923'),
        value: 'AnsiX923',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.iso10126'),
        value: 'Iso10126',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.iso97971'),
        value: 'Iso97971',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.zeroPadding'),
        value: 'ZeroPadding',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.noPadding'),
        value: 'NoPadding',
      },
    ];
  });

  const modeList = computed(() => {
    return [
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.cbc'),
        value: 'cbc',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.cfb'),
        value: 'cfb',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.ofb'),
        value: 'ofb',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.ctr'),
        value: 'ctr',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.ecb'),
        value: 'ecb',
      },
    ];
  });

  const keyEncodeList = computed(() => {
    return [
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.utf8'),
        value: 'utf8',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.base64'),
        value: 'base64',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.hex'),
        value: 'hex',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.latin1'),
        value: 'latin1',
      },
    ];
  });

  const encodeList = computed(() => {
    return [
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.utf8'),
        value: 'utf8',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.base64'),
        value: 'base64',
      },
      {
        label: t('pages.lab.dataCrypto.encodeDecode.crypto.hex'),
        value: 'hex',
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
      const input = formData.value.input;
      if (type === 'encode') {
        if (active.value.action === 'rc4') {
          const { encode, key, keyEncode, outputEncode } = formData.value.crypto;
          if (!input || !key) {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
            return;
          }
          if (outputEncode === 'utf8') {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.encodeDecode.crypto.message.encodeNotUtf8')}`);
            return;
          }
          formData.value.output = rc4.encode(input, key, encode, keyEncode, outputEncode);
        } else if (active.value.action === 'rsa') {
          if (!input || !formData.value.rsa.key) {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
            return;
          }
          formData.value.output = rsa.encode(
            input,
            formData.value.rsa.key,
            formData.value.rsa.padding,
            formData.value.rsa.encode,
            1,
            1,
            true,
          );
        } else if (['aes', 'des', 'tripleDES', 'rabbit', 'rabbitLegacy', 'sm4'].includes(active.value.action)) {
          const data = active.value.action === 'sm4' ? formData.value.sm4 : formData.value.crypto;
          const { mode, padding, encode, iv, key, ivEncode, keyEncode, outputEncode } = data;
          if (!input || !key) {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
            return;
          }
          if (outputEncode === 'utf8') {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.encodeDecode.crypto.message.encodeNotUtf8')}`);
            return;
          }
          const methodMap = {
            des: des,
            aes: aes,
            tripleDES: tripleDES,
            rabbit: rabbit,
            rabbitLegacy: rabbitLegacy,
            sm4: sm4,
          };
          formData.value.output = methodMap[active.value.action].encode(
            input,
            key,
            mode,
            padding,
            encode,
            iv,
            keyEncode,
            ivEncode,
            outputEncode,
          );
        }
      } else {
        if (active.value.action === 'rc4') {
          const { encode, key, keyEncode, outputEncode } = formData.value.crypto;
          if (!input || !key) {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
            return;
          }
          if (encode === 'utf8') {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.encodeDecode.crypto.message.decodeNotUtf8')}`);
            return;
          }
          formData.value.output = rc4.decode(input, key, encode, keyEncode, outputEncode);
        } else if (active.value.action === 'rsa') {
          if (!input || !formData.value.rsa.key) {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
            return;
          }
          formData.value.output = rsa.decode(
            input,
            formData.value.rsa.key,
            formData.value.rsa.padding,
            formData.value.rsa.encode,
            1,
            1,
            true,
          );
        } else if (['aes', 'des', 'tripleDES', 'rabbit', 'rabbitLegacy', 'sm4'].includes(active.value.action)) {
          const data = active.value.action === 'sm4' ? formData.value.sm4 : formData.value.crypto;
          const { mode, padding, encode, iv, key, ivEncode, keyEncode, outputEncode } = data;
          if (!input || !key) {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.message.inputEmpty')}`);
            return;
          }
          if (encode === 'utf8') {
            MessagePlugin.warning(`${t('pages.lab.dataCrypto.encodeDecode.crypto.message.decodeNotUtf8')}`);
            return;
          }
          const methodMap = {
            des: des,
            aes: aes,
            tripleDES: tripleDES,
            rabbit: rabbit,
            rabbitLegacy: rabbitLegacy,
            sm4: sm4,
          };
          formData.value.output = methodMap[active.value.action].decode(
            input,
            key,
            mode,
            padding,
            encode,
            iv,
            keyEncode,
            ivEncode,
            outputEncode,
          );
        }
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
    padList,
    modeList,
    keyEncodeList,
    encodeList,
    changeNavEvent,
    codeConversionEvent,
    copyStrEvent,
  };
};
