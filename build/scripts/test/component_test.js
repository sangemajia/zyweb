const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runComponentTest() {
  try {
    console.log('开始组件测试...');
    
    // 监听JavaScript错误
    browser.on('error', function(error) {
      console.log('JavaScript错误:', error);
    });
    
    browser.on('resourceError', function(error) {
      console.log('资源加载错误:', error);
    });
    
    browser.on('timeout', function() {
      console.log('页面加载超时');
    });
    
    // 访问首页
    console.log('访问 http://127.0.0.1:8819');
    await browser.visit('http://127.0.0.1:8819');
    console.log('访问成功');
    console.log('状态码:', browser.status);
    console.log('标题:', browser.text('title'));
    
    // 等待一段时间让JavaScript执行
    console.log('等待JavaScript执行...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 检查Vue是否加载
    console.log('检查Vue是否加载...');
    const vueLoaded = await browser.evaluate('typeof Vue !== "undefined"');
    console.log('Vue是否加载:', vueLoaded);
    
    if (vueLoaded) {
      console.log('检查Vue版本...');
      const vueVersion = await browser.evaluate('Vue.version');
      console.log('Vue版本:', vueVersion);
    }
    
    // 检查VueRouter是否加载
    console.log('检查VueRouter是否加载...');
    const vueRouterLoaded = await browser.evaluate('typeof VueRouter !== "undefined"');
    console.log('VueRouter是否加载:', vueRouterLoaded);
    
    if (vueRouterLoaded) {
      console.log('检查VueRouter版本...');
      const vueRouterVersion = await browser.evaluate('VueRouter.Router && VueRouter.Router.version || "unknown"');
      console.log('VueRouter版本:', vueRouterVersion);
    }
    
    // 检查Pinia是否加载
    console.log('检查Pinia是否加载...');
    const piniaLoaded = await browser.evaluate('typeof Pinia !== "undefined"');
    console.log('Pinia是否加载:', piniaLoaded);
    
    // 检查应用是否挂载
    console.log('检查应用是否挂载...');
    const appMounted = await browser.evaluate('document.getElementById("app").children.length > 0');
    console.log('应用是否挂载:', appMounted);
    
    if (!appMounted) {
      console.log('应用未挂载，检查错误信息...');
      // 检查控制台是否有错误
      console.log('检查全局错误...');
      const globalError = await browser.evaluate('window.globalError || "No global error"');
      console.log('全局错误:', globalError);
      
      const mainJsError = await browser.evaluate('window.mainJsError || "No main.js error"');
      console.log('main.js错误:', mainJsError);
    }
    
    // 检查MainLayout是否加载
    console.log('检查MainLayout是否加载...');
    const mainLayoutLoaded = await browser.evaluate('typeof window.MainLayout !== "undefined"');
    console.log('MainLayout是否加载:', mainLayoutLoaded);
    
    if (mainLayoutLoaded) {
      const mainLayoutType = await browser.evaluate('typeof window.MainLayout');
      console.log('MainLayout类型:', mainLayoutType);
      
      const mainLayoutKeys = await browser.evaluate('Object.keys(window.MainLayout)');
      console.log('MainLayout属性:', mainLayoutKeys);
    }
    
    // 检查共享组件是否加载
    console.log('检查共享组件是否加载...');
    const sharedComponentsLoaded = await browser.evaluate('typeof window.ZyWebSharedComponents !== "undefined"');
    console.log('共享组件是否加载:', sharedComponentsLoaded);
    
    if (sharedComponentsLoaded) {
      const sharedComponentsKeys = await browser.evaluate('Object.keys(window.ZyWebSharedComponents)');
      console.log('共享组件列表:', sharedComponentsKeys);
    }
    
    // 输出页面结构
    console.log('页面结构:');
    console.log(browser.html('#app'));
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runComponentTest();