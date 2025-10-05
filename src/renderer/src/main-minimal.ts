import { createApp } from 'vue';
import App from './App.vue';

// 创建一个最小化的应用实例
const app = createApp(App);

// 挂载应用
app.mount('#app');

// 简单的加载完成函数
window.removeLoading = () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};