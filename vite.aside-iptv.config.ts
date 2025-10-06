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
    outDir: 'dist/client/components/aside-iptv',
    lib: {
      entry: resolve(__dirname, 'src/renderer/src/pages/play/componets/AsideIptv.vue'),
      name: 'AsideIptv',
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
        'v3-infinite-loading',
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
          'js-beautify': 'jsBeautify',
          'v3-infinite-loading': 'InfiniteLoading'
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