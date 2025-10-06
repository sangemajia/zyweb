import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import external from '../vite-configs/external-deps';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  build: {
    outDir: '../../dist/client/fine-components/detail',
    lib: {
      entry: path.resolve(__dirname, '../../src/renderer/src/pages/film/components/Detail.vue'),
      name: 'Detail',
      formats: ['es'],
      fileName: (format) => `detail.${format}.js`
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