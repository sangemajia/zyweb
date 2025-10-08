import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// see config at https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src/renderer/src'),
      '@renderer': path.resolve(process.cwd(), 'src/renderer'),
      '@main': path.resolve(process.cwd(), 'src/main'),
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
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: false,
        modifyVars: {
          'primary-color': '#45c58b',
        },
        // 增加Less编译超时时间
        timeout: 120000,
      },
    },
    // 禁用CSS处理
    postcss: {
      plugins: [],
    },
  },
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
    outDir: path.resolve(process.cwd(), '../dist/zyweb'),
    emptyOutDir: true,
    // 禁用压缩以减少内存使用
    minify: false,
    // 构建优化选项
    rollupOptions: {
      // 将electron相关的模块外部化
      external: ['@electron-uikit/titlebar/renderer'],
      output: {
        // 禁用代码分割以减少内存使用
        manualChunks: undefined,
        // 进一步优化输出
        compact: false,
        // 禁用生成额外的文件以减少内存使用
        inlineDynamicImports: false,
        // 禁用生成额外的块
        hoistTransitiveImports: false,
      },
      // 禁用构建缓存以减少内存使用
      cache: false,
      // 禁用插件以减少内存使用
      treeshake: false,
    },
    // 禁用 CSS 代码分割
    cssCodeSplit: false,
    // 降低 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
    // 添加构建性能优化
    brotliSize: false, // 不计算 brotli 大小，提高构建速度
    sourcemap: false,  // 不生成 sourcemap，减少内存占用
    // 添加更多构建优化选项
    reportCompressedSize: false, // 不计算压缩大小，提高构建速度
    // 减少并行处理以降低内存使用
    parallel: false,
    // 禁用预加载以减少内存使用
    modulePreload: false,
    // 禁用terser选项以减少内存使用
    terserOptions: undefined,
    // 进一步减少内存使用
    cssMinify: false,
    assetsInlineLimit: 1000000,
    // 添加更多内存优化选项
    write: true,
    manifest: false,
    // 禁用其他优化选项以减少内存使用
    copyPublicDir: false,
  },
})