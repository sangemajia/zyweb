// @ts-check
const { test, expect } = require('@playwright/test');

test('ZYWeb主页测试', async ({ page }) => {
  // 访问主页
  await page.goto('http://localhost:8819');
  
  // 等待页面加载
  await page.waitForSelector('.home-page');
  
  // 检查页面标题
  await expect(page).toHaveTitle(/zyfun/);
  
  // 检查页面内容
  await expect(page.locator('text=欢迎使用 ZYWeb')).toBeVisible();
  await expect(page.locator('text=主要功能')).toBeVisible();
  
  // 检查页面元素
  await expect(page.locator('.zy-header')).toBeVisible();
  await expect(page.locator('.zy-aside')).toBeVisible();
  await expect(page.locator('.logo')).toBeVisible();
  
  console.log('所有测试通过');
});

test('ZYWeb资源文件测试', async ({ page }) => {
  // 测试CSS文件
  const sharedCssResponse = await page.goto('http://localhost:8819/css/shared.css');
  expect(sharedCssResponse.status()).toBe(200);
  
  const homeCssResponse = await page.goto('http://localhost:8819/css/home-style.css');
  expect(homeCssResponse.status()).toBe(200);
  
  // 测试JS文件
  const homeJsResponse = await page.goto('http://localhost:8819/js/home.js');
  expect(homeJsResponse.status()).toBe(200);
  
  const sharedJsResponse = await page.goto('http://localhost:8819/js/shared.js');
  expect(sharedJsResponse.status()).toBe(200);
  
  console.log('资源文件测试通过');
});