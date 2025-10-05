import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 极简构建配置
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
          // 减少编译时内存使用
          whitespace: 'condense',
        },
      },
    }),
  ],
  build: {
    outDir: '../../dist/client/components/test',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    lib: {
      entry: 'src/renderer/src/pages/test/index.vue',
      name: 'test',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'vue'
      ],
      output: {
        globals: {
          vue: 'Vue'
        },
        // 最小化输出
        compact: true,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 严格的内存限制
    chunkSizeWarningLimit: 1000,
    brotliSize: false,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
    // 禁用预打包以减少内存使用
    disabled: true,
  },
  // 最小化配置
  configFile: false,
  // 禁用一些功能以节省内存
  clearScreen: false,
})