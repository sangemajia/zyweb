import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 保持UI一致性的构建配置 - 优化内存使用
export default defineConfig({
  root: '.', // 设置根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@main': path.resolve(__dirname, 'src/main'),
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
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9978', // 与ZyPlayer共享后端服务
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist/client/web-consistent',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    rollupOptions: {
      input: {
        main: 'index.html', // 使用主HTML文件
      },
      output: {
        // 进一步细分chunks以减少内存使用
        manualChunks: {
          // 将核心框架库单独打包
          framework: ['vue'],
          router: ['vue-router'],
          state: ['pinia'],
          // 将 UI 组件库单独打包
          ui: ['tdesign-vue-next'],
          // 将工具库进一步细分打包
          utils: ['axios'],
          lodash: ['lodash-es'],
          date: ['moment'],
          vueuse: ['@vueuse/core'],
        },
        // 减少每个chunk的大小
        compact: true,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 进一步减少内存使用
    chunkSizeWarningLimit: 200,
    brotliSize: false,
    cssCodeSplit: false,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
    // 禁用预打包以减少内存使用
    disabled: true,
  },
  // 减少内存使用的实验性选项
  worker: {
    format: 'es',
  },
})