import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Lab页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'lab',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/lab/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/lab')
});