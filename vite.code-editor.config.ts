import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

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
    outDir: 'dist/web/modules/lab/jsEdit',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    lib: {
      entry: 'src/renderer/src/pages/lab/components/jsEdit/index.vue',
      name: 'JsEditModule',
      formats: ['es'],
      fileName: 'js-edit-module'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment',
        '@vueuse/core',
        'splitpanes',
        'json5',
        'js-beautify'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': 'Lodash',
          moment: 'moment',
          '@vueuse/core': 'VueUse',
          splitpanes: 'Splitpanes',
          json5: 'JSON5',
          'js-beautify': 'jsBeautify'
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: false,
    brotliSize: false,
    assetsInlineLimit: 0,
    modulePreload: false
  }
})