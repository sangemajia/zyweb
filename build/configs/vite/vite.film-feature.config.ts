import { createViteConfig } from './vite.common.config';
import path from 'path';

// Film功能页面层构建配置
export default createViteConfig({
  name: 'film-feature',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/film/index.html'),
  },
  external: [
        './film-large/assets/FilmPage-*.js',
        './film-medium/assets/FilmHeader-*.js',
        './film-medium/assets/FilmFilter-*.js',
        './film-medium/assets/FilmList-*.js',
        './shared-components/assets/SharedButton-*.js',
        './shared-components/assets/SharedCard-*.js',
        './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '../../../dist/zyweb/film-feature'
});
