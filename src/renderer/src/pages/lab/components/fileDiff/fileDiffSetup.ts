import { computed, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

// 初始化组件状态
export const useFileDiffSetup = () => {
  const storeSetting = useSettingStore();

  const theme = computed(() => storeSetting.displayTheme);
  const form = ref({
    target: '',
    origin: '',
  });
  const active = ref({
    nav: '',
    clickType: '',
  });
  const diffEditConf = ref({
    theme: theme.value === 'light' ? 'vs' : 'vs-dark',
    enableSplitViewResizing: true, // 是否允许拖动分割线
    originalEditable: true, // 是否允许编辑原始文本
    renderSideBySide: true, // 是否渲染为并排模式(不生效)
    wordWrap: 'on',
    readOnly: false,
    automaticLayout: true,
    folding: true,
    roundedSelection: false,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    fixedOverflowWidgets: true,
  });

  watch(
    () => theme.value,
    (val) => {
      diffEditConf.value.theme = val === 'light' ? 'vs' : 'vs-dark';
    },
  );

  const importFileEvent = async (type: string) => {
    try {
      const res = await window.electron.ipcRenderer.invoke('manage-dialog', {
        action: 'showOpenDialog',
        config: {
          properties: ['openFile', 'showHiddenFiles'],
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'Json Files', extensions: ['json'] },
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

      form.value[type] = fileContent || '';
      MessagePlugin.success(t('pages.setting.data.success'));
    } catch (err: any) {
      console.error(`[importFileEvent] err:`, err);
      MessagePlugin.error(`${t('pages.setting.data.fail')}: ${err.message}`);
    }
  };

  const handleOpChange = (type: string) => {
    active.value.nav = '';

    switch (type) {
      case 'origin':
        importFileEvent('origin');
        break;
      case 'target':
        importFileEvent('target');
        break;
    }
  };

  return {
    form,
    active,
    diffEditConf,
    handleOpChange,
  };
};
