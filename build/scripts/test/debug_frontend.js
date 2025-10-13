const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

// 启用控制台日志
browser.debug();

async function runDebugTest() {
  try {
    console.log('开始调试测试...');
    
    // 监听控制台消息
    browser.on('console', function(level, message) {
      console.log(`浏览器控制台 [${level}]: ${message}`);
    });
    
    // 监听错误
    browser.on('error', function(error) {
      console.log('浏览器错误:', error);
    });
    
    // 访问首页
    console.log('访问 http://127.0.0.1:8819');
    await browser.visit('http://127.0.0.1:8819');
    console.log('访问成功');
    console.log('状态码:', browser.status);
    console.log('标题:', browser.text('title'));
    
    // 等待一段时间让JavaScript执行
    await browser.wait();
    
    // 检查页面内容
    console.log('页面HTML:');
    console.log(browser.html());
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runDebugTest();