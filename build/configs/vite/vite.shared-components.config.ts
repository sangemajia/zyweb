import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 为zyweb优化的shared-components构建配置
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../../../src/renderer'),
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
    outDir: path.resolve(__dirname, '../../../dist/zyweb/shared-components'),
    emptyOutDir: true,
    // 禁用压缩以减少内存使用
    minify: false,
    lib: {
      entry: path.resolve(__dirname, '../../../src/renderer/src/components/shared/index.ts'),
      name: 'ZyWebSharedComponents',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
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
        // 优化输出结构
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'shared-components.css';
          }
          return assetInfo.name;
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