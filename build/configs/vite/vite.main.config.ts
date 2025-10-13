import { createViteConfig } from './vite.common.config';
import path from 'path';

// 主入口构建配置
export default createViteConfig({
  name: 'main',
  input: {
        'main': path.resolve(__dirname, '../../../src/renderer/src/web-entry.js'),
  },
  external: [
    // 添加对基础组件的引用
    '../shared-components/assets/SharedButton-*.js',
    '../shared-components/assets/SharedCard-*.js',
    '../shared-components/assets/SimpleShared-*.js',
    '../shared-components/assets/MediaCard-*.js',
    '../shared-components/assets/SearchBox-*.js',
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/main')
});