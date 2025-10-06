import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import external from '../../../vite-configs/external-deps';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../../dist/client/fine-components/ai-brain',
    lib: {
      entry: path.resolve(__dirname, '../../src/renderer/src/pages/lab/components/aiBrain/index.vue'),
      name: 'AiBrain',
      formats: ['es'],
      fileName: (format) => `ai-brain.${format}.js`
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