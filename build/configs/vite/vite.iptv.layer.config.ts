import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// IPTV页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'iptv',
  input: {
        'IptvHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvHeader.vue'),
        'IptvList': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvList.vue'),
        'IptvCard': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvCard.vue'),
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/iptv')
});