import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { store } from './store';
import i18n from './locales';

import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';

import { Tooltip as TTooltip } from 'tdesign-vue-next';

// 标准的移除加载函数
const removeLoading = () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};

const app = createApp(App);

app.use(store);
app.use(router);
app.use(i18n);
app.use(TTooltip);

app.mount('#home-container').$nextTick(removeLoading);
