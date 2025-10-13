// 简单的测试脚本
console.log('开始测试...');

// 模拟浏览器环境
global.window = {
  ZyWebSharedComponents: {
    MediaCard: { __name: 'MediaCard' }
  },
  MainLayout: { __name: 'MainLayout', template: '<div>MainLayout</div>' },
  HomePage: { __name: 'HomePage' },
  addEventListener: function(event, handler) {
    console.log('addEventListener called for:', event);
  },
  removeEventListener: function(event, handler) {
    console.log('removeEventListener called for:', event);
  }
};

global.document = {
  getElementById: function(id) {
    console.log('getElementById called with:', id);
    if (id === 'app') {
      return {
        children: []
      };
    }
    return null;
  },
  createElement: function(tag) {
    console.log('createElement called with:', tag);
    return {
      tagName: tag.toUpperCase(),
      style: {}
    };
  },
  head: {
    appendChild: function(element) {
      console.log('appendChild to head:', element);
    }
  }
};

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
  },
  defineComponent: function(config) {
    console.log('Vue.defineComponent called');
    return config;
  },
  ref: function(value) {
    console.log('Vue.ref called with:', value);
    return { value: value };
  },
  resolveComponent: function(name) {
    console.log('Vue.resolveComponent called with:', name);
    return { __name: name };
  },
  createElementBlock: function() {
    console.log('Vue.createElementBlock called');
  },
  openBlock: function() {
    console.log('Vue.openBlock called');
  },
  createElementVNode: function() {
    console.log('Vue.createElementVNode called');
  },
  createCommentVNode: function() {
    console.log('Vue.createCommentVNode called');
  },
  Fragment: {},
  renderList: function() {
    console.log('Vue.renderList called');
  },
  createVNode: function() {
    console.log('Vue.createVNode called');
  },
  withCtx: function(fn) {
    console.log('Vue.withCtx called');
    return fn;
  },
  normalizeStyle: function(style) {
    console.log('Vue.normalizeStyle called with:', style);
    return style;
  },
  createTextVNode: function() {
    console.log('Vue.createTextVNode called');
  },
  createBlock: function() {
    console.log('Vue.createBlock called');
  },
  unref: function(ref) {
    console.log('Vue.unref called');
    return ref;
  },
  createApp: function() {
    console.log('Vue.createApp called');
    return {
      component: function(name, component) {
        console.log('注册组件:', name);
        return this;
      },
      use: function(plugin) {
        console.log('使用插件');
        return this;
      },
      mount: function(selector) {
        console.log('挂载应用到:', selector);
        return this;
      }
    };
  },
  toDisplayString: function(str) {
    console.log('Vue.toDisplayString called with:', str);
    return str;
  }
};

global.VueRouter = {
  createRouter: function(config) {
    console.log('VueRouter.createRouter called with config:', Object.keys(config));
    return {
      isReady: function() {
        console.log('router.isReady called');
        return Promise.resolve();
      }
    };
  },
  createWebHashHistory: function() {
    console.log('VueRouter.createWebHashHistory called');
    return {};
  },
  useRouter: function() {
    console.log('VueRouter.useRouter called');
    return { push: function() { console.log('router.push called'); } };
  }
};

global.Pinia = {
  createPinia: function() {
    console.log('Pinia.createPinia called');
    return {};
  },
  defineStore: function() {
    console.log('Pinia.defineStore called');
    return function() {};
  },
  storeToRefs: function() {
    console.log('Pinia.storeToRefs called');
    return function() {};
  }
};

console.log('环境模拟完成，开始执行main.js...');

// 读取并执行main.js
const fs = require('fs');
const mainJsContent = fs.readFileSync('/workspace/zyweb/dist/app/ui/js/main.js', 'utf8');

try {
  eval(mainJsContent);
  console.log('main.js执行完成');
} catch (error) {
  console.error('执行错误:', error.message);
  console.error('错误堆栈:', error.stack);
}