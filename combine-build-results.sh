#!/bin/bash
# 组合构建结果脚本

echo "开始组合构建结果..."

# 创建最终输出目录
mkdir -p /workspace/dist/client/web-final

# 复制主HTML文件
echo "正在复制主HTML文件..."
cp /workspace/zyweb/index.html /workspace/dist/client/web-final/

# 复制样式文件
echo "正在复制样式文件..."
mkdir -p /workspace/dist/client/web-final/src/renderer/src/style
cp -r /workspace/zyweb/src/renderer/src/style/* /workspace/dist/client/web-final/src/renderer/src/style/

# 复制共享组件
echo "正在复制共享组件..."
mkdir -p /workspace/dist/client/web-final/src/renderer/src/components/shared
cp -r /workspace/zyweb/src/renderer/src/components/shared/* /workspace/dist/client/web-final/src/renderer/src/components/shared/

# 复制工具函数
echo "正在复制工具函数..."
mkdir -p /workspace/dist/client/web-final/src/renderer/src/utils
cp /workspace/zyweb/src/renderer/src/utils/shared-utils.ts /workspace/dist/client/web-final/src/renderer/src/utils/

# 复制构建的组件
echo "正在复制构建的组件..."
mkdir -p /workspace/dist/client/web-final/components
cp -r /workspace/dist/client/components/* /workspace/dist/client/web-final/components/

# 创建组件加载器
echo "正在创建组件加载器..."
cat > /workspace/dist/client/web-final/component-loader.js << 'EOF'
// 组件加载器
console.log('组件加载器已启动');

// 加载组件的函数
window.loadComponent = async (componentName) => {
  console.log(`正在加载组件: ${componentName}`);
  
  try {
    // 动态导入构建的组件
    const module = await import(`./components/${componentName}/index.js`);
    console.log(`组件 ${componentName} 加载完成`, module);
    return module;
  } catch (error) {
    console.error(`组件 ${componentName} 加载失败:`, error);
    return null;
  }
};

// 预加载常用组件
window.preloadComponents = async (componentNames) => {
  console.log(`正在预加载组件: ${componentNames.join(', ')}`);
  
  const loadPromises = componentNames.map(name => loadComponent(name));
  return await Promise.all(loadPromises);
};

console.log('组件加载器初始化完成');
EOF

# 更新HTML文件以使用组件加载器
echo "正在更新HTML文件..."
sed -i 's|<script type="module" src="/src/renderer/src/main.ts"></script>|<script src="./component-loader.js"></script>|g' /workspace/dist/client/web-final/index.html

echo "构建结果组合完成"
echo "最终输出目录: /workspace/dist/client/web-final"