import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 最小化构建配置
export default defineConfig({
  root: '.', // 设置根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
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
  build: {
    outDir: 'dist/web-minimal',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    rollupOptions: {
      input: {
        main: 'index-minimal.html', // 使用最小化的 HTML 文件
      },
      output: {
        manualChunks: undefined, // 禁用代码分割
      },
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})