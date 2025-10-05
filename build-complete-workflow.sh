#!/bin/bash
# 完整构建流程脚本

echo "开始完整的组件化构建流程..."

# 步骤1: 构建各个组件
echo "步骤1: 构建各个组件..."
/workspace/cleanup.sh
/workspace/zyweb/build-components-queue.sh

# 检查组件构建是否成功
if [ $? -eq 0 ]; then
  echo "组件构建成功"
else
  echo "组件构建失败，但继续执行后续步骤..."
fi

# 步骤2: 组合构建结果
echo "步骤2: 组合构建结果..."
/workspace/cleanup.sh
/workspace/zyweb/combine-build-results.sh

# 检查组合是否成功
if [ $? -eq 0 ]; then
  echo "构建结果组合成功"
else
  echo "构建结果组合失败"
  exit 1
fi

echo "完整的组件化构建流程完成"
echo "最终输出目录: /workspace/dist/client/web-final"