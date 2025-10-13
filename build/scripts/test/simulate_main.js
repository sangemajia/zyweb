// 模拟浏览器环境
global.window = {};
global.document = {
  getElementById: function(id) {
    if (id === 'app') {
      return {
        children: []
      };
    }
    return null;
  }
};

// 模拟Vue
global.Vue = {
  createApp: function() {
    console.log('Vue.createApp called');
    return {
      component: function(name, component) {
        console.log('注册组件:', name);
        return this;
      },
      use: function(plugin) {
        console.log('使用插件:', plugin);
        return this;
      },
      mount: function(selector) {
        console.log('挂载应用到:', selector);
        return this;
      }
    };
  },
  defineAsyncComponent: function() {
    console.log('Vue.defineAsyncComponent called');
  }
};

// 模拟VueRouter
global.VueRouter = {
  createRouter: function() {
    console.log('VueRouter.createRouter called');
    return {};
  },
  createWebHashHistory: function() {
    console.log('VueRouter.createWebHashHistory called');
    return {};
  }
};

// 模拟Pinia
global.Pinia = {
  createPinia: function() {
    console.log('Pinia.createPinia called');
    return {};
  }
};

// 模拟MainLayout
global.window.MainLayout = {
  __name: 'MainLayout',
  setup: function() {},
  template: '<div>MainLayout</div>'
};

// 模拟ZyWebSharedComponents
global.window.ZyWebSharedComponents = {
  MediaCard: {
    __name: 'MediaCard'
  }
};

console.log('开始执行main.js模拟测试...');

// 尝试执行main.js的部分代码
try {
  console.log('开始执行main.js...');
  // 使用全局变量替代模块导入
  const createApp = Vue.createApp;
  const defineAsyncComponent = Vue.defineAsyncComponent;
  const createRouter = VueRouter.createRouter;
  const createWebHashHistory = VueRouter.createWebHashHistory;
  const createPinia = Pinia.createPinia;
  
  console.log('Vue API获取成功');
  
  // 共享组件
  const ZyWebSharedComponents = window.ZyWebSharedComponents || {};
  console.log('共享组件:', Object.keys(ZyWebSharedComponents));

  // 布局组件
  const MainLayout = window.MainLayout || {};
  console.log('MainLayout组件:', MainLayout);

  // 异步加载组件的辅助函数
  const loadComponent = (path) => {
    console.log('加载组件:', path);
    return defineAsyncComponent({
      loader: () => {
        console.log('加载组件模块:', path);
        return Promise.resolve({});
      },
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
        { path: '', name: 'home-main', component: () => {
            console.log('加载home.js');
            return Promise.resolve({});
          } 
        },
        { path: 'index', name: 'home-index', component: () => {
            console.log('加载home.js index');
            return Promise.resolve({});
          } 
        }
      ]
    }
  ];
  console.log('路由配置完成');

  // 创建路由实例
  const router = createRouter({
    history: createWebHashHistory(),
    routes
  });
  console.log('路由实例创建成功');

  // 创建Pinia实例
  const pinia = createPinia();
  console.log('Pinia实例创建成功');

  // 创建应用实例
  const app = createApp({});
  console.log('Vue应用实例创建成功');

  // 注册全局组件
  if (ZyWebSharedComponents.MediaCard) {
    app.component('MediaCard', ZyWebSharedComponents.MediaCard);
  }

  // 使用插件
  app.use(router);
  app.use(pinia);

  // 挂载应用
  console.log('开始挂载应用...');
  app.mount('#app');
  console.log('应用挂载完成');
  
} catch (error) {
  console.error('main.js执行错误:', error);
}