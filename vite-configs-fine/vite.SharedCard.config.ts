import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 共享组件构建配置
export default defineConfig({
  root: '.', // 设置根目录
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
          // 减少编译时内存使用
          whitespace: 'condense',
        },
      },
    }),
  ],
  build: {
    outDir: '../../dist/client/fine-components/shared',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    lib: {
      entry: 'src/renderer/src/components/shared/SharedCard.vue',
      name: 'SharedCard',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'vue',
        'tdesign-vue-next'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'tdesign-vue-next': 'TDesign'
        },
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