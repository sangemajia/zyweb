import { createPinia } from 'pinia';

// 创建store实例
export const store = createPinia();

// 导出各个store模块
export { usePlayStore } from './modules/play';
export { useSettingStore } from './modules/setting';

export default store;
