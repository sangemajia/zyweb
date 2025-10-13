import { Browser } from 'zombie';

// 设置浏览器选项
Browser.localhost('localhost', 8819);

// 创建浏览器实例
const browser = new Browser();

// 设置超时时间
browser.waitDuration = '30s';

async function runTests() {
  try {
    console.log('开始ZyWeb前端测试...');
    
    // 访问首页
    console.log('访问首页...');
    await browser.visit('/');
    console.log('首页访问成功');
    console.log('页面状态:', browser.status);
    console.log('页面标题:', browser.text('title'));
    
    // 检查页面内容
    if (browser.success) {
      console.log('页面加载成功');
      // 尝试查找一些页面元素
      const appElement = browser.query('#app');
      if (appElement) {
        console.log('找到 #app 元素');
      } else {
        console.log('未找到 #app 元素');
      }
    } else {
      console.log('页面加载失败');
    }
    
    console.log('测试完成!');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
    console.error('错误详情:', error.stack);
  }
}

// 运行测试
runTests();