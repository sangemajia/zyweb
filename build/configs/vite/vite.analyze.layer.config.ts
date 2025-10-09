import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Analyze页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'analyze',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/analyze/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/analyze')
});