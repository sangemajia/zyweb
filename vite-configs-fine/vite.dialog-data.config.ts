import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import external from '../../vite-configs/external-deps';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../../dist/client/fine-components/dialog-data',
    lib: {
      entry: path.resolve(__dirname, '../../src/renderer/src/pages/setting/components/base/components/DialogData.vue'),
      name: 'DialogData',
      formats: ['es'],
      fileName: (format) => `dialog-data.${format}.js`
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