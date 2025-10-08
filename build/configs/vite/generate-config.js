#!/usr/bin/env node
// 配置生成器 - 动态生成Vite配置文件

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 组件配置定义
const componentConfigs = {
  // 基础组件层
  'shared-components': {
    name: '基础组件层',
    input: {
      'SharedButton': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SharedButton.vue'),
      'SharedCard': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SharedCard.vue'),
      'SimpleShared': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SimpleShared.vue'),
    },
    external: [],
    outDir: path.resolve(__dirname, '../../../dist/zyweb/shared-components')
  },
  
  // Film中组件层
  'film-medium': {
    name: 'Film中组件层',
    input: {
      'FilmHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmHeader.vue'),
      'FilmFilter': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmFilter.vue'),
      'FilmList': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmList.vue'),
    },
    external: [
      // 添加对基础组件的引用
      './shared-components/assets/SharedButton-*.js',
      './shared-components/assets/SharedCard-*.js',
      './shared-components/assets/SimpleShared-*.js',
    ],
    outDir: path.resolve(__dirname, '../../../dist/zyweb/film-medium')
  },
  
  // Film大组件层
  'film-large': {
    name: 'Film大组件层',
    input: {
      'FilmPage': path.resolve(__dirname, '../../../src/renderer/src/pages/film/FilmPage.vue'),
    },
    external: [
      // 添加对中组件的引用
      './film-medium/assets/FilmHeader-*.js',
      './film-medium/assets/FilmFilter-*.js',
      './film-medium/assets/FilmList-*.js',
      // 添加对基础组件的引用
      './shared-components/assets/SharedButton-*.js',
      './shared-components/assets/SharedCard-*.js',
      './shared-components/assets/SimpleShared-*.js',
    ],
    outDir: path.resolve(__dirname, '../../../dist/zyweb/film-large')
  },
  
  // Film功能页面层
  'film-feature': {
    name: 'Film功能页面层',
    input: {
      'index': path.resolve(__dirname, '../../../src/renderer/src/pages/film/index.html'),
    },
    external: [
      // 添加对大组件的引用
      './film-large/assets/FilmPage-*.js',
      // 添加对中组件的引用
      './film-medium/assets/FilmHeader-*.js',
      './film-medium/assets/FilmFilter-*.js',
      './film-medium/assets/FilmList-*.js',
      // 添加对基础组件的引用
      './shared-components/assets/SharedButton-*.js',
      './shared-components/assets/SharedCard-*.js',
      './shared-components/assets/SimpleShared-*.js',
    ],
    outDir: path.resolve(__dirname, '../../../dist/zyweb/film-feature')
  },
  
  // 前端毛坯层
  'frontend-shell': {
    name: '前端毛坯层',
    input: {
      'index': path.resolve(__dirname, '../../../src/renderer/src/index.html'),
    },
    external: [
      // 添加对功能页面的引用
      './film-feature/assets/index-*.js',
      // 添加对大组件的引用
      './film-large/assets/FilmPage-*.js',
      // 添加对中组件的引用
      './film-medium/assets/FilmHeader-*.js',
      './film-medium/assets/FilmFilter-*.js',
      './film-medium/assets/FilmList-*.js',
      // 添加对基础组件的引用
      './shared-components/assets/SharedButton-*.js',
      './shared-components/assets/SharedCard-*.js',
      './shared-components/assets/SimpleShared-*.js',
      // 添加App.vue依赖的模块
      '@vueuse/core/useLocalStorage',
      '@vueuse/core/useScriptTag',
      '@vueuse/core/usePreferredDark',
      // 添加SystemControl.vue依赖的模块
      '@electron-uikit/titlebar/renderer'
    ],
    outDir: path.resolve(__dirname, '../../../dist/zyweb/frontend-shell')
  },
  
  // 完整应用层
  'complete-app': {
    name: '完整应用层',
    input: {
      'index': path.resolve(__dirname, '../../../src/renderer/src/index.html'),
    },
    external: [
      // 添加对前端毛坯的引用
      './frontend-shell/assets/index-*.js',
      // 添加对功能页面的引用
      './film-feature/assets/index-*.js',
      // 添加对大组件的引用
      './film-large/assets/FilmPage-*.js',
      // 添加对中组件的引用
      './film-medium/assets/FilmHeader-*.js',
      './film-medium/assets/FilmFilter-*.js',
      './film-medium/assets/FilmList-*.js',
      // 添加对基础组件的引用
      './shared-components/assets/SharedButton-*.js',
      './shared-components/assets/SharedCard-*.js',
      './shared-components/assets/SimpleShared-*.js',
      // 添加App.vue依赖的模块
      '@vueuse/core/useLocalStorage',
      '@vueuse/core/useScriptTag',
      '@vueuse/core/usePreferredDark',
      // 添加SystemControl.vue依赖的模块
      '@electron-uikit/titlebar/renderer'
    ],
    outDir: path.resolve(__dirname, '../../../dist/zyweb/complete-app')
  }
};

// 生成Vite配置文件内容
function generateViteConfigContent(componentKey, config) {
  const { name, input, external, outDir } = config;
  
  // 格式化输入配置
  const formattedInput = Object.entries(input).map(([key, value]) => 
    `        '${key}': path.resolve(__dirname, '${path.relative(__dirname, value)}'),`
  ).join('\n');
  
  // 格式化外部依赖
  const formattedExternal = external.map(dep => 
    `        '${dep}',`
  ).join('\n');
  
  return `import { createViteConfig } from './vite.common.config';
import path from 'path';

// ${name}构建配置
export default createViteConfig({
  name: '${componentKey}',
  input: {
${formattedInput}
  },
  external: [
${formattedExternal}
  ],
  outDir: '${path.relative(__dirname, outDir)}'
});
`;
}

// 生成构建脚本内容
function generateBuildScriptContent(componentKey, config) {
  const { name } = config;
  
  return `#!/bin/bash
# ${name}构建脚本

# 导入通用构建函数
# source "\${BASH_SOURCE%/*}/build-template.sh"  # 这种方式在某些环境下可能不工作

# 直接包含通用构建函数
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "\${BLUE}[INFO]\${NC} \$1"
}

log_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} \$1"
}

log_warning() {
    echo -e "\${YELLOW}[WARNING]\${NC} \$1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} \$1"
}

# 获取可用内存（MB）
get_available_memory() {
    free -m | awk '/^Mem:/{print \$7}'
}

# 设置Node.js内存限制
set_node_memory_limit() {
    local memory_limit_mb=1200
    
    # 检查是否存在推荐内存方案并应用
    local component_type=\$1
    local recommendation_file="./build/recommendations/\${component_type}_recommendation.txt"
    if [ -f "\$recommendation_file" ]; then
        # 读取推荐的Node.js内存限制
        local recommended_node_memory=\$(grep "推荐Node.js内存限制" "\$recommendation_file" | awk '{print \$NF}' | sed 's/MB//')
        if [ -n "\$recommended_node_memory" ] && [ "\$recommended_node_memory" -ge 50 ] && [ "\$recommended_node_memory" -le 2000 ]; then
            memory_limit_mb=\$recommended_node_memory
            log_info "已应用推荐的Node.js内存限制: \${memory_limit_mb}MB"
        fi
    fi
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=\${memory_limit_mb} --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: \${memory_limit_mb}MB"
}

# 生成推荐内存方案
generate_memory_recommendation() {
    local component_type=\$1
    local available_memory=\$2
    local memory_limit=\$3
    local build_duration=\$4
    
    # 确保推荐目录存在
    mkdir -p "./build/recommendations"
    
    # 生成推荐内存方案
    local recommendation_file="./build/recommendations/\${component_type}_recommendation.txt"
    local recommended_system_memory=\$((available_memory * 6 / 10))  # 推荐系统可用内存为构建时的60%
    local recommended_node_memory=\$((memory_limit * 6 / 10))  # 推荐Node.js内存限制为分配内存的60%
    
    # 确保推荐值不低于最小值
    if [ \$recommended_system_memory -lt 200 ]; then
        recommended_system_memory=200
    fi
    
    if [ \$recommended_node_memory -lt 100 ]; then
        recommended_node_memory=100
    fi
    
    cat > "\$recommendation_file" << EOF
# \${component_type} 组件构建推荐内存方案

## 构建环境信息
- 构建时间: \$(date)
- 构建耗时: \${build_duration}秒
- 构建时系统可用内存: \${available_memory}MB
- 分配给node进程的内存: \${memory_limit}MB

## 推荐内存配置
- 推荐系统可用内存: \${recommended_system_memory}MB
- 推荐Node.js内存限制: \${recommended_node_memory}MB

## 使用建议
在相似环境下构建时，可以使用以下命令来加快构建速度：
\\\`\\\`\\\`
export NODE_OPTIONS="--max-old-space-size=\${recommended_node_memory}"
# 然后执行相应的构建命令
\\\`\\\`\\\`

## 注意事项
1. 如果系统可用内存低于\${recommended_system_memory}MB，建议增加系统内存或使用更小的组件进行构建
2. 如果构建过程中出现内存不足错误，可以适当降低Node.js内存限制
3. 推荐定期更新此推荐方案，以适应项目规模的变化
EOF

    log_info "已生成 \${component_type} 组件构建推荐内存方案: \${recommendation_file}"
}

# 通用构建函数
build_component() {
    local component_name=\$1
    local config_file=\$2
    
    log_info "开始构建 \${component_name}..."
    
    # 动态计算内存限制
    local memory_limit=1200
    log_info "系统可用内存: \$(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: \${memory_limit}MB (默认值)"
    
    # 设置Node.js内存限制
    set_node_memory_limit "\${component_name}"
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=\$(date +%s)
    
    # 构建组件
    log_info "执行 \${component_name} 构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config "\${config_file}" --minify false --mode development --ssrManifest false
    
    local exit_code=\$?
    local end_time=\$(date +%s)
    local build_duration=\$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=\$(get_available_memory)
    
    if [ \$exit_code -eq 0 ]; then
        log_success "\${component_name} 构建成功!"
        log_info "构建耗时: \${build_duration}秒"
        log_info "构建时可用内存: \${available_memory}MB"
        log_info "分配给node进程的内存: \${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "\${component_name}" \$available_memory \$memory_limit \$build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: \${component_name} 构建失败 (退出码: \$exit_code)"
        log_info "构建耗时: \${build_duration}秒"
        log_info "构建时可用内存: \${available_memory}MB"
        log_info "分配给node进程的内存: \${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return \$exit_code
    fi
}

# 执行构建
build_component "${componentKey}" "build/configs/vite/vite.${componentKey}.config.ts"
`;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const targetComponent = args[0];
  
  // 确保在项目根目录
  process.chdir(path.join(__dirname, '../../..'));
  
  if (targetComponent) {
    // 生成特定组件的配置
    if (componentConfigs[targetComponent]) {
      console.log("生成 " + targetComponent + " 的配置文件...");
      
      // 生成Vite配置文件
      const viteConfigContent = generateViteConfigContent(targetComponent, componentConfigs[targetComponent]);
      const viteConfigPath = path.join(__dirname, "vite." + targetComponent + ".config.ts");
      fs.writeFileSync(viteConfigPath, viteConfigContent);
      console.log("已生成 " + viteConfigPath);
      
      // 生成构建脚本
      const buildScriptContent = generateBuildScriptContent(targetComponent, componentConfigs[targetComponent]);
      const buildScriptPath = path.join(__dirname, "../../scripts/build-" + targetComponent + ".sh");
      fs.writeFileSync(buildScriptPath, buildScriptContent);
      fs.chmodSync(buildScriptPath, '755'); // 添加执行权限
      console.log("已生成 " + buildScriptPath);
      
      console.log('生成完成!');
    } else {
      console.error("未知的组件: " + targetComponent);
      console.log('可用组件:');
      Object.keys(componentConfigs).forEach(key => console.log("  - " + key));
    }
  } else {
    // 生成所有组件的配置
    console.log('生成所有组件的配置文件...');
    
    for (const [componentKey, config] of Object.entries(componentConfigs)) {
      console.log("生成 " + componentKey + " 的配置文件...");
      
      // 生成Vite配置文件
      const viteConfigContent = generateViteConfigContent(componentKey, config);
      const viteConfigPath = path.join(__dirname, "vite." + componentKey + ".config.ts");
      fs.writeFileSync(viteConfigPath, viteConfigContent);
      console.log("已生成 " + viteConfigPath);
      
      // 生成构建脚本
      const buildScriptContent = generateBuildScriptContent(componentKey, config);
      const buildScriptPath = path.join(__dirname, "../../scripts/build-" + componentKey + ".sh");
      fs.writeFileSync(buildScriptPath, buildScriptContent);
      fs.chmodSync(buildScriptPath, '755'); // 添加执行权限
      console.log("已生成 " + buildScriptPath);
    }
    
    console.log('所有配置文件生成完成!');
  }
}

// 执行主函数
main().catch(error => {
  console.error("生成配置文件时发生错误: " + error.message);
  process.exit(1);
});