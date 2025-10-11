<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view />
    <!-- 需脱离文档流, 不然会影响后面dom渲染问题 -->
    <disclaimer-view v-model:visible="active.disclaimer" style="position: fixed; z-index: 999" />
  </t-config-provider>
</template>

<script setup lang="ts">
import { useLocalStorage, useScriptTag, usePreferredDark } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

import { localeConfigKey } from '@/locales/index';
import { useLocale } from '@/locales/useLocale';
import { usePlayStore, useSettingStore } from '@/store';
import { fetchSetup } from '@/api/setting';
import PLAY_CONFIG from '@/config/play';

import DisclaimerView from '@/pages/Disclaimer.vue';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();
const { getComponentsLocale, changeLocale } = useLocale();
const systemDark = usePreferredDark();
const pagespySrcipt = useScriptTag(
  'https://pagespy.jikejishu.com/page-spy/index.min.js',
  () => {
    // @ts-ignore
    window.$pageSpy = new PageSpy({
      api: 'pagespy.jikejishu.com',
      clientOrigin: 'https://pagespy.jikejishu.com',
      project: 'zyfun',
      autoRender: true,
      title: 'zyfun for debug',
    });
  },
  { manual: true },
);

const active = ref({
  disclaimer: false,
});

// 监听系统主题变化
const watchSystemTheme = (callback: (theme: 'light' | 'dark') => void) => {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    callback(e.matches ? 'dark' : 'light');
  });
};

onMounted(() => {
  // 监听系统主题变化
  watchSystemTheme((theme) => {
    if (storeSetting.mode === 'auto') {
      storeSetting.updateConfig({ theme });
      storeSetting.changeMode('auto');
    }
  });
  
  initConfig();
});

watch(
  () => useLocalStorage(localeConfigKey, 'zh_CN').value,
  (val) => changeLocale(val),
);
watch(
  () => [systemDark.value, storeSetting.getStateMode],
  (newVal, oldVal) => {
    const [newDark, newMode] = newVal;
    const [oldDark, oldMode] = oldVal;

    if (newMode !== oldMode) {
      storeSetting.changeMode(newMode as 'auto' | 'dark' | 'light');
    }
    if (newDark !== oldDark) {
      if (newMode === 'auto') {
        const theme = newDark ? 'dark' : 'light';
        storeSetting.updateConfig({ theme });
        storeSetting.changeMode(theme);
      }
    }
  },
);

const initConfig = async () => {
  try {
    const { agreementMask, theme, playerMode, barrage, timeout, debug } = await fetchSetup();

    storeSetting.updateConfig({
      mode: theme,
      timeout: timeout || 5000,
    });
    active.value.disclaimer = !agreementMask;

    const init = Object.assign({ ...PLAY_CONFIG.setting }, { playerMode, barrage });
    storePlayer.updateConfig({ setting: init });

    if (debug) await pagespySrcipt.load();
  } catch (error) {
    console.error('[App] Failed to initialize config:', error);
    // 使用默认配置
    storeSetting.updateConfig({
      mode: 'light',
      timeout: 5000,
    });
  }
};
</script>
