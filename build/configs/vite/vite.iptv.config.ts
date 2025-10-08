import { createViteConfig } from './vite.common.config';
import path from 'path';

// IPTV页面构建配置
export default createViteConfig({
  name: 'iptv',
  input: {
        'IptvHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvHeader.vue'),
        'IptvList': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvList.vue'),
        'IptvCard': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvCard.vue'),
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/index.vue'),
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '../../../dist/zyweb/iptv'
});
