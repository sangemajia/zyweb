#!/bin/bash
# 按功能模块逐个构建的脚本

echo "开始按功能模块逐个构建..."

# 创建输出目录
mkdir -p dist/web/modules

# 定义功能模块列表
MODULES=("film" "iptv" "drive" "play" "analyze" "chase" "setting" "lab" "test")

# 为每个模块创建单独的构建配置
for module in "${MODULES[@]}"; do
  echo "正在构建模块: $module"
  
  # 创建临时配置文件
  cat > vite.temp.config.ts << EOF
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer/src'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@main': path.resolve(__dirname, 'src/main'),
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
    outDir: 'dist/web/modules',
    emptyOutDir: false,
    sourcemap: false,
    minify: false,
    lib: {
      entry: 'src/renderer/src/pages/$module/index.vue',
      name: '${module}Module',
      formats: ['es'],
      fileName: '${module}-module'
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment'
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'tdesign-vue-next': 'TDesign',
          axios: 'axios',
          'lodash-es': '_',
          moment: 'moment'
        }
      }
    }
  },
  optimizeDeps: {
    noDiscovery: true,
    include: undefined,
  },
})
EOF

  # 使用临时配置文件构建模块
  node --max-old-space-size=50 ./node_modules/.bin/vite build --config vite.temp.config.ts
  
  # 删除临时配置文件
  rm vite.temp.config.ts
  
  echo "模块 $module 构建完成"
done

echo "所有模块构建完成"