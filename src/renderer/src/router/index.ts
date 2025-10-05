import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

// 固定路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/film/index',
  },
];

// 动态导入所有homepage路由
const homepageModules = import.meta.glob('./modules/**/homepage.ts', { eager: true });

// 转换模块路由
function mapModuleRouterList(modules: Record<string, unknown>): Array<RouteRecordRaw> {
  const routerList: Array<RouteRecordRaw> = [];
  Object.keys(modules).forEach((key) => {
    // @ts-ignore
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

// homepage路由
export const homepageRouterList: Array<RouteRecordRaw> = mapModuleRouterList(homepageModules);

// 所有路由
export const allRoutes = [...homepageRouterList, ...defaultRouterList];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
});

export default router;