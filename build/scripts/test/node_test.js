// Node.js测试脚本
const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
global.window = {};
global.Vue = {};
global.VueRouter = {};
global.Pinia = {};

console.log('开始测试模块加载...');

// 测试MainLayout.js
try {
  console.log('读取MainLayout.js...');
  const mainLayoutContent = fs.readFileSync('/workspace/zyweb/dist/app/ui/js/layouts/MainLayout.js', 'utf8');
  console.log('MainLayout.js内容长度:', mainLayoutContent.length);
  
  // 检查是否包含window.MainLayout赋值
  if (mainLayoutContent.includes('window.MainLayout')) {
    console.log('MainLayout.js包含window.MainLayout赋值');
  } else {
    console.log('MainLayout.js不包含window.MainLayout赋值');
  }
} catch (error) {
  console.error('读取MainLayout.js失败:', error.message);
}

// 测试shared.js
try {
  console.log('读取shared.js...');
  const sharedContent = fs.readFileSync('/workspace/zyweb/dist/app/ui/js/shared.js', 'utf8');
  console.log('shared.js内容长度:', sharedContent.length);
  
  // 检查是否包含window.ZyWebSharedComponents赋值
  if (sharedContent.includes('window.ZyWebSharedComponents')) {
    console.log('shared.js包含window.ZyWebSharedComponents赋值');
  } else {
    console.log('shared.js不包含window.ZyWebSharedComponents赋值');
  }
} catch (error) {
  console.error('读取shared.js失败:', error.message);
}