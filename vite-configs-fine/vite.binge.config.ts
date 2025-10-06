import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import external from '../vite-configs/external-deps';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../src/renderer'),
      '@main': path.resolve(__dirname, '../src/main'),
    },
  },
  build: {
    outDir: '../../dist/client/fine-components/binge',
    lib: {
      entry: path.resolve(__dirname, '../src/renderer/src/pages/chase/components/binge/index.vue'),
      name: 'Binge',
      formats: ['es'],
      fileName: (format) => `binge.${format}.js`
    },
    rollupOptions: {
      external: [...external],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});