import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 功能组件构建配置
export default defineConfig({
  root: '.', // 设置根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../../src/renderer'),
      '@main': path.resolve(__dirname, '../../src/main'),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'webview' || tag === 'title-bar',
          // 减少编译时内存使用
          whitespace: 'condense',
        },
      },
    }),
  ],
  build: {
    outDir: '../../dist/client/fine-components/player',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    lib: {
      entry: '../../src/renderer/src/components/player/index.ts',
      name: 'player',
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
        '@vueuse/core'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': '_',
          moment: 'moment',
          '@vueuse/core': 'VueUse'
        },
        // 减少每个chunk的大小
        compact: true,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 增加内存限制
    chunkSizeWarningLimit: 200000, // 200MB
    brotliSize: false,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
    // 禁用预打包以减少内存使用
    noDiscovery: true,
  },
  // 减少内存使用的实验性选项
  worker: {
    format: 'es',
  },
})