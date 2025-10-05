import { createApp } from 'vue';

// 引入 Web 适配层
import '../../web-adaptor/index';

// 按需导入功能模块
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
      throw new Error(`Unknown module: ${moduleName}`);
  }
};

// 导出应用实例和加载函数
export { app, loadModule };