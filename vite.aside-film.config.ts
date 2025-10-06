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
    outDir: 'dist/web/modules/play/asideFilm',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    lib: {
      entry: 'src/renderer/src/pages/play/componets/AsideFilm.vue',
      name: 'AsideFilmModule',
      formats: ['es'],
      fileName: 'aside-film-module'
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
        '@vueuse/core'
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
          '@vueuse/core': 'VueUse'
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: false,
    brotliSize: false
  }
})