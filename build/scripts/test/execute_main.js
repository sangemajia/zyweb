// 简单的测试脚本
console.log('开始测试...');

// 模拟XMLHttpRequest
global.XMLHttpRequest = function() {
  this.open = function() {};
  this.send = function() {};
  this.setRequestHeader = function() {};
};

// 模拟document
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
      tagName: tag.toUpperCase()
    };
  },
  head: {
    appendChild: function(element) {
      console.log('appendChild to head:', element);
    }
  }
};

// 模拟window
global.window = global;

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
        console.log('使用插件');
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
global.MainLayout = {
  __name: 'MainLayout',
  setup: function() {},
  template: '<div>MainLayout</div>'
};

// 模拟ZyWebSharedComponents
global.ZyWebSharedComponents = {
  MediaCard: {
    __name: 'MediaCard'
  }
};

console.log('环境模拟完成，开始执行main.js...');

// 读取并执行main.js
const fs = require('fs');
const mainJsContent = fs.readFileSync('/workspace/zyweb/dist/app/ui/js/main.js', 'utf8');

// 移除ES6模块语法
const cleanedContent = mainJsContent
  .replace(/import\([^)]+\);?/g, '// import removed')
  .replace(/export default [^;]+;?/g, '// export default removed');

try {
  eval(cleanedContent);
  console.log('main.js执行完成');
} catch (error) {
  console.error('执行错误:', error.message);
}