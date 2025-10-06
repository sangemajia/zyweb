import { nextTick, reactive, ref, watch, useTemplateRef } from 'vue';
import PLATFORM_CONFIG from '@/config/platform';
import { t } from '@/locales';

// 初始化组件状态
export const useDialogSearchSetup = (props: any, emit: any) => {
  const isVisible = reactive({
    filter: false,
  });
  const formVisible = ref(false); // 控制dialog
  const searchText = ref(props.kw);
  const searchTag = ref('');
  const searchInputRef = useTemplateRef<HTMLInputElement | null>('searchInputRef');
  const VIDEOSITES = [...PLATFORM_CONFIG]; // 视频网站列表

  watch(
    () => formVisible.value,
    (val) => {
      emit('update:visible', val);
    },
  );

  watch(
    () => props.visible,
    (val) => {
      formVisible.value = val;
      if (val) {
        nextTick(() => {
          focusSearchInput();
        });
      }
    },
  );

  watch(
    () => props.kw,
    (val) => {
      searchText.value = val;
    },
  );

  // 自动匹配搜索类型
  watch(
    () => searchText.value,
    (val) => {
      if (val.includes('@')) {
        const patchFlag = val.split('@')[0];
        const patchValue = val.split('@')[1];
        const item = VIDEOSITES.find((item) => item.name === patchFlag || item.id === patchFlag);
        if (item) {
          isVisible.filter = true;
          searchTag.value = `${patchFlag}@`;
          searchText.value = patchValue || '';
        }
      }
    },
  );

  // 删除事件
  const deleteEvent = () => {
    if (!searchText.value && searchTag.value) clearSearchEvent();
  };

  // 清空搜索选项
  const clearSearchEvent = () => {
    isVisible.filter = false;
    searchText.value = '';
    searchTag.value = '';
  };

  // 聚焦 input
  const focusSearchInput = () => {
    if (!searchInputRef.value) return;
    searchInputRef.value.focus();
  };

  // 手动选择搜索源
  const selectFilterSearchEvent = (item: any) => {
    isVisible.filter = true;
    searchTag.value = `${t(`pages.analyze.search.${item.id}`)}@`;
    focusSearchInput();
    if (searchText.value) searchEvent();
  };

  // 搜索
  const searchEvent = () => {
    let searchDomain: string = 'https://so.360kan.com/?kw=';
    if (searchTag.value) {
      const searchTagSplite = searchTag.value.split('@')[0];
      const item: any = VIDEOSITES.find((item) => item.name === searchTagSplite || item.id === searchTagSplite);
      if (Object.keys(item).length > 0) searchDomain = item.search;
    }
    const searchUrl = `${searchDomain}${searchText.value}`;
    console.log(`[analyze][search]${searchUrl}`);
    emit('open-platform', { name: searchText.value, url: searchUrl });
    formVisible.value = false;
  };

  // 关闭 dialog
  const closeDialog = () => {
    isVisible.filter = false;
    searchText.value = '';
    searchTag.value = '';
    formVisible.value = false;
  };

  return {
    isVisible,
    formVisible,
    searchText,
    searchTag,
    searchInputRef,
    VIDEOSITES,
    deleteEvent,
    clearSearchEvent,
    focusSearchInput,
    selectFilterSearchEvent,
    searchEvent,
    closeDialog,
  };
};
