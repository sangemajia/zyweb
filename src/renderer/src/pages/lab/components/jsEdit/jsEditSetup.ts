import { ref, computed, onMounted, onActivated, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingStore } from '@/store';
import { utilsRead, setupData } from './utils/fileUtils';
import { getTemplate } from './utils/opUtils';

export const useJsEditSetup = () => {
  const router = useRouter();
  const storeSetting = useSettingStore();

  const theme = computed(() => storeSetting.displayTheme);
  const tmp = computed(() => {
    return {
      file: '文件管理',
    };
  });

  const form = ref({
    content: {
      js: '',
      html: '',
    },
    rule: {
      pdfa: '',
      pdfh: '',
    },
    template: 'mxpro',
    req: {
      method: 'GET',
      encode: 'UTF-8',
      header: '',
      body: '',
      url: '',
      contentType: 'application/json',
    },
    detail: {
      ids: '',
    },
    category: {
      t: '',
      f: '{}',
      pg: 1,
    },
    search: {
      wd: '',
      pg: 1,
    },
    play: {
      flag: '',
      play: '',
    },
    proxy: {
      url: '',
      upload: '',
    },
    log: {
      nav: '',
    },
    action: '',
    lastEditTime: {
      edit: 0,
      init: 0,
    },
    init: {
      auto: false,
      mode: 't3js',
      log: false,
    },
  });

  const active = ref({
    nav: '',
    template: false,
    action: 'dom',
    editor: 'js',
  });

  const mubanData = ref({});
  const debugId = ref('');

  const termConf = ref({
    fontSize: 14,
    fontFamily: 'JetBrainsMono',
    theme: {
      foreground: theme.value === 'light' ? '#000000' : '#ffffff',
    },
    convertEol: true, //启用时，光标将设置为下一行的开头
    disableStdin: true, //是否应禁用输入
    cursorBlink: true,
    cursorStyle: 'underline',
  });

  const EDIT_CONF = {
    readOnly: false,
    theme: theme.value === 'light' ? 'vs' : 'vs-dark',
    wordWrap: 'on',
    automaticLayout: true,
    folding: true,
    roundedSelection: false,
    overviewRulerBorder: false,
    tabSize: 2,
    insertSpaces: true,
    minimap: {
      enabled: false,
    },
    fixedOverflowWidgets: true,
  };

  const jsEditConf = ref({
    ...EDIT_CONF,
    language: 'javascript',
  });

  const htmlEditConf = ref({
    ...EDIT_CONF,
    language: 'html',
  });

  const controlText = ref<string>('');
  const isWebviewVisible = ref<boolean>(true);

  // watch functions
  const setupWatchers = (logRef: any) => {
    watch(
      () => theme.value,
      (val) => {
        jsEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
        htmlEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';

        if (logRef.value) {
          termConf.value = {
            ...termConf.value,
            theme: {
              foreground: val === 'light' ? '#000000' : '#ffffff',
            },
          };
        }
      },
    );

    watch(
      () => form.value.init.mode,
      (mode) => {
        if (mode === 't3js') {
          jsEditConf.value.language = 'javascript';
        } else if (mode === 't3py') {
          jsEditConf.value.language = 'python';
        } else {
          jsEditConf.value.language = 'javascript';
        }
      },
    );

    watch(
      () => form.value.content.js,
      () => {
        const currentTime = dayjs().unix();
        form.value.lastEditTime.edit = currentTime;
      },
    );
  };

  // lifecycle functions
  const setupLifecycle = (logRef: any, webviewRef: any) => {
    onMounted(() => {
      setupConsole(logRef);
      getTemplate((data) => {
        mubanData.value = data;
      });
      setupData(
        debugId.value,
        (id) => {
          debugId.value = id;
        },
        form.value.init.mode,
        (mode) => {
          form.value.init.mode = mode;
        },
        (content) => {
          form.value.content.js = content;
        },
      );
    });

    onActivated(() => {
      if (active.value.action === 'preview') validateAndRecoverWebview();
    });
  };

  // console functions
  const setupConsole = (logRef: any) => {
    logRef.value?.init();
  };

  const handleConsoleClear = (logRef: any) => {
    console.clear();
    logRef.value?.clear();
  };

  // webview functions
  const validateAndRecoverWebview = async () => {
    // Implementation will be added later
  };

  return {
    theme,
    tmp,
    form,
    active,
    mubanData,
    debugId,
    termConf,
    jsEditConf,
    htmlEditConf,
    controlText,
    isWebviewVisible,
    setupWatchers,
    setupLifecycle,
    setupConsole,
    handleConsoleClear,
    validateAndRecoverWebview,
  };
};
