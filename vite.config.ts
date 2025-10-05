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
  },
})