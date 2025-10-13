const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runDetailedTest() {
  try {
    console.log('开始详细测试...');
    
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
    
    // 检查所有相关变量
    console.log('检查window对象上的变量...');
    
    // 检查Vue相关
    const vueExists = await browser.evaluate('typeof Vue !== "undefined"');
    console.log('Vue是否存在:', vueExists);
    
    // 检查VueRouter相关
    const vueRouterExists = await browser.evaluate('typeof VueRouter !== "undefined"');
    console.log('VueRouter是否存在:', vueRouterExists);
    
    // 检查Pinia相关
    const piniaExists = await browser.evaluate('typeof Pinia !== "undefined"');
    console.log('Pinia是否存在:', piniaExists);
    
    // 检查MainLayout
    const mainLayoutExists = await browser.evaluate('typeof window.MainLayout !== "undefined"');
    console.log('MainLayout是否存在:', mainLayoutExists);
    
    if (mainLayoutExists) {
      const mainLayoutType = await browser.evaluate('typeof window.MainLayout');
      console.log('MainLayout类型:', mainLayoutType);
    }
    
    // 检查共享组件
    const sharedComponentsExists = await browser.evaluate('typeof window.ZyWebSharedComponents !== "undefined"');
    console.log('共享组件是否存在:', sharedComponentsExists);
    
    if (sharedComponentsExists) {
      const sharedComponentsType = await browser.evaluate('typeof window.ZyWebSharedComponents');
      console.log('共享组件类型:', sharedComponentsType);
      
      const sharedComponentsKeys = await browser.evaluate('Object.keys(window.ZyWebSharedComponents)');
      console.log('共享组件键:', sharedComponentsKeys);
    }
    
    // 检查导入的模块
    console.log('检查模块导入...');
    const mainModule = await browser.evaluate('typeof window.mainModule !== "undefined"');
    console.log('mainModule是否存在:', mainModule);
    
    // 检查应用是否挂载
    console.log('检查应用挂载状态...');
    const appElement = await browser.evaluate('document.getElementById("app")');
    console.log('app元素:', appElement);
    
    const appChildrenCount = await browser.evaluate('document.getElementById("app").children.length');
    console.log('app子元素数量:', appChildrenCount);
    
    // 输出页面结构
    console.log('页面结构:');
    console.log(browser.html());
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runDetailedTest();