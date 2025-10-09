import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 导入外部依赖
const { readExternalDeps } = require('./external-deps.cjs');

/**
 * 创建通用Vite配置
 * @param {Object} options 配置选项
 * @param {string} options.name 组件名称
 * @param {Object} options.input 输入配置
 * @param {Array} options.external 外部依赖
 * @param {Object} options.manualChunks 手动分块配置
 * @param {string} options.outDir 输出目录
 */
export function createViteConfig(options) {
  const {
    name,
    input,
    external = [],
    manualChunks,
    outDir
  } = options;

  return defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../../src/renderer/src'),
        '@renderer': path.resolve(__dirname, '../../../src/renderer'),
        '@main': path.resolve(__dirname, '../../../src/main'),
      },
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'webview' || tag === 'title-bar',
          },
        },
      }),
    ],
    build: {
      outDir: outDir || path.resolve(__dirname, `../../../dist/zyweb/${name}`),
      emptyOutDir: true,
      // 禁用压缩以减少内存使用
      minify: false,
      // 构建优化选项
      rollupOptions: {
        input: input,
        output: {
          // 启用代码分割以优化构建
          manualChunks: manualChunks || ((id) => {
            // 对于特定页面的构建，只打包该页面相关的代码
            if (name !== 'shared-components') {
              // 如果是特定页面，将该页面相关的代码打包在一起
              if (id.includes(`src/renderer/src/pages/${name}/`)) {
                return `${name}-page`;
              }
              // 将共享组件打包到vendor中
              if (id.includes('src/renderer/src/components/shared/')) {
                return 'shared-components';
              }
              // 将node_modules打包到vendor中
              if (id.includes('node_modules')) {
                return 'vendor';
              }
              // 将其他代码打包到app中
              if (id.includes('src/renderer/src')) {
                return 'app';
              }
            } else {
              // 对于共享组件，只打包共享组件相关的代码
              if (id.includes('src/renderer/src/components/shared/')) {
                return 'shared-components';
              }
              // 将node_modules打包到vendor中
              if (id.includes('node_modules')) {
                return 'vendor';
              }
            }
          }),
        },
        external: [
          ...readExternalDeps(),
          ...external
        ],
      },
      // 禁用 CSS 代码分割
      cssCodeSplit: false,
      // 降低 chunk 大小警告限制
      chunkSizeWarningLimit: 100,
      // 添加构建性能优化
      brotliSize: false, // 不计算 brotli 大小，提高构建速度
      sourcemap: false,  // 不生成 sourcemap，减少内存占用
      // 添加更多构建优化选项
      reportCompressedSize: false, // 不计算压缩大小，提高构建速度
    },
    // 添加Vite性能优化选项
    optimizeDeps: {
      // 禁用预构建以减少内存使用
      noDiscovery: true,
      include: undefined,
    },
    // 禁用HMR以减少内存使用
    server: {
      hmr: false,
    },
  });
}