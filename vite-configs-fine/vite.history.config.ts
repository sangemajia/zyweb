import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import external from '../../../vite-configs/external-deps';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../../dist/client/fine-components/history',
    lib: {
      entry: path.resolve(__dirname, '../../src/renderer/src/pages/chase/components/history/index.vue'),
      name: 'History',
      formats: ['es'],
      fileName: (format) => `history.${format}.js`
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