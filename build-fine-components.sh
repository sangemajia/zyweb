#!/bin/bash
# 细粒度组件排队构建脚本

echo "开始细粒度组件排队构建..."

# 创建输出目录
mkdir -p /workspace/dist/client/fine-components

# 在构建前执行清理以释放内存
/workspace/cleanup.sh

# 1. 构建共享组件
echo "=========================================="
echo "正在构建共享组件"
echo "=========================================="

SHARED_COMPONENTS=("SharedButton" "SharedCard")

for component in "${SHARED_COMPONENTS[@]}"; do
  echo "正在构建共享组件: $component"
  
  # 在每个组件构建前执行清理以释放内存
  /workspace/cleanup.sh
  
  # 显示当前内存使用情况
  echo "当前内存使用情况:"
  free -h
  
  # 构建组件（使用200M内存限制）
  echo "使用Vite构建共享组件 $component..."
  node --max-old-space-size=200 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config /workspace/zyweb/vite-configs-fine/vite.$component.config.ts
  
  # 检查构建是否成功
  if [ $? -eq 0 ]; then
    echo "共享组件 $component 构建成功"
    
    # 将构建产物复制到最终输出目录
    mkdir -p /workspace/dist/client/fine-components/shared
    if [ -d "dist/fine-components/shared" ]; then
      cp -r dist/fine-components/shared/* /workspace/dist/client/fine-components/shared/
      # 清理源码库中的构建产物
      rm -rf dist/fine-components/shared
    fi
  else
    echo "共享组件 $component 构建失败"
  fi
  
  echo "共享组件 $component 构建完成"
  echo ""
done

# 2. 构建功能组件
echo "=========================================="
echo "正在构建功能组件"
echo "=========================================="

FEATURE_COMPONENTS=("common-nav" "title-menu" "player" "code-editor" "markdown-render" "terminal" "share-popup" "shortcut-input" "split" "tag-nav")

for component in "${FEATURE_COMPONENTS[@]}"; do
  echo "正在构建功能组件: $component"
  
  # 在每个组件构建前执行清理以释放内存
  /workspace/cleanup.sh
  
  # 显示当前内存使用情况
  echo "当前内存使用情况:"
  free -h
  
  # 构建组件（使用200M内存限制）
  echo "使用Vite构建功能组件 $component..."
  node --max-old-space-size=200 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config /workspace/zyweb/vite-configs-fine/vite.$component.config.ts
  
  # 检查构建是否成功
  if [ $? -eq 0 ]; then
    echo "功能组件 $component 构建成功"
    
    # 将构建产物复制到最终输出目录
    component_dir=$(echo "$component" | sed 's/-//g')
    mkdir -p /workspace/dist/client/fine-components/$component_dir
    if [ -d "dist/fine-components/$component_dir" ]; then
      cp -r dist/fine-components/$component_dir/* /workspace/dist/client/fine-components/$component_dir/
      # 清理源码库中的构建产物
      rm -rf dist/fine-components/$component_dir
    fi
  else
    echo "功能组件 $component 构建失败"
  fi
  
  echo "功能组件 $component 构建完成"
  echo ""
done

# 3. 构建工具函数
echo "=========================================="
echo "正在构建工具函数"
echo "=========================================="

/workspace/cleanup.sh

echo "当前内存使用情况:"
free -h

echo "使用Vite构建工具函数..."
node --max-old-space-size=200 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config /workspace/zyweb/vite.utils.config.ts

if [ $? -eq 0 ]; then
  echo "工具函数构建成功"
  
  # 将构建产物复制到最终输出目录
  mkdir -p /workspace/dist/client/fine-components/utils
  if [ -d "dist/fine-components/utils" ]; then
    cp -r dist/fine-components/utils/* /workspace/dist/client/fine-components/utils/
    # 清理源码库中的构建产物
    rm -rf dist/fine-components/utils
  fi
else
  echo "工具函数构建失败"
fi

echo "工具函数构建完成"
echo ""

# 4. 构建样式库
echo "=========================================="
echo "正在构建样式库"
echo "=========================================="

/workspace/cleanup.sh

echo "当前内存使用情况:"
free -h

echo "使用Vite构建样式库..."
node --max-old-space-size=200 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config /workspace/zyweb/vite.style.config.ts

if [ $? -eq 0 ]; then
  echo "样式库构建成功"
  
  # 将构建产物复制到最终输出目录
  mkdir -p /workspace/dist/client/fine-components/style
  if [ -d "dist/fine-components/style" ]; then
    cp -r dist/fine-components/style/* /workspace/dist/client/fine-components/style/
    # 清理源码库中的构建产物
    rm -rf dist/fine-components/style
  fi
else
  echo "样式库构建失败"
fi

echo "样式库构建完成"
echo ""

echo "所有细粒度组件构建完成"
echo "输出目录: /workspace/dist/client/fine-components"