#!/bin/bash
# 组件排队构建脚本 - 逐个构建组件

echo "开始逐个构建组件..."

# 定义组件列表
COMPONENTS=("film" "iptv" "drive" "play" "analyze" "chase" "setting" "lab" "test")

# 创建输出目录
mkdir -p /workspace/dist/client/components

# 在构建前执行清理以释放内存
/workspace/cleanup.sh

# 逐个构建组件
for component in "${COMPONENTS[@]}"; do
  echo "=========================================="
  echo "正在构建组件: $component"
  echo "=========================================="
  
  # 在每个组件构建前执行清理以释放内存
  /workspace/cleanup.sh
  
  # 显示当前内存使用情况
  echo "当前内存使用情况:"
  free -h
  
  # 构建组件（使用更少内存限制）
  echo "使用Vite构建组件 $component..."
  # 在构建前执行额外的清理
  /workspace/cleanup.sh
  # 使用更少的内存限制
  node --max-old-space-size=50 --no-warnings /workspace/zyweb/node_modules/.bin/vite build --config /workspace/zyweb/vite-configs/vite.$component.config.ts
  
  # 检查构建是否成功
  if [ $? -eq 0 ]; then
    echo "组件 $component 构建成功"
    
    # 确保输出目录存在
    mkdir -p /workspace/dist/client/components/$component
  else
    echo "组件 $component 构建失败"
    # 继续构建下一个组件，不中断整个过程
  fi
  
  echo "组件 $component 构建完成"
  echo ""
done

echo "所有组件构建完成"
echo "输出目录: /workspace/dist/client/components"