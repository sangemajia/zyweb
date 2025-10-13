import { Browser } from 'zombie';

// 设置浏览器选项
Browser.localhost('localhost', 8820);

// 创建浏览器实例
const browser = new Browser();

async function runTests() {
  try {
    console.log('开始ZyWeb前端测试...');
    
    // 访问首页
    console.log('访问前端首页...');
    await browser.visit('/');
    console.log('前端首页访问成功');
    console.log('页面状态:', browser.status);
    console.log('页面标题:', browser.text('title'));
    
    // 测试API连接
    console.log('测试API连接...');
    const response = await browser.fetch('http://localhost:8819/api/health');
    console.log('API响应状态:', response.status);
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('API响应数据:', data);
    }
    
    console.log('测试完成!');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
    console.error('错误详情:', error.stack);
  }
}

// 运行测试
runTests();