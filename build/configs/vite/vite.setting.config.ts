import { createViteConfig } from './vite.common.config';
import path from 'path';

// Setting页面构建配置
export default createViteConfig({
  name: 'setting',
  input: {
    'index': path.resolve(__dirname, '../../../src/renderer/src/pages/setting/entry.js'),
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/setting')
});
