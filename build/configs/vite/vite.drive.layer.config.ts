import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Drive页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'drive',
  input: {
        'DriveHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveHeader.vue'),
        'DriveList': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveList.vue'),
        'DriveCard': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveCard.vue'),
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/drive')
});