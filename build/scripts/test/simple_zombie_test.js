const { Browser } = require('zombie');

// 创建浏览器实例
const browser = new Browser();

// 设置超时时间
browser.waitDuration = '30s';

async function runTest() {
  try {
    console.log('开始测试...');
    console.log('访问 http://localhost:8819');
    await browser.visit('http://localhost:8819');
    console.log('访问成功');
    console.log('状态码:', browser.status);
    console.log('标题:', browser.text('title'));
  } catch (error) {
    console.error('错误:', error.message);
  }
}

runTest();