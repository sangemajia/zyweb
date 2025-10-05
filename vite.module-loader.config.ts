import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 模块化构建配置
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
        target: 'http://localhost:9978',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/web-module-loader',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    rollupOptions: {
      input: {
        main: 'index-module-loader.html', // 使用模块化加载的 HTML 文件
      },
      output: {
        manualChunks: {
          // 将主要的框架库打包在一起
          framework: ['vue', 'vue-router', 'pinia'],
          // 将 UI 组件库单独打包
          ui: ['tdesign-vue-next'],
          // 将工具库打包在一起
          utils: ['axios', 'lodash-es', 'moment', '@vueuse/core'],
        },
      },
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})