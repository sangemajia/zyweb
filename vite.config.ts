import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// see config at https://vitejs.dev/config/
export default defineConfig({
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
        target: 'http://localhost:9978', // 与ZyPlayer共享后端服务
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../../dist/client/web',
    emptyOutDir: true,
    // 构建优化选项 - 进一步减少内存使用
    rollupOptions: {
      output: {
        // 分割代码 - 减少每个chunk的大小
        manualChunks: {
          // 将核心框架库单独打包
          framework: ['vue', 'vue-router', 'pinia'],
          // 将 UI 组件库单独打包
          ui: ['tdesign-vue-next'],
          // 将工具库进一步细分打包
          utils: ['axios', 'lodash-es'],
          date: ['moment'],
          vueuse: ['@vueuse/core'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 禁用 CSS 压缩以减少内存使用
    cssMinify: false,
    // 禁用压缩以减少内存使用
    minify: false,
    // 禁用 brotli 压缩以减少内存使用
    brotliSize: false,
    // 降低 chunk 大小警告限制
    chunkSizeWarningLimit: 500,
    // 减少内存使用
    sourcemap: false,
    // 禁用实验性选项以减少内存使用
    modulePreload: false,
  },
  // 减少内存使用
  optimizeDeps: {
    // 禁用依赖发现
    noDiscovery: true,
    // 不包含任何依赖
    include: undefined,
    // 禁用预打包以减少内存使用
    disabled: true,
  },
  // 实验性选项
  experimental: {
    // 渲染构建 URL
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
      }
      return filename
    }
  }
})