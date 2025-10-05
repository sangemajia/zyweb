import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 简化版配置，用于在内存受限环境中构建
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
        target: 'http://localhost:9978',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/web',
    emptyOutDir: true,
    // 禁用所有可能增加内存使用的选项
    sourcemap: false,
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // 不分割代码
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})