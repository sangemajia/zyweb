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
    outDir: '../dist/zyweb/film',
    emptyOutDir: true,
    // 禁用压缩以减少内存使用
    minify: false,
    // 构建优化选项
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/src/pages/film/index.html'),
      },
      output: {
        // 禁用代码分割以减少内存使用
        manualChunks: undefined,
      },
    },
    // 禁用 CSS 代码分割
    cssCodeSplit: false,
    // 降低 chunk 大小警告限制
    chunkSizeWarningLimit: 500,
    // 添加构建性能优化
    brotliSize: false, // 不计算 brotli 大小，提高构建速度
    sourcemap: false,  // 不生成 sourcemap，减少内存占用
    // 添加更多构建优化选项
    reportCompressedSize: false, // 不计算压缩大小，提高构建速度
  },
})