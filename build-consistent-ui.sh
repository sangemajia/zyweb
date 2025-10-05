#!/bin/bash
# 保持UI一致性的构建脚本 - 内存优化版本

echo "开始构建保持UI一致性的版本..."

# 在构建前执行清理以释放内存
/workspace/cleanup.sh

# 使用Vite构建项目（内存优化版本）
echo "正在使用Vite构建项目..."
node --max-old-space-size=30 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config vite.consistent-ui.config.ts

# 检查构建是否成功
if [ $? -eq 0 ]; then
  echo "项目构建成功"
  
  # 将构建产物复制到最终输出目录
  if [ -d "dist/web-consistent" ]; then
    rm -rf /workspace/dist/client/web-consistent
    mkdir -p /workspace/dist/client/web-consistent
    cp -r dist/web-consistent/* /workspace/dist/client/web-consistent/
    # 清理源码库中的构建产物
    rm -rf dist/web-consistent
  fi
else
  echo "项目构建失败，尝试使用更严格的内存限制..."
  # 如果第一次构建失败，尝试更严格的内存限制
  node --max-old-space-size=20 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config vite.consistent-ui.config.ts
  if [ $? -eq 0 ]; then
    echo "项目构建成功（使用更严格的内存限制）"
    
    # 将构建产物复制到最终输出目录
    if [ -d "dist/web-consistent" ]; then
      rm -rf /workspace/dist/client/web-consistent
      mkdir -p /workspace/dist/client/web-consistent
      cp -r dist/web-consistent/* /workspace/dist/client/web-consistent/
      # 清理源码库中的构建产物
      rm -rf dist/web-consistent
    fi
  else
    echo "项目构建失败，尝试轻量级复制方案..."
    # 如果Vite构建失败，回退到轻量级复制方案
    rm -rf /workspace/dist/client/web-consistent
    mkdir -p /workspace/dist/client/web-consistent
    
    # 复制主HTML文件
    echo "正在复制主HTML文件..."
    cp index.html /workspace/dist/client/web-consistent/index.html
    
    # 复制必要的静态资源
    echo "正在复制静态资源..."
    mkdir -p /workspace/dist/client/web-consistent/src/renderer/src
    cp -r src/renderer/src/assets /workspace/dist/client/web-consistent/src/renderer/src/ 2>/dev/null || echo "警告: 无法复制assets目录"
    cp -r src/renderer/src/style /workspace/dist/client/web-consistent/src/renderer/src/ 2>/dev/null || echo "警告: 无法复制style目录"
    
    # 复制共享组件和工具函数
    echo "正在复制共享组件和工具函数..."
    mkdir -p /workspace/dist/client/web-consistent/src/renderer/src/components/shared
    cp -r src/renderer/src/components/shared/* /workspace/dist/client/web-consistent/src/renderer/src/components/shared/ 2>/dev/null || echo "警告: 无法复制shared组件"
    
    mkdir -p /workspace/dist/client/web-consistent/src/renderer/src/utils
    cp src/renderer/src/utils/shared-utils.ts /workspace/dist/client/web-consistent/src/renderer/src/utils/ 2>/dev/null || echo "警告: 无法复制shared-utils.ts"
    
    # 复制主要的Vue组件
    echo "正在复制主要的Vue组件..."
    mkdir -p /workspace/dist/client/web-consistent/src/renderer/src/pages
    for module in film iptv drive play analyze chase setting lab test; do
      if [ -d "src/renderer/src/pages/$module" ]; then
        mkdir -p /workspace/dist/client/web-consistent/src/renderer/src/pages/$module
        cp -r src/renderer/src/pages/$module/* /workspace/dist/client/web-consistent/src/renderer/src/pages/$module/ 2>/dev/null || echo "警告: 无法复制$module模块"
      fi
    done
    
    # 复制布局组件
    echo "正在复制布局组件..."
    mkdir -p /workspace/dist/client/web-consistent/src/renderer/src/layouts
    cp -r src/renderer/src/layouts/* /workspace/dist/client/web-consistent/src/renderer/src/layouts/ 2>/dev/null || echo "警告: 无法复制layouts目录"
    
    # 复制路由配置
    echo "正在复制路由配置..."
    mkdir -p /workspace/dist/client/web-consistent/src/renderer/src/router
    cp -r src/renderer/src/router/* /workspace/dist/client/web-consistent/src/renderer/src/router/ 2>/dev/null || echo "警告: 无法复制router目录"
    
    # 复制主入口文件
    echo "正在复制主入口文件..."
    cp src/renderer/src/main.ts /workspace/dist/client/web-consistent/src/renderer/src/main.ts 2>/dev/null || echo "警告: 无法复制main.ts"
    cp src/renderer/src/App.vue /workspace/dist/client/web-consistent/src/renderer/src/App.vue 2>/dev/null || echo "警告: 无法复制App.vue"
  fi
fi

echo "UI一致性构建完成"
echo "输出目录: /workspace/dist/client/web-consistent"