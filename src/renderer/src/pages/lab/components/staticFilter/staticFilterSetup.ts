import { ref, watch } from 'vue';
import { useSettingStore } from '@/store';

export const useStaticFilterSetup = () => {
  const store = useSettingStore();

  const form = ref({
    codeType: 'html',
    content: {
      debug: '',
      source: '',
      text: '',
    },
    nav: 'debug',
    action: '',
    clickType: {
      debug: '',
      source: '',
    },
    class_parse: '',
    class_name: '',
    class_url: '',
    cate_exclude: '首页|留言|APP|下载|资讯|新闻|动态',
    reurl: '',
    filter: '',
    filterInfo: '',
    exclude_keys: '',
    classResult: {},
    matchs: {
      // plot: 'show(.*?)/id',
      // area: 'show(.*?)/id',
      // lang: '(/lang.*?)\.html@@',
      // year: '(/year.*?)\.html@@',
      // letter: '(/letter.*?)\.html@@',
      // sort: '(/by.*?)/id'
    },
  });

  const reqFormData = ref({
    method: 'GET',
    url: '',
    encode: 'UTF-8',
    header: '',
    contentType: 'application/json',
    body: '',
  });

  const active = ref({
    nav: '',
    reqParam: false,
    batchFetchLoading: false,
  });

  const codeEditConf = ref({
    language: 'javascript',
    readOnly: true,
    theme: store.displayMode === 'light' ? 'vs' : 'vs-dark',
    automaticLayout: true,
    folding: true,
    roundedSelection: false,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    fixedOverflowWidgets: true,
  });

  // watch functions
  const setupWatchers = (setCodeEditConf: (conf: any) => void) => {
    watch(
      () => store.displayMode,
      (val) => {
        setCodeEditConf({ ...codeEditConf.value, theme: val === 'light' ? 'vs' : 'vs-dark' });
      },
    );
  };

  return {
    form,
    reqFormData,
    active,
    codeEditConf,
    setupWatchers,
  };
};
