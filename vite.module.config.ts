import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 为单个功能模块构建的配置
export default defineConfig({
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
        },
      },
    }),
  ],
  build: {
    outDir: 'dist/web/modules',
    emptyOutDir: false, // 不清空输出目录，以便多次构建
    sourcemap: false,
    minify: false, // 在开发阶段禁用压缩以节省内存
    lib: {
      entry: '',
      name: '',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': '_',
          moment: 'moment'
        }
      }
    }
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})