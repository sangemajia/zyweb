#!/bin/bash
# 按顺序构建所有功能模块的脚本

echo "开始按顺序构建所有功能模块..."

# 定义功能模块列表
MODULES=("film" "iptv" "drive" "play" "analyze" "chase" "setting" "lab" "test")

# 为每个模块构建
for module in "${MODULES[@]}"; do
  echo "正在构建模块: $module"
  
  # 使用对应的配置文件构建模块
  npm run build:web:$module
  
  # 检查构建是否成功
  if [ $? -eq 0 ]; then
    echo "模块 $module 构建成功"
  else
    echo "模块 $module 构建失败"
    exit 1
  fi
done

echo "所有模块构建完成"