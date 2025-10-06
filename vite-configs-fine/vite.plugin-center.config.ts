import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import external from '../vite-configs/external-deps';

const __dirname = import.meta.dirname;
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
    outDir: '../../dist/client/fine-components/plugin-center',
    // 禁用压缩以减少内存使用
    minify: false,
    lib: {
      entry: path.resolve(__dirname, '../src/renderer/src/pages/lab/components/pluginCenter/index.vue'),
      name: 'PluginCenter',
      formats: ['es'],
      fileName: (format) => `plugin-center.${format}.js`
    },
    rollupOptions: {
      // 减少内存使用
      treeshake: false,
      external: [...external],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});