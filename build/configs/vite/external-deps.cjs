// 外部依赖配置文件
// 用于Vite构建配置中的external选项

/**
 * 读取外部依赖列表
 * @returns {Array} 外部依赖数组
 */
function readExternalDeps() {
  // 常用的外部依赖
  const externalDeps = [
    // Vue相关
    'vue',
    'vue-router',
    'pinia',
    'pinia-plugin-persistedstate',
    'vue-i18n',
    
    // UI组件库
    'tdesign-vue-next',
    'tdesign-icons-vue-next',
    '@imengyu/vue3-context-menu',
    
    // 工具库
    'lodash-es',
    '@vueuse/core',
    'axios',
    'dayjs',
    'uuid',
    'pako',
    'crypto-js',
    'cheerio',
    'highlight.js',
    'markdown-it',
    'markdown-it-mathjax3',
    
    // 媒体播放相关
    'flv.js',
    'hls.js',
    'shaka-player',
    'm3u8-parser',
    
    // 其他
    'fdir',
    'ipaddr.js',
    'entities',
    'jsonpath-plus',
    'p-queue',
    'sm-crypto',
    'splitpanes',
    'v3-infinite-loading',
    'he',
    'wxmp-rsa',
    
    // Electron相关（Web环境中模拟）
    'electron',
    '@electron-uikit/titlebar/renderer',
    
    // Node.js内置模块（在Web环境中模拟）
    'path',
    'fs',
    'os',
    'util',
    'events',
    'stream',
    'buffer',
    'url',
    'querystring'
  ];
  
  return externalDeps;
}

module.exports = { readExternalDeps };