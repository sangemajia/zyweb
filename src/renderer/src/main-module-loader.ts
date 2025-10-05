import { createApp } from 'vue';

// 引入 Web 适配层
import '../../web-adaptor/index';

import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './locales';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';

import { Tooltip as TTooltip } from 'tdesign-vue-next';

// 创建应用实例
const app = createApp(App);

// 注册插件
app.use(store);
app.use(router);
app.use(i18n);
app.use(TTooltip);

// 挂载应用
app.mount('#app').$nextTick(window.removeLoading);

// 按需加载功能模块的函数
export const loadModule = async (moduleName) => {
  console.log(`正在加载模块: ${moduleName}`);
  
  // 根据模块名称动态加载对应的模块
  switch (moduleName) {
    case 'film':
      return await import('./pages/film/index.vue');
    case 'iptv':
      return await import('./pages/iptv/index.vue');
    case 'drive':
      return await import('./pages/drive/index.vue');
    case 'play':
      return await import('./pages/play/index.vue');
    case 'analyze':
      return await import('./pages/analyze/index.vue');
    case 'chase':
      return await import('./pages/chase/index.vue');
    case 'setting':
      return await import('./pages/setting/index.vue');
    case 'lab':
      return await import('./pages/lab/index.vue');
    case 'test':
      return await import('./pages/test/index.vue');
    default:
      throw new Error(`未知模块: ${moduleName}`);
  }
};

// 预加载常用模块的函数
export const preloadModules = async (moduleNames) => {
  console.log(`正在预加载模块: ${moduleNames.join(', ')}`);
  
  // 创建一个 Promise 数组来并行加载所有模块
  const loadPromises = moduleNames.map(moduleName => loadModule(moduleName));
  
  // 等待所有模块加载完成
  return await Promise.all(loadPromises);
};

// 导出应用实例和加载函数
export { app, loadModule, preloadModules };