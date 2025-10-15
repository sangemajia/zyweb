import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './locales';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';

import { Tooltip as TTooltip } from 'tdesign-vue-next';

// 启用现代浏览器特性
import { defineCustomElements } from 'tdesign-vue-next/loader';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(i18n);
app.use(TTooltip);

// 挂载应用
const appInstance = app.mount('#app');

// 启用 Web Components
defineCustomElements(appInstance.$el.ownerDocument.defaultView);

// 启用现代化特性检测
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
