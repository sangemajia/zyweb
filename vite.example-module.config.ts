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
    vue(),
  ],
  build: {
    outDir: 'dist/example-module',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    lib: {
      entry: 'src/renderer/src/components/example/ExampleModule.vue',
      name: 'ExampleModule',
      formats: ['es'],
      fileName: 'example-module'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})