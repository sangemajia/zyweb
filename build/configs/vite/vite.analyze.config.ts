import { createViteConfig } from './vite.common.config';
import path from 'path';

// Analyze页面构建配置
export default createViteConfig({
  name: 'analyze',
  input: {

        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/analyze/index.vue'),
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/analyze')
});
