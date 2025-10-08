import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 导入外部依赖
const { readExternalDeps } = require('./external-deps.cjs');

// see config at https://vitejs.dev/config/
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
    outDir: path.resolve(__dirname, '../../../dist/zyweb/complete-app'),
    emptyOutDir: true,
    // 禁用压缩以减少内存使用
    minify: false,
    // 构建优化选项
    rollupOptions: {
      input: {
        // 完整应用页面
        'index': path.resolve(__dirname, '../../../src/renderer/src/index.html'),
      },
      output: {
        // 启用代码分割以优化构建
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/renderer/src')) {
            return 'app';
          }
        },
      },
      external: [
        ...readExternalDeps(),
        // 添加对已构建基础组件的引用
        './shared-components/assets/SharedButton-CD9yLWd7.js',
        './shared-components/assets/SharedCard-bnfzDd18.js',
        './shared-components/assets/SimpleShared-bnfzDd18.js',
        // 添加App.vue依赖的模块
        '@vueuse/core/useLocalStorage',
        '@vueuse/core/useScriptTag',
        '@vueuse/core/usePreferredDark',
        // 添加SystemControl.vue依赖的模块
        '@electron-uikit/titlebar/renderer'
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
})