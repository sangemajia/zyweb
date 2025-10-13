const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runDetailedMainTest() {
  try {
    console.log('开始详细main.js测试...');
    
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
    
    // 等待更长时间让JavaScript执行
    console.log('等待JavaScript执行...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 检查各个阶段的执行情况
    console.log('检查main.js执行情况...');
    
    // 检查是否进入try块
    const enteredTryBlock = await browser.evaluate('typeof window.mainJsError !== "undefined"');
    console.log('是否进入try块:', enteredTryBlock);
    
    // 检查Vue相关变量
    const vueAvailable = await browser.evaluate('typeof Vue !== "undefined"');
    console.log('Vue是否可用:', vueAvailable);
    
    const vueRouterAvailable = await browser.evaluate('typeof VueRouter !== "undefined"');
    console.log('VueRouter是否可用:', vueRouterAvailable);
    
    const piniaAvailable = await browser.evaluate('typeof Pinia !== "undefined"');
    console.log('Pinia是否可用:', piniaAvailable);
    
    // 检查解构是否成功
    const createAppAvailable = await browser.evaluate('typeof Vue.createApp !== "undefined"');
    console.log('createApp是否可用:', createAppAvailable);
    
    const createRouterAvailable = await browser.evaluate('typeof VueRouter.createRouter !== "undefined"');
    console.log('createRouter是否可用:', createRouterAvailable);
    
    const createWebHashHistoryAvailable = await browser.evaluate('typeof VueRouter.createWebHashHistory !== "undefined"');
    console.log('createWebHashHistory是否可用:', createWebHashHistoryAvailable);
    
    const createPiniaAvailable = await browser.evaluate('typeof Pinia.createPinia !== "undefined"');
    console.log('createPinia是否可用:', createPiniaAvailable);
    
    // 检查是否有错误
    const globalError = await browser.evaluate('window.globalError || "No global error"');
    console.log('全局错误:', globalError);
    
    const mainJsError = await browser.evaluate('window.mainJsError || "No main.js error"');
    console.log('main.js错误:', mainJsError);
    
    // 检查调试信息
    const mainLayoutComponent = await browser.evaluate('window.MainLayout || "Not available"');
    console.log('MainLayout组件:', mainLayoutComponent);
    
    const consoleLogs = await browser.evaluate('console.logs || "No console logs captured"');
    console.log('控制台日志:', consoleLogs);
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runDetailedMainTest();