import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 组件构建配置模板
export default defineConfig({
  root: '..', // 设置根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../src/renderer'),
      '@main': path.resolve(__dirname, '../src/main'),
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
    outDir: '../../dist/client/components/drive',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    lib: {
      entry: '/workspace/zyweb/src/renderer/src/pages/drive/index.vue',
      name: 'drive',
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
        'v3-infinite-loading',
        'vuex'
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
        // 进一步优化输出以减少内存使用
        manualChunks: undefined,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 增加内存限制
    chunkSizeWarningLimit: 200000, // 200MB
    brotliSize: false,
    // 进一步优化以减少内存使用
    cssCodeSplit: true,
    modulePreload: false,
    // 禁用报告以减少内存使用
    reportCompressedSize: false,
    // 禁用延迟加载以减少内存使用
    polyfillModulePreload: false,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
    // 禁用预打包以减少内存使用
    disabled: true,
    // 进一步优化以减少内存使用
    esbuildOptions: {
      // 减少内存使用
      incremental: false,
      // 进一步减少内存使用
      memoryLimit: 512,
      // 禁用一些消耗内存的特性
      treeShaking: true,
      // 减少并发以节省内存
      concurrency: 1,
    },
  },
  // 减少内存使用的实验性选项
  worker: {
    format: 'es',
    // 减少worker数量以减少内存使用
    maxParallelWorkers: 1,
  },
  // 进一步减少内存使用
  ssr: {
    noExternal: []
  },
  // 添加更多减少内存使用的选项
  mode: 'production',
  define: {
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
  },
  // 配置实验性选项以进一步减少内存使用
  experimental: {
    renderBuiltUrl: undefined
  },
  // 禁用HMR以节省内存
  server: {
    hmr: false
  },
  // 添加构建选项以进一步减少内存使用
  clearScreen: false,
  logLevel: 'silent',
  // 减少文件监听以节省内存
  configFile: false,
})