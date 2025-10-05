import { defineConfig } from 'vite'
import path from 'path'

// 工具函数构建配置
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
    outDir: '../dist/client/fine-components/utils',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    lib: {
      entry: 'src/renderer/src/utils/shared-utils.ts',
      name: 'SharedUtils',
      formats: ['es'],
      fileName: 'shared-utils'
    },
    rollupOptions: {
      external: [],
      output: {
        // 减少每个chunk的大小
        compact: true,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 增加内存限制
    chunkSizeWarningLimit: 200000, // 200MB
    brotliSize: false,
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