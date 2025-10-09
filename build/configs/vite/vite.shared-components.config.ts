import { createViteConfig } from './vite.common.config';
import path from 'path';

// 基础组件构建配置
export default createViteConfig({
  name: 'shared-components',
  input: {
    'index': path.resolve(__dirname, '../../../src/renderer/src/components/shared/entry.js'),
  },
  external: [
    // 移除 'vue'，让它被打包进去
  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/shared-components')
});
