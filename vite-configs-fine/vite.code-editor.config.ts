import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 功能组件构建配置
export default defineConfig({
  root: '/workspace/zyweb', // 设置根目录为项目根目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src/renderer/src'),
      '@renderer': path.resolve(__dirname, '../src/renderer'),
      '@main': path.resolve(__dirname, '../src/main'),
    },
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'webview' || tag === 'title-bar',
          // 减少编译时内存使用
          whitespace: 'condense',
        },
      },
    }),
  ],
  build: {
    outDir: '../dist/client/fine-components/code-editor',
    emptyOutDir: true,
    sourcemap: false,
    minify: false, // 禁用压缩以节省内存
    lib: {
      entry: path.resolve(__dirname, '../src/renderer/src/components/code-editor/build-entry.ts'),
      name: 'code-editor',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment',
        '@vueuse/core',
        'monaco-editor',
        'monaco-editor/esm/vs/language/json/json.worker',
        'monaco-editor/esm/vs/language/css/css.worker',
        'monaco-editor/esm/vs/language/html/html.worker',
        'monaco-editor/esm/vs/language/typescript/ts.worker',
        'monaco-editor/esm/vs/editor/editor.worker',
        'monaco-editor/esm/vs/language/json/json.worker?worker',
        'monaco-editor/esm/vs/language/css/css.worker?worker',
        'monaco-editor/esm/vs/language/html/html.worker?worker',
        'monaco-editor/esm/vs/language/typescript/ts.worker?worker',
        'monaco-editor/esm/vs/editor/editor.worker?worker',
        'splitpanes',
        'splitpanes/dist/splitpanes.css'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': '_',
          moment: 'moment',
          '@vueuse/core': 'VueUse',
          'monaco-editor': 'monaco',
          'splitpanes': 'Splitpanes',
          'splitpanes/dist/splitpanes.css': 'SplitpanesCSS'
        },
        // 减少每个chunk的大小
        compact: true,
      },
      // 减少内存使用
      preserveEntrySignatures: false,
    },
    // 增加内存限制
    chunkSizeWarningLimit: 200000, // 200MB
    brotliSize: false,
    // 进一步减少内存使用
    cssCodeSplit: true,
    modulePreload: false,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
  // 减少内存使用的实验性选项
  worker: {
    format: 'es',
  },
})