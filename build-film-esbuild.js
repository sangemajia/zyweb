const { build } = require('esbuild');

build({
  entryPoints: ['src/renderer/src/pages/film/index.vue'],
  bundle: true,
  outfile: 'dist/web/modules/film/film-module.js',
  format: 'esm',
  external: [
    'vue',
    'vue-router',
    'pinia',
    'tdesign-vue-next',
    'axios',
    'lodash-es',
    'moment',
    '@vueuse/core',
    'v3-infinite-loading',
    '@microsoft/fetch-event-source',
    'he',
    'pako',
    'wxmp-rsa',
    'sm-crypto',
    'hls.js',
    'flv.js',
    'shaka-player',
    'mpegts.js'
  ],
  minify: false,
  sourcemap: false,
}).catch(() => process.exit(1));