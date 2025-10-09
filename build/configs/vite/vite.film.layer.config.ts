import { createCommonLayerConfig } from './vite.common-layer.config';
import path from 'path';

// Film页面构建配置（使用通用分层方案）
export default createCommonLayerConfig({
  name: 'film',
  input: {
        'FilmHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmHeader.vue'),
        'FilmFilter': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmFilter.vue'),
        'FilmList': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmList.vue'),
        'FilmCard': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmCard.vue'),
        'Detail': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/Detail.vue'),
        'index': path.resolve(__dirname, '../../../src/renderer/src/pages/film/index.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/film')
});