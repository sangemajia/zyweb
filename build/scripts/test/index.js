import { Browser } from 'zombie';

// 设置浏览器选项
Browser.localhost('localhost', 8819);

// 创建浏览器实例
const browser = new Browser();

describe('ZyWeb前端测试', function() {
  // 设置超时时间
  this.timeout(30000);

  before(async function() {
    // 访问首页
    await browser.visit('/');
  });

  it('应该能够成功加载首页', function() {
    browser.assert.success();
    browser.assert.text('title', /ZyWeb/);
  });

  it('应该能够导航到Film页面', async function() {
    // 点击导航链接到Film页面
    await browser.clickLink('Film');
    browser.assert.success();
    // 验证页面内容
    browser.assert.text('h1', /Film/);
  });

  it('应该能够导航到IPTV页面', async function() {
    // 回到首页
    await browser.visit('/');
    // 点击导航链接到IPTV页面
    await browser.clickLink('IPTV');
    browser.assert.success();
    // 验证页面内容
    browser.assert.text('h1', /IPTV/);
  });

  it('应该能够导航到Drive页面', async function() {
    // 回到首页
    await browser.visit('/');
    // 点击导航链接到Drive页面
    await browser.clickLink('Drive');
    browser.assert.success();
    // 验证页面内容
    browser.assert.text('h1', /Drive/);
  });

  it('应该能够导航到Lab页面', async function() {
    // 回到首页
    await browser.visit('/');
    // 点击导航链接到Lab页面
    await browser.clickLink('Lab');
    browser.assert.success();
    // 验证页面内容
    browser.assert.text('h1', /Lab/);
  });
});