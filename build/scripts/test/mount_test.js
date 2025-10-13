const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runMountTest() {
  try {
    console.log('开始挂载测试...');
    
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
    
    // 等待更长时间让JavaScript执行
    console.log('等待JavaScript执行...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查组件是否正确加载
    console.log('检查组件加载情况...');
    const mainLayoutLoaded = await browser.evaluate('typeof window.MainLayout !== "undefined"');
    console.log('MainLayout是否加载:', mainLayoutLoaded);
    
    const sharedComponentsLoaded = await browser.evaluate('typeof window.ZyWebSharedComponents !== "undefined"');
    console.log('共享组件是否加载:', sharedComponentsLoaded);
    
    // 检查Vue应用是否创建
    console.log('检查Vue应用...');
    const appCreated = await browser.evaluate('typeof window.app !== "undefined"');
    console.log('Vue应用是否创建:', appCreated);
    
    // 检查路由是否创建
    console.log('检查路由...');
    const routerCreated = await browser.evaluate('typeof window.router !== "undefined"');
    console.log('路由是否创建:', routerCreated);
    
    // 检查Pinia是否创建
    console.log('检查Pinia...');
    const piniaCreated = await browser.evaluate('typeof window.pinia !== "undefined"');
    console.log('Pinia是否创建:', piniaCreated);
    
    // 检查应用是否挂载
    console.log('检查应用挂载状态...');
    const appMounted = await browser.evaluate('document.getElementById("app").children.length > 0');
    console.log('应用是否挂载:', appMounted);
    
    if (!appMounted) {
      // 检查#app元素
      const appElement = await browser.evaluate('document.getElementById("app")');
      console.log('#app元素:', appElement);
      
      // 检查是否有错误
      const globalError = await browser.evaluate('window.globalError || "No global error"');
      console.log('全局错误:', globalError);
      
      const mainJsError = await browser.evaluate('window.mainJsError || "No main.js error"');
      console.log('main.js错误:', mainJsError);
    }
    
    // 输出页面结构
    console.log('页面结构:');
    console.log(browser.html('#app'));
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runMountTest();