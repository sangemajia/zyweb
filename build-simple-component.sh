#!/bin/bash
# 简单的组件构建脚本

echo "开始构建简单测试组件..."

# 创建输出目录
mkdir -p dist/simple-component

# 使用 Vue CLI 工具编译组件
# 由于我们没有 Vue CLI，我们直接复制组件文件作为示例
echo "复制组件文件作为示例..."
cp src/renderer/src/components/SimpleTest.vue dist/simple-component/

# 创建一个简单的包文件
cat > dist/simple-component/package.json << EOF
{
  "name": "simple-test-component",
  "version": "1.0.0",
  "main": "SimpleTest.vue",
  "module": "SimpleTest.vue",
  "files": [
    "SimpleTest.vue"
  ]
}
EOF

echo "简单组件构建完成"