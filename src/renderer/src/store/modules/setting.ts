import { defineStore } from 'pinia';

import SYSTEM_CONFIG from '@/config/system';
import { store } from '@/store';

import { ModeType } from '@/types/interface';

const state: Record<string, any> = {
  ...SYSTEM_CONFIG,
};

export type TState = typeof state;
export type TStateKey = keyof typeof state;

export const useSettingStore = defineStore('setting', {
  state: () => state,
  getters: {
    getStateMode: (state): ModeType | 'auto' => {
      return state.mode as ModeType | 'auto';
    },
    displayMode: (state): ModeType => {
      if (state.mode === 'auto') {
        // 使用系统主题检测
        return getSystemTheme();
      }
      return state.mode as ModeType;
    },
    displayTheme: (state): ModeType => {
      return state.theme as ModeType;
    },
  },
  actions: {
    changeMode(mode: ModeType | 'auto') {
      let theme = mode;

      if (mode === 'auto') {
        theme = this.getMediaColor();
      }
      const isDarkMode = theme === 'dark';

      document.documentElement.setAttribute('theme-mode', isDarkMode ? 'dark' : 'light');
    },
    getMediaColor() {
      // 使用系统主题检测
      return getSystemTheme();
    },
    updateConfig(payload: Partial<TState>) {
      for (const key in payload) {
        if (payload[key as TStateKey] !== undefined) {
          this[key as TStateKey] = payload[key as TStateKey];
        }
        if (key === 'mode') {
          this.changeMode(payload[key]);
          this.theme = payload[key] === 'auto' ? this.getMediaColor() : payload[key];
        }
      }
    },
  },
  persist: true, // 数据持久化
});

// 获取系统主题
const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export function getSettingStore() {
  return useSettingStore(store);
}
