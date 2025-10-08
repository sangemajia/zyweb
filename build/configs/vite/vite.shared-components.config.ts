import { createViteConfig } from './vite.common.config';
import path from 'path';

// 基础组件构建配置
export default createViteConfig({
  name: 'shared-components',
  input: {
        'SharedButton': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SharedButton.vue'),
        'SharedCard': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SharedCard.vue'),
        'SimpleShared': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SimpleShared.vue'),
  },
  external: [

  ],
  outDir: path.resolve(__dirname, '../../../dist/zyweb/shared-components')
});
