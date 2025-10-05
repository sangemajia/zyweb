import { defineConfig } from 'vite'
import path from 'path'

// 样式库构建配置
export default defineConfig({
  root: '.', // 设置根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@main': path.resolve(__dirname, 'src/main'),
    },
  },
  build: {
    outDir: '../dist/client/fine-components/style',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    rollupOptions: {
      input: {
        layout: 'src/renderer/src/style/layout.less',
        theme: 'src/renderer/src/style/theme/theme.less',
        variables: 'src/renderer/src/style/variables.less'
      },
      output: {
        assetFileNames: '[name].[ext]',
        // 减少每个chunk的大小
        compact: true,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 增加内存限制
    chunkSizeWarningLimit: 200000, // 200MB
    brotliSize: false,
    cssCodeSplit: true,
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