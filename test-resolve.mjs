// 测试模块解析 (ES模块版本)
console.log('Testing module resolution (ES modules)...');

try {
  const vuePackage = await import('vue/package.json');
  console.log('Vue version:', vuePackage.default.version);
} catch (e) {
  console.error('Failed to resolve vue/package.json:', e.message);
}

try {
  // 注意：在ES模块中，我们不能直接解析vue/compiler-sfc的路径
  const compilerSfc = await import('vue/compiler-sfc');
  console.log('vue/compiler-sfc loaded successfully');
} catch (e) {
  console.error('Failed to resolve vue/compiler-sfc:', e.message);
}

try {
  const pluginVue = await import('@vitejs/plugin-vue');
  console.log('@vitejs/plugin-vue loaded successfully');
} catch (e) {
  console.error('Failed to resolve @vitejs/plugin-vue:', e.message);
}