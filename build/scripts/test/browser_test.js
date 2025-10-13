const puppeteer = require('puppeteer');

async function runBrowserTest() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('浏览器控制台:', msg.text()));
  page.on('error', error => console.error('页面错误:', error));
  page.on('pageerror', error => console.error('页面错误:', error));
  
  try {
    console.log('访问页面...');
    await page.goto('http://127.0.0.1:8819', { waitUntil: 'networkidle0' });
    console.log('页面加载完成');
    
    // 等待一段时间让JavaScript执行
    await page.waitForTimeout(3000);
    
    // 检查变量
    const mainLayoutExists = await page.evaluate(() => typeof window.MainLayout !== 'undefined');
    console.log('MainLayout是否存在:', mainLayoutExists);
    
    if (mainLayoutExists) {
      const mainLayoutType = await page.evaluate(() => typeof window.MainLayout);
      console.log('MainLayout类型:', mainLayoutType);
    }
    
    const sharedComponentsExists = await page.evaluate(() => typeof window.ZyWebSharedComponents !== 'undefined');
    console.log('共享组件是否存在:', sharedComponentsExists);
    
    if (sharedComponentsExists) {
      const sharedComponentsKeys = await page.evaluate(() => Object.keys(window.ZyWebSharedComponents));
      console.log('共享组件键:', sharedComponentsKeys);
    }
    
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await browser.close();
  }
}

runBrowserTest();