const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runTest() {
  try {
    console.log('开始ZyWeb前端测试...');
    
    // 访问首页
    console.log('访问 http://127.0.0.1:8819');
    await browser.visit('http://127.0.0.1:8819');
    console.log('访问成功');
    console.log('状态码:', browser.status);
    console.log('标题:', browser.text('title'));
    
    // 检查页面内容
    if (browser.success) {
      console.log('页面加载成功');
      
      // 检查是否存在 #app 元素
      const appElement = browser.query('#app');
      if (appElement) {
        console.log('✓ 找到 #app 元素');
      } else {
        console.log('✗ 未找到 #app 元素');
      }
      
      // 检查是否存在导航栏元素
      const navElement = browser.query('.zy-side-nav-logo-wrapper');
      if (navElement) {
        console.log('✓ 找到导航栏元素');
      } else {
        console.log('✗ 未找到导航栏元素');
      }
      
      // 检查是否存在头部元素
      const headerElement = browser.query('.zy-header');
      if (headerElement) {
        console.log('✓ 找到头部元素');
      } else {
        console.log('✗ 未找到头部元素');
      }
      
      // 输出页面HTML的一部分用于调试
      console.log('页面HTML片段:');
      console.log(browser.html('body').substring(0, 500) + '...');
    } else {
      console.log('页面加载失败');
    }
    
    console.log('测试完成!');
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runTest();