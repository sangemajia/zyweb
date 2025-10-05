const esbuild = require('esbuild');
const path = require('path');

// 创建输出目录
const fs = require('fs');
const outDir = 'dist/client/components/test';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 简单的构建配置
esbuild.build({
  entryPoints: ['src/renderer/src/pages/test/simple-test.js'],
  bundle: true,
  outfile: 'dist/client/components/test/index.js',
  format: 'esm',
  external: [
    'vue',
    'vue-router',
    'pinia',
    'tdesign-vue-next',
    'axios',
    'lodash-es',
    'moment',
    '@vueuse/core'
  ],
  minify: false,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}).then(() => {
  console.log('Build completed successfully');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});