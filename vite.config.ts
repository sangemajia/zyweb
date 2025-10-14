import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import svgLoader from 'vite-svg-loader';

// 按需加载T-Design组件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

const CWD = process.cwd();

// 设置Node.js内存限制
process.env.NODE_OPTIONS = '--max-old-space-size=512';

// see config at https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_API_URL, VITE_API_URL_PREFIX } = loadEnv(mode, CWD);
  return {
    root: resolve(__dirname, 'src/renderer'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@': resolve('src/renderer/src'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist/web'),
      emptyOutDir: true, // 打包时先清空上一次构建生成的目录
      sourcemap: false, // 关闭生成map文件 可以达到缩小打包体积
      minify: false, // 关闭压缩
      chunkSizeWarningLimit: 1000, // 打包后超过1kb的会单独打包
      assetsInlineLimit: 2048, // 小于2kb的图片会转成base64
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html'),
        output: {
          entryFileNames: `assets/entry/[name]_[hash].js`, // 引入文件名的名称
          chunkFileNames: `assets/chunk/[name]_[hash].js`, // 包的入口文件名称
          assetFileNames: `assets/static/[ext]/[name]_[hash].[ext]`, // 资源文件像 字体，图片等
          manualChunks: {
            // 减少手动分块，只保留必要的
            'video-decoder': ['dashjs', 'flv.js', 'hls.js', 'mpegts.js','shaka-player'],
            tdesign: ['tdesign-vue-next', 'tdesign-icons-vue-next'],
            vue: [
              'vue',
              'vue-router',
              'pinia',
              'vue-i18n',
            ],
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${resolve('src/renderer/src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview',
          },
        },
      }),
      vueJsx(),
      vueDevTools(),
      svgLoader(),
      AutoImport({
        resolvers: [
          TDesignResolver({
            library: 'vue-next',
          }),
        ],
      }),
      Components({
        resolvers: [
          TDesignResolver({
            library: 'vue-next',
          }),
        ],
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true, // 端口冲突自动分配端口
      proxy: {
        [VITE_API_URL_PREFIX]: {
          target: VITE_API_URL, // 后台接口域名
          changeOrigin: true, //是否跨域
        },
        '/api': {
          target: 'http://localhost:9978', // 与ZyPlayer共享后端服务
          changeOrigin: true,
        },
      },
    },
  };
});