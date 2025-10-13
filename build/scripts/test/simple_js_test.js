const Browser = require('zombie');

// 设置超时时间
Browser.waitDuration = '30s';

// 创建浏览器实例
const browser = new Browser();

async function runSimpleTest() {
  try {
    console.log('开始简单测试...');
    
    // 创建一个简单的HTML页面用于测试
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Test</title>
      </head>
      <body>
          <div id="app"></div>
          <script>
              // 简单的ES5 JavaScript测试
              var message = "Hello from JavaScript";
              document.getElementById("app").innerHTML = "<h1>" + message + "</h1>";
              console.log("JavaScript executed successfully");
              
              // 检查是否支持基本的JavaScript特性
              window.testVar = "Test variable";
              window.testFunc = function() {
                  return "Test function";
              };
          </script>
      </body>
      </html>
    `;
    
    // 访问自定义HTML内容
    browser.load(html);
    
    console.log('HTML加载成功');
    console.log('标题:', browser.text('title'));
    
    // 等待JavaScript执行
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 检查JavaScript执行结果
    console.log('页面内容:', browser.html('#app'));
    
    // 检查window对象上的变量和函数
    const testVar = await browser.evaluate('window.testVar');
    console.log('testVar:', testVar);
    
    const testFuncResult = await browser.evaluate('window.testFunc()');
    console.log('testFunc结果:', testFuncResult);
    
    console.log('简单测试完成');
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
  }
}

runSimpleTest();