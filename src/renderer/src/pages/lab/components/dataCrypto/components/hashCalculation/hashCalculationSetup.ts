import { computed, ref } from 'vue';
import { hash, hmac } from '@/utils/crypto';
import { copyToClipboardApi } from '@/utils/tool';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';

// 初始化组件状态
export const useHashCalculationSetup = () => {
  const formData = ref({
    input: '',
    key: '',
    output: {
      md516: '',
      md532: '',
      sha1: '',
      sha224: '',
      sha256: '',
      sha3: '',
      sha384: '',
      sha512: '',
      ripemd160: '',
    },
  });

  const active = ref({
    action: 'hash',
  });

  const navList = computed(() => {
    return [
      {
        type_name: t('pages.lab.dataCrypto.hashCalculation.nav.hash'),
        type_id: 'hash',
      },
      {
        type_name: t('pages.lab.dataCrypto.hashCalculation.nav.hmac'),
        type_id: 'hmac',
      },
    ];
  });

  const defaultConf = () => {
    formData.value.output = {
      md516: '',
      md532: '',
      sha1: '',
      sha224: '',
      sha256: '',
      sha3: '',
      sha384: '',
      sha512: '',
      ripemd160: '',
    };
  };

  const changeNavEvent = (val: string) => {
    active.value.action = val;

    formData.value.input = '';
    formData.value.key = '';
    defaultConf();
  };

  const inputChangeEvent = (val: string) => {
    const type = active.value.action;

    if (!val) {
      defaultConf();
      return;
    }

    if (type === 'hash') {
      formData.value.output.md516 = hash['md5-16'](val);
      formData.value.output.md532 = hash['md5-32'](val);
      formData.value.output.sha1 = hash.sha1(val);
      formData.value.output.sha224 = hash.sha224(val);
      formData.value.output.sha256 = hash.sha256(val);
      formData.value.output.sha3 = hash.sha3(val);
      formData.value.output.sha384 = hash.sha384(val);
      formData.value.output.sha512 = hash.sha512(val);
      formData.value.output.ripemd160 = hash.ripemd160(val);
    } else if (type === 'hmac') {
      const key = formData.value.key;
      if (!key) {
        defaultConf();
        return;
      }

      formData.value.output.md516 = hmac['md5-16'](val, key);
      formData.value.output.md532 = hmac['md5-32'](val, key);
      formData.value.output.sha1 = hmac.sha1(val, key);
      formData.value.output.sha224 = hmac.sha224(val, key);
      formData.value.output.sha256 = hmac.sha256(val, key);
      formData.value.output.sha3 = hmac.sha3(val, key);
      formData.value.output.sha384 = hmac.sha384(val, key);
      formData.value.output.sha512 = hmac.sha512(val, key);
      formData.value.output.ripemd160 = hmac.ripemd160(val, key);
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
    inputChangeEvent,
    copyStrEvent,
  };
};
