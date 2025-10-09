import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Setting页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'setting',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/setting/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/setting')
});