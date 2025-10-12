import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 为zyweb优化的web主入口构建配置
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../../src/renderer'),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'webview',
        },
      },
    }),
  ],
  build: {
    outDir: path.resolve(__dirname, '../../dist/zyweb/web-main'),
    emptyOutDir: false,
    // 禁用压缩以减少内存使用
    minify: false,
    lib: {
      entry: path.resolve(__dirname, '../../../src/renderer/src/web-entry.js'),
      name: 'ZyWebMain',
      formats: ['es'],
      fileName: 'web-main'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign'
        },
      },
    },
    // 禁用 CSS 代码分割
    cssCodeSplit: false,
    // 降低 chunk 大小警告限制
    chunkSizeWarningLimit: 100,
    // 添加构建性能优化
    brotliSize: false, // 不计算 brotli 大小，提高构建速度
    sourcemap: false,  // 不生成 sourcemap，减少内存占用
    // 添加更多构建优化选项
    reportCompressedSize: false, // 不计算压缩大小，提高构建速度
  },
  // 添加Vite性能优化选项
  optimizeDeps: {
    // 禁用预构建以减少内存使用
    noDiscovery: true,
    include: undefined,
  },
  // 禁用HMR以减少内存使用
  server: {
    hmr: false,
  },
})