import { createApp } from 'vue';
import HomePage from './index.vue';

// 创建应用实例
const app = createApp(HomePage);

// 挂载应用到home-container
app.mount('#home-container');