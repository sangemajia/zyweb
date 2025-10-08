import { createViteConfig } from './vite.common.config';
import path from 'path';

// Play页面构建配置
export default createViteConfig({
  name: 'play',
  input: {

        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/play/index.vue'),
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '../../../dist/zyweb/play'
});
