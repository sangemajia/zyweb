import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 导入外部依赖
const { readExternalDeps } = require('./external-deps.cjs');

// 统一应用程序构建配置
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../../../src/renderer'),
      '@main': path.resolve(__dirname, '../../../src/main'),
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
    outDir: path.resolve(__dirname, '../../../dist/ui'),
    emptyOutDir: false,
    // 禁用压缩以减少内存使用
    minify: false,
    rollupOptions: {
      input: {
        'main': path.resolve(__dirname, '../../../src/renderer/src/main.ts'),
      },
      output: {
        // 使用固定文件名并保持目录结构
        entryFileNames: `js/[name].js`,
        chunkFileNames: `js/[name].js`,
        assetFileNames: (assetInfo) => {
          const extension = assetInfo.name.split('.').pop();
          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
            return `images/[name].[ext]`;
          }
          if (extension === 'css') {
            return `css/[name].[ext]`;
          }
          return `[name].[ext]`;
        },
      },
      external: [
        ...readExternalDeps(),
        // 添加对基础组件的引用
        './shared-components/assets/SharedButton-*.js',
        './shared-components/assets/SharedCard-*.js',
        './shared-components/assets/SimpleShared-*.js',
        './shared-components/assets/MediaCard-*.js',
        './shared-components/assets/SearchBox-*.js',
      ],
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
});