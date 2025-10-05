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
    outDir: 'dist/web',
    emptyOutDir: true,
    // 构建优化选项
    rollupOptions: {
      output: {
        // 分割代码
        manualChunks: {
          // 将第三方库单独打包
          vendor: ['vue', 'vue-router', 'pinia'],
          // 将 UI 组件库单独打包
          ui: ['tdesign-vue-next'],
          // 将工具库单独打包
          utils: ['axios', 'lodash-es', 'moment'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用 CSS 预处理器的 source map
    cssMinify: true,
    // 启用压缩
    minify: 'terser',
    // Terser 选项
    terserOptions: {
      compress: {
        // 删除 console 语句
        drop_console: true,
        // 删除 debugger 语句
        drop_debugger: true,
      },
    },
    // 启用 brotli 压缩
    brotliSize: true,
    // 启用 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 减少内存使用
    sourcemap: false,
    // 启用实验性选项以减少内存使用
    modulePreload: false,
  },
  // 减少内存使用
  optimizeDeps: {
    // 禁用依赖发现
    noDiscovery: true,
    // 不包含任何依赖
    include: undefined,
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