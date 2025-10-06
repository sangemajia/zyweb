import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

// 获取所有依赖包
const getDependencies = () => {
  const pkg = require('./package.json');
  return Object.keys(pkg.dependencies || {});
};

// 获取外部依赖
const externalDeps = getDependencies();

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist/client/components/file-diff',
    lib: {
      entry: resolve(__dirname, 'src/renderer/src/pages/lab/components/fileDiff/index.vue'),
      name: 'FileDiff',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment',
        '@vueuse/core',
        'splitpanes',
        'json5',
        'js-beautify',
        ...externalDeps
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': 'Lodash',
          moment: 'moment',
          '@vueuse/core': 'VueUse',
          splitpanes: 'Splitpanes',
          json5: 'JSON5',
          'js-beautify': 'jsBeautify'
        }
      }
    },
    minify: false,
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});