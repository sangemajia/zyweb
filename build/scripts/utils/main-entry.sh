#!/bin/bash

# 主入口文件生成脚本
# 生成统一的主入口文件main.js

# 生成主入口文件
generate_main_entry() {
    local js_dir="$1"
    local layouts_dir="$2"
    
    # 创建主入口文件
    cat > "$js_dir/main.js" << 'EOF'
// 主入口文件
// 统一管理所有路由和应用初始化

// 使用全局变量替代模块导入
const { createApp, defineAsyncComponent } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;
const { createPinia } = Pinia;

// 共享组件
const ZyWebSharedComponents = window.ZyWebSharedComponents || {};

// 布局组件
const MainLayout = window.MainLayout || {};

// 异步加载组件的辅助函数
const loadComponent = (path) => {
  return defineAsyncComponent({
    loader: () => import(path),
    delay: 200,
    timeout: 3000
  });
};

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: MainLayout,
    children: [
      { path: '', name: 'home-main', component: () => import('./home.js') },
      { path: 'index', name: 'home-index', component: () => import('./home.js') }
    ]
  },
  {
    path: '/film',
    name: 'film',
    component: MainLayout,
    children: [
      { path: '', name: 'film-main', component: () => import('./film.js') },
      { path: 'index', name: 'film-index', component: () => import('./film.js') }
    ]
  },
  {
    path: '/iptv',
    name: 'iptv',
    component: MainLayout,
    children: [
      { path: '', name: 'iptv-main', component: () => import('./iptv.js') },
      { path: 'index', name: 'iptv-index', component: () => import('./iptv.js') }
    ]
  },
  {
    path: '/drive',
    name: 'drive',
    component: MainLayout,
    children: [
      { path: '', name: 'drive-main', component: () => import('./drive.js') },
      { path: 'index', name: 'drive-index', component: () => import('./drive.js') }
    ]
  },
  {
    path: '/play',
    name: 'play',
    component: MainLayout,
    children: [
      { path: '', name: 'play-main', component: () => import('./play.js') },
      { path: 'index', name: 'play-index', component: () => import('./play.js') }
    ]
  },
  {
    path: '/analyze',
    name: 'analyze',
    component: MainLayout,
    children: [
      { path: '', name: 'analyze-main', component: () => import('./analyze.js') },
      { path: 'index', name: 'analyze-index', component: () => import('./analyze.js') }
    ]
  },
  {
    path: '/chase',
    name: 'chase',
    component: MainLayout,
    children: [
      { path: '', name: 'chase-main', component: () => import('./chase.js') },
      { path: 'index', name: 'chase-index', component: () => import('./chase.js') }
    ]
  },
  {
    path: '/setting',
    name: 'setting',
    component: MainLayout,
    children: [
      { path: '', name: 'setting-main', component: () => import('./setting.js') },
      { path: 'index', name: 'setting-index', component: () => import('./setting.js') }
    ]
  },
  {
    path: '/lab',
    name: 'lab',
    component: MainLayout,
    children: [
      { path: '', name: 'lab-main', component: () => import('./lab.js') },
      { path: 'index', name: 'lab-index', component: () => import('./lab.js') }
    ]
  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 创建Pinia实例
const pinia = createPinia();

// 创建应用实例
const app = createApp({});

// 注册全局组件
if (ZyWebSharedComponents.MediaCard) {
  app.component('MediaCard', ZyWebSharedComponents.MediaCard);
}

// 使用插件
app.use(router);
app.use(pinia);

// 挂载应用
app.mount('#app');

// 标准的移除加载函数
const removeLoading = () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
};

// 在下一个tick移除加载元素
router.isReady().then(() => {
  removeLoading();
});
EOF
    
    return 0
}