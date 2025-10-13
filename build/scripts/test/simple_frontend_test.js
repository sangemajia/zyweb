// 简单的前端测试脚本
async function runTests() {
  try {
    console.log('开始ZyWeb前端测试...');
    
    // 测试前端页面访问
    console.log('测试前端页面访问...');
    const frontendResponse = await fetch('http://localhost:8820');
    console.log('前端页面响应状态:', frontendResponse.status);
    
    if (frontendResponse.status === 200) {
      const html = await frontendResponse.text();
      console.log('前端页面标题:', html.match(/<title>(.*?)<\/title>/)?.[1] || '未找到标题');
    }
    
    // 测试API连接
    console.log('测试API连接...');
    const apiResponse = await fetch('http://localhost:8819/api/health');
    console.log('API响应状态:', apiResponse.status);
    
    if (apiResponse.status === 200) {
      const data = await apiResponse.json();
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