import { createViteConfig } from './vite.common.config';
import path from 'path';

// 通用分层构建配置
export function createCommonLayerConfig(options) {
  const {
    name,
    input,
    external = [],
    outDir
  } = options;

  return createViteConfig({
    name,
    input,
    external: [
      // 添加对基础组件的引用
      './shared-components/assets/SharedButton-*.js',
      './shared-components/assets/SharedCard-*.js',
      './shared-components/assets/SimpleShared-*.js',
      // 添加对共享工具的引用
      './shared-utils/assets/utils-*.js',
      './shared-utils/assets/tool-*.js',
      './shared-utils/assets/request-*.js',
      ...external
    ],
    outDir: outDir || path.resolve(__dirname, `../../../dist/zyweb/${name}`)
  });
}