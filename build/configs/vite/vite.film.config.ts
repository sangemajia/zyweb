import { createViteConfig } from './vite.common.config';
import path from 'path';

// Film页面构建配置
export default createViteConfig({
  name: 'film',
  input: {
        'FilmHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmHeader.vue'),
        'FilmFilter': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmFilter.vue'),
        'FilmList': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmList.vue'),
        'FilmCard': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmCard.vue'),
        'Detail': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/Detail.vue'),
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/film/index.vue'),
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '../../../dist/zyweb/film'
});
