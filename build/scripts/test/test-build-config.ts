import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
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
    outDir: path.resolve(__dirname, 'dist/test'),
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        'index': path.resolve(__dirname, 'src/renderer/src/pages/lab/entry.js'),
      },
    },
    sourcemap: false,
  },
  optimizeDeps: {
    noDiscovery: true,
  },
  server: {
    hmr: false,
  },
})