import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Home页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'home',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/home/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/home')
});