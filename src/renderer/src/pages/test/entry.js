import { createApp } from 'vue';
import TestPage from './index.vue';

// 创建应用实例
const app = createApp(TestPage);

// 挂载应用
app.mount('#app');