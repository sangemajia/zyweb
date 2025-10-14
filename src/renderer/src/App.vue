<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view />
  </t-config-provider>
</template>

<script setup lang="ts">
import { useLocalStorage, usePreferredDark } from '@vueuse/core';
import { onMounted, watch } from 'vue';

import { localeConfigKey } from '@/locales/index';
import { useLocale } from '@/locales/useLocale';
import { usePlayStore, useSettingStore } from '@/store';
import { fetchSetup } from '@/api/setting';
import PLAY_CONFIG from '@/config/play';

const storePlayer = usePlayStore();
const storeSetting = useSettingStore();
const { getComponentsLocale, changeLocale } = useLocale();
const systemDark = usePreferredDark();

watch(
  () => useLocalStorage(localeConfigKey, 'zh_CN').value,
  (val) => changeLocale(val)
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

onMounted(() => {
  initConfig();
});

const initConfig = async () => {
  try {
    const { theme, playerMode, barrage, timeout } = await fetchSetup();

    storeSetting.updateConfig({
      mode: theme,
      timeout: timeout || 5000
    });

    const init = Object.assign(
      { ...PLAY_CONFIG.setting },
      { playerMode, barrage }
    )
    storePlayer.updateConfig({ setting: init });
  } catch (error) {
    console.error('初始化配置失败:', error);
    // 使用默认配置
    storeSetting.updateConfig({
      mode: 'light',
      timeout: 5000
    });
  }
};
</script>
