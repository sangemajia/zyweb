import { createViteConfig } from './vite.common.config';
import path from 'path';

// Film大组件层构建配置
export default createViteConfig({
  name: 'film-large',
  input: {
        'FilmPage': path.resolve(__dirname, '../../../src/renderer/src/pages/film/FilmPage.vue'),
  },
  external: [
        './film-medium/assets/FilmHeader-*.js',
        './film-medium/assets/FilmFilter-*.js',
        './film-medium/assets/FilmList-*.js',
        './shared-components/assets/SharedButton-*.js',
        './shared-components/assets/SharedCard-*.js',
        './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '../../../dist/zyweb/film-large'
});
