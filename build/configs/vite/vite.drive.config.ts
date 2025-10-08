import { createViteConfig } from './vite.common.config';
import path from 'path';

// Drive页面构建配置
export default createViteConfig({
  name: 'drive',
  input: {
        'DriveHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveHeader.vue'),
        'DriveList': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveList.vue'),
        'DriveCard': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveCard.vue'),
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/index.vue'),
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/drive')
});
