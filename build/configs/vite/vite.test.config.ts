import { createViteConfig } from './vite.common.config';
import path from 'path';

// Test页面构建配置
export default createViteConfig({
  name: 'test',
  input: {
        'main': path.resolve(__dirname, '../../../src/renderer/src/pages/test/entry.js'),
  },
  external: [
    // 添加对基础组件的引用
    '../shared-components/index.es.js',
    '../shared-components/index.umd.js',
    '../shared-components/shared-components.css',
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/test')
});