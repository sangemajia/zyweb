import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Chase页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'chase',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/chase/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/chase')
});