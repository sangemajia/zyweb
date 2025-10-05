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

// 缓存已加载的模块
const moduleCache = new Map();

// 按需加载功能模块的函数
export const loadModule = async (moduleName: string) => {
  console.log(`正在加载模块: ${moduleName}`);
  
  // 检查缓存中是否已存在该模块
  if (moduleCache.has(moduleName)) {
    console.log(`从缓存中获取模块: ${moduleName}`);
    return moduleCache.get(moduleName);
  }
  
  // 根据模块名称动态加载对应的模块
  let module;
  switch (moduleName) {
    case 'film':
      module = await import('./pages/film/index.vue');
      break;
    case 'iptv':
      module = await import('./pages/iptv/index.vue');
      break;
    case 'drive':
      module = await import('./pages/drive/index.vue');
      break;
    case 'play':
      module = await import('./pages/play/index.vue');
      break;
    case 'analyze':
      module = await import('./pages/analyze/index.vue');
      break;
    case 'chase':
      module = await import('./pages/chase/index.vue');
      break;
    case 'setting':
      module = await import('./pages/setting/index.vue');
      break;
    case 'lab':
      module = await import('./pages/lab/index.vue');
      break;
    case 'test':
      module = await import('./pages/test/index.vue');
      break;
    default:
      throw new Error(`未知模块: ${moduleName}`);
  }
  
  // 将模块存入缓存
  moduleCache.set(moduleName, module);
  console.log(`模块 ${moduleName} 加载完成并已缓存`);
  
  return module;
};

// 预加载常用模块的函数
export const preloadModules = async (moduleNames: string[]) => {
  console.log(`正在预加载模块: ${moduleNames.join(', ')}`);
  
  // 创建一个 Promise 数组来并行加载所有模块
  const loadPromises = moduleNames.map(moduleName => loadModule(moduleName));
  
  // 等待所有模块加载完成
  return await Promise.all(loadPromises);
};

// 动态加载共享组件的函数
export const loadSharedComponent = async (componentName: string) => {
  console.log(`正在加载共享组件: ${componentName}`);
  
  // 检查缓存中是否已存在该组件
  if (moduleCache.has(`shared-${componentName}`)) {
    console.log(`从缓存中获取共享组件: ${componentName}`);
    return moduleCache.get(`shared-${componentName}`);
  }
  
  // 根据组件名称动态加载对应的共享组件
  let component;
  switch (componentName) {
    case 'button':
      component = await import('./components/shared/SharedButton.vue');
      break;
    case 'card':
      component = await import('./components/shared/SharedCard.vue');
      break;
    default:
      throw new Error(`未知共享组件: ${componentName}`);
  }
  
  // 将组件存入缓存
  moduleCache.set(`shared-${componentName}`, component);
  console.log(`共享组件 ${componentName} 加载完成并已缓存`);
  
  return component;
};

// 动态加载共享工具函数的函数
export const loadSharedUtils = async () => {
  console.log('正在加载共享工具函数');
  
  // 检查缓存中是否已存在工具函数
  if (moduleCache.has('shared-utils')) {
    console.log('从缓存中获取共享工具函数');
    return moduleCache.get('shared-utils');
  }
  
  // 加载共享工具函数
  const utils = await import('./utils/shared-utils');
  
  // 将工具函数存入缓存
  moduleCache.set('shared-utils', utils);
  console.log('共享工具函数加载完成并已缓存');
  
  return utils;
};

// 导出应用实例和加载函数
export { app, loadModule, preloadModules, loadSharedComponent, loadSharedUtils };