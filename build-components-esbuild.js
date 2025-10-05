const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// 组件列表
const components = ['film', 'iptv', 'drive', 'play', 'analyze', 'chase', 'setting', 'lab', 'test'];

// 创建简单的JavaScript入口文件
function createSimpleEntry(componentName) {
  const entryContent = `
// ${componentName} component entry
export const render = () => {
  return '<div style="padding: 20px; background-color: #e8f5e9; border-radius: 5px;"><h3>${componentName} 组件</h3><p>这是一个简单的 ${componentName} 组件示例。</p></div>';
};

export const name = '${componentName}';

export const getComponentInfo = () => {
  return {
    name: '${componentName}',
    description: '${componentName} 功能模块',
    version: '1.0.0'
  };
};

export default {
  render,
  name,
  getComponentInfo
};
`;
  
  const entryPath = `src/renderer/src/pages/${componentName}/simple-entry.js`;
  fs.writeFileSync(entryPath, entryContent);
  return entryPath;
}

// 构建单个组件
async function buildComponent(componentName) {
  console.log(`Building component: ${componentName}`);
  
  // 创建输出目录
  const outDir = `dist/client/components/${componentName}`;
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // 创建简单的入口文件
  const entryPath = createSimpleEntry(componentName);
  
  try {
    // 使用esbuild构建
    await esbuild.build({
      entryPoints: [entryPath],
      bundle: true,
      outfile: `${outDir}/index.js`,
      format: 'esm',
      external: [
        'vue',
        'vue-router',
        'pinia',
        'tdesign-vue-next',
        'axios',
        'lodash-es',
        'moment',
        '@vueuse/core'
      ],
      minify: false,
      sourcemap: false,
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    
    console.log(`Component ${componentName} built successfully`);
    
    // 清理临时入口文件
    fs.unlinkSync(entryPath);
  } catch (error) {
    console.error(`Failed to build component ${componentName}:`, error);
    // 清理临时入口文件
    if (fs.existsSync(entryPath)) {
      fs.unlinkSync(entryPath);
    }
    throw error;
  }
}

// 构建所有组件
async function buildAllComponents() {
  console.log('Starting to build all components...');
  
  for (const component of components) {
    try {
      await buildComponent(component);
    } catch (error) {
      console.error(`Failed to build component ${component}:`, error);
      // 继续构建其他组件
    }
  }
  
  console.log('All components build process completed');
}

// 运行构建
buildAllComponents().catch((error) => {
  console.error('Build process failed:', error);
  process.exit(1);
});