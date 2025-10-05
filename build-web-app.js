const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// 创建输出目录
const outDir = 'dist/client/web-app';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 构建配置
esbuild.build({
  entryPoints: ['src/renderer/src/main.ts'],
  bundle: true,
  outfile: 'dist/client/web-app/index.js',
  format: 'esm',
  external: [
    'vue',
    'vue-router',
    'vuex',
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
  },
  loader: {
    '.vue': 'js', // 简化处理
    '.ts': 'ts',
    '.less': 'css',
  }
}).then(() => {
  console.log('Web应用构建完成');
  
  // 复制HTML文件
  fs.copyFileSync('src/renderer/src/index.html', 'dist/client/web-app/index.html');
  
  // 复制静态资源目录
  const staticDirs = ['assets', 'style'];
  staticDirs.forEach(dir => {
    const srcDir = `src/renderer/src/${dir}`;
    const destDir = `dist/client/web-app/${dir}`;
    if (fs.existsSync(srcDir)) {
      fs.cpSync(srcDir, destDir, { recursive: true });
    }
  });
  
  console.log('所有文件复制完成');
}).catch((error) => {
  console.error('构建失败:', error);
  process.exit(1);
});