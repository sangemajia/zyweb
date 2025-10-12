import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

// 导入homepage路由模块
const homepageModules = import.meta.glob('./router/modules/**/homepage.ts', { eager: true });

// 转换模块路由
function mapModuleRouterList(modules) {
  const routerList = [];
  Object.keys(modules).forEach((key) => {
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

// homepage路由
const homepageRouterList = mapModuleRouterList(homepageModules);

// 固定路由
const defaultRouterList = [
  {
    path: '/',
    redirect: '/home',
  },
];

// 所有路由
const allRoutes = [...homepageRouterList, ...defaultRouterList];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
});

// 导入主布局组件
import MainLayout from './layouts/MainLayout.vue';

// 创建应用实例
const app = createApp(MainLayout);

// 使用路由
app.use(router);

// 挂载应用
app.mount('#home-container');