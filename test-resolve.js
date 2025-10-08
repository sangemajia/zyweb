// 测试模块解析
console.log('Testing module resolution...');

try {
  const vuePackage = require('vue/package.json');
  console.log('Vue version:', vuePackage.version);
} catch (e) {
  console.error('Failed to resolve vue/package.json:', e.message);
}

try {
  const compilerSfcPath = require.resolve('vue/compiler-sfc');
  console.log('vue/compiler-sfc path:', compilerSfcPath);
  
  const compilerSfc = require('vue/compiler-sfc');
  console.log('vue/compiler-sfc loaded successfully');
} catch (e) {
  console.error('Failed to resolve vue/compiler-sfc:', e.message);
}

try {
  const pluginVuePath = require.resolve('@vitejs/plugin-vue');
  console.log('@vitejs/plugin-vue path:', pluginVuePath);
  
  const pluginVue = require('@vitejs/plugin-vue');
  console.log('@vitejs/plugin-vue loaded successfully');
} catch (e) {
  console.error('Failed to resolve @vitejs/plugin-vue:', e.message);
}