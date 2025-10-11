import { createViteConfig } from './vite.common.config';
import path from 'path';

// Home页面构建配置
export default createViteConfig({
  name: 'home',
  input: {
        'main': path.resolve(__dirname, '../../../src/renderer/src/pages/home/entry.js'),
  },
  external: [
    // 添加对基础组件的引用
    '../shared-components/assets/SharedButton-*.js',
    '../shared-components/assets/SharedCard-*.js',
    '../shared-components/assets/SimpleShared-*.js',
    '../shared-components/assets/MediaCard-*.js',
    '../shared-components/assets/SearchBox-*.js',
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/home')
});
