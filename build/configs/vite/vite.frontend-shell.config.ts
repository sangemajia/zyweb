import { createViteConfig } from './vite.common.config';
import path from 'path';

// 前端毛坯层构建配置
export default createViteConfig({
  name: 'frontend-shell',
  input: {
        'index': path.resolve(__dirname, '../../../src/renderer/src/index.html'),
  },
  external: [
        './film-feature/assets/index-*.js',
        './film-large/assets/FilmPage-*.js',
        './film-medium/assets/FilmHeader-*.js',
        './film-medium/assets/FilmFilter-*.js',
        './film-medium/assets/FilmList-*.js',
        './shared-components/assets/SharedButton-*.js',
        './shared-components/assets/SharedCard-*.js',
        './shared-components/assets/SimpleShared-*.js',
        '@vueuse/core/useLocalStorage',
        '@vueuse/core/useScriptTag',
        '@vueuse/core/usePreferredDark',
        '@electron-uikit/titlebar/renderer',
  ],
  outDir: '../../../dist/zyweb/frontend-shell'
});
