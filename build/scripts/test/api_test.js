const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runAPITest() {
  try {
    console.log('开始ZyWeb API接口测试...');
    
    // 测试健康检查接口
    console.log('测试健康检查接口 /api/health');
    await browser.visit('http://127.0.0.1:8819/api/health');
    console.log('状态码:', browser.status);
    
    if (browser.status === 200) {
      const responseBody = browser.text('body');
      console.log('响应内容:', responseBody);
      
      try {
        const jsonData = JSON.parse(responseBody);
        console.log('✓ 健康检查接口返回正确格式的数据');
        console.log('  状态:', jsonData.status);
        console.log('  消息:', jsonData.message);
      } catch (parseError) {
        console.log('✗ 响应不是有效的JSON格式');
      }
    } else {
      console.log('✗ 健康检查接口返回错误状态码:', browser.status);
    }
    
    console.log('API测试完成!');
  } catch (error) {
    console.error('错误:', error.message);
  }
}

runAPITest();