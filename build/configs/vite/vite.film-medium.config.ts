import { createViteConfig } from './vite.common.config';
import path from 'path';

// Film中组件层构建配置
export default createViteConfig({
  name: 'film-medium',
  input: {
        'FilmHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmHeader.vue'),
        'FilmFilter': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmFilter.vue'),
        'FilmList': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmList.vue'),
  },
  external: [
        './shared-components/assets/SharedButton-*.js',
        './shared-components/assets/SharedCard-*.js',
        './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '../../../dist/zyweb/film-medium'
});
