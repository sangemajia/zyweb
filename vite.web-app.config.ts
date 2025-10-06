import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.', // 设置根目录为项目根目录
  base: './', // 设置基础路径
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
    outDir: 'dist/client/web-app', // 输出目录
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'vuex',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment',
        '@vueuse/core'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          vuex: 'Vuex',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': '_',
          moment: 'moment',
          '@vueuse/core': 'VueUse'
        },
      },
    },
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})