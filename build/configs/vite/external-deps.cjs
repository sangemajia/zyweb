// External dependencies array
const externalDeps = [
  'vue',
  'vue-router',
  'pinia',
  'tdesign-vue-next',
  'axios',
  'lodash-es',
  'moment',
  '@vueuse/core',
  'v3-infinite-loading',
  'tdesign-icons-vue-next',
  'he',
  'pako',
  'crypto-js',
  'wxmp-rsa',
  'sm-crypto',
  'uuid',
  'cheerio',
  'flv.js',
  'hls.js',
  'shaka-player',
  'dayjs',
  'entities',
  'm3u8-parser',
  'markdown-it',
  'markdown-it-mathjax3',
  'p-queue',
  'splitpanes',
  'vue-i18n'
];

function readExternalDeps() {
  return externalDeps;
}

module.exports = externalDeps;
module.exports.readExternalDeps = readExternalDeps;