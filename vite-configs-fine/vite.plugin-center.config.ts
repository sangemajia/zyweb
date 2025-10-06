import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import external from '../../../vite-configs/external-deps';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: '../../dist/client/fine-components/plugin-center',
    lib: {
      entry: path.resolve(__dirname, '../../src/renderer/src/pages/lab/components/pluginCenter/index.vue'),
      name: 'PluginCenter',
      formats: ['es'],
      fileName: (format) => `plugin-center.${format}.js`
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