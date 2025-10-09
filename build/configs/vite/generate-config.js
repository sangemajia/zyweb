#!/usr/bin/env node
// 配置生成器 - 动态生成Vite配置文件

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 页面配置定义
const pageConfigs = {
  // Film页面
  'film': {
    name: 'Film页面',
    components: {
      'FilmHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmHeader.vue'),
      'FilmFilter': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmFilter.vue'),
      'FilmList': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmList.vue'),
      'FilmCard': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/FilmCard.vue'),
      'Detail': path.resolve(__dirname, '../../../src/renderer/src/pages/film/components/Detail.vue'),
    },
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/film/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/film')
  },
  
  // IPTV页面
  'iptv': {
    name: 'IPTV页面',
    components: {
      'IptvHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvHeader.vue'),
      'IptvList': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvList.vue'),
      'IptvCard': path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/components/IptvCard.vue'),
    },
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/iptv/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/iptv')
  },
  
  // Drive页面
  'drive': {
    name: 'Drive页面',
    components: {
      'DriveHeader': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveHeader.vue'),
      'DriveList': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveList.vue'),
      'DriveCard': path.resolve(__dirname, '../../../src/renderer/src/pages/drive/components/DriveCard.vue'),
    },
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/drive/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/drive')
  },
  
  // 其他页面
  'lab': {
    name: 'Lab页面',
    components: {},
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/lab/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/lab')
  },
  
  'chase': {
    name: 'Chase页面',
    components: {},
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/chase/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/chase')
  },
  
  'play': {
    name: 'Play页面',
    components: {},
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/play/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/play')
  },
  
  'setting': {
    name: 'Setting页面',
    components: {},
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/setting/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/setting')
  },
  
  'analyze': {
    name: 'Analyze页面',
    components: {},
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/analyze/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/analyze')
  },
  
  'home': {
    name: 'Home页面',
    components: {},
    index: path.resolve(__dirname, '../../../src/renderer/src/pages/home/index.vue'),
    outDir: path.resolve(__dirname, '../../../dist/zyweb/home')
  }
};

// 基础组件配置
const baseComponentsConfig = {
  name: '基础组件',
  components: {
    'SharedButton': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SharedButton.vue'),
    'SharedCard': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SharedCard.vue'),
    'SimpleShared': path.resolve(__dirname, '../../../src/renderer/src/components/shared/SimpleShared.vue'),
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/shared-components')
};

// 通用页面组件配置
const commonPageComponentsConfig = {
  name: '通用页面组件',
  components: {
    // 可以添加一些通用的页面组件
  },
  outDir: path.resolve(__dirname, '../../../dist/zyweb/common-page-components')
};

// 生成基础组件Vite配置文件内容
function generateBaseComponentsViteConfig() {
  const { name, components, outDir } = baseComponentsConfig;
  
  // 格式化输入配置
  const formattedInput = Object.entries(components).map(([key, value]) => 
    `        '${key}': path.resolve(__dirname, '${path.relative(__dirname, value)}'),`
  ).join('\n');
  
  return `import { createViteConfig } from './vite.common.config';
import path from 'path';

// ${name}构建配置
export default createViteConfig({
  name: 'shared-components',
  input: {
${formattedInput}
  },
  external: [

  ],
  outDir: '${path.relative(__dirname, outDir)}'
});
`;
}

// 生成页面Vite配置文件内容
function generatePageViteConfig(pageKey, config) {
  const { name, components, index, outDir } = config;
  
  // 格式化组件输入配置
  const formattedComponents = Object.entries(components).map(([key, value]) => 
    `        '${key}': path.resolve(__dirname, '${path.relative(__dirname, value)}'),`
  ).join('\n');
  
  // 格式化页面输入配置
  const formattedPage = `        'index': path.resolve(__dirname, '${path.relative(__dirname, index)}'),`;
  
  return `import { createViteConfig } from './vite.common.config';
import path from 'path';

// ${name}构建配置
export default createViteConfig({
  name: '${pageKey}',
  input: {
${formattedComponents}
${formattedPage}
  },
  external: [
    // 添加对基础组件的引用
    './shared-components/assets/SharedButton-*.js',
    './shared-components/assets/SharedCard-*.js',
    './shared-components/assets/SimpleShared-*.js',
  ],
  outDir: '${path.relative(__dirname, outDir)}'
});
`;
}

// 生成基础组件构建脚本内容
function generateBaseComponentsBuildScript() {
  const { name } = baseComponentsConfig;
  
  return `#!/bin/bash
# ${name}构建脚本

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
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=\${memory_limit_mb} --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: \${memory_limit_mb}MB"
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
build_component "shared-components" "build/configs/vite/vite.shared-components.config.ts"
`;
}

// 生成页面构建脚本内容
function generatePageBuildScript(pageKey, config) {
  const { name } = config;
  
  return `#!/bin/bash
# ${name}构建脚本

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
build_component "${pageKey}" "build/configs/vite/vite.${pageKey}.config.ts"
`;
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const target = args[0];
  
  // 确保在项目根目录
  process.chdir(path.join(__dirname, '../../..'));
  
  if (target) {
    if (target === 'shared-components') {
      // 生成基础组件配置
      console.log("生成基础组件配置文件...");
      
      // 生成Vite配置文件
      const viteConfigContent = generateBaseComponentsViteConfig();
      const viteConfigPath = path.join(__dirname, "vite.shared-components.config.ts");
      fs.writeFileSync(viteConfigPath, viteConfigContent);
      console.log("已生成 " + viteConfigPath);
      
      // 生成构建脚本
      const buildScriptContent = generateBaseComponentsBuildScript();
      const buildScriptPath = path.join(__dirname, "../../scripts/build-shared-components.sh");
      fs.writeFileSync(buildScriptPath, buildScriptContent);
      fs.chmodSync(buildScriptPath, '755'); // 添加执行权限
      console.log("已生成 " + buildScriptPath);
      
      console.log('基础组件配置生成完成!');
    } else if (pageConfigs[target]) {
      // 生成特定页面配置
      console.log("生成 " + target + " 页面配置文件...");
      
      // 生成Vite配置文件
      const viteConfigContent = generatePageViteConfig(target, pageConfigs[target]);
      const viteConfigPath = path.join(__dirname, "vite." + target + ".config.ts");
      fs.writeFileSync(viteConfigPath, viteConfigContent);
      console.log("已生成 " + viteConfigPath);
      
      // 生成构建脚本
      const buildScriptContent = generatePageBuildScript(target, pageConfigs[target]);
      const buildScriptPath = path.join(__dirname, "../../scripts/build-" + target + ".sh");
      fs.writeFileSync(buildScriptPath, buildScriptContent);
      fs.chmodSync(buildScriptPath, '755'); // 添加执行权限
      console.log("已生成 " + buildScriptPath);
      
      console.log(target + ' 页面配置生成完成!');
    } else {
      console.error("未知的目标: " + target);
      console.log('可用目标:');
      console.log("  - shared-components");
      Object.keys(pageConfigs).forEach(key => console.log("  - " + key));
    }
  } else {
    // 生成所有配置
    console.log('生成所有配置文件...');
    
    // 生成基础组件配置
    console.log("生成基础组件配置文件...");
    const baseViteConfigContent = generateBaseComponentsViteConfig();
    const baseViteConfigPath = path.join(__dirname, "vite.shared-components.config.ts");
    fs.writeFileSync(baseViteConfigPath, baseViteConfigContent);
    console.log("已生成 " + baseViteConfigPath);
    
    const baseBuildScriptContent = generateBaseComponentsBuildScript();
    const baseBuildScriptPath = path.join(__dirname, "../../scripts/build-shared-components.sh");
    fs.writeFileSync(baseBuildScriptPath, baseBuildScriptContent);
    fs.chmodSync(baseBuildScriptPath, '755'); // 添加执行权限
    console.log("已生成 " + baseBuildScriptPath);
    
    // 生成所有页面配置
    for (const [pageKey, config] of Object.entries(pageConfigs)) {
      console.log("生成 " + pageKey + " 页面配置文件...");
      
      // 生成Vite配置文件
      const viteConfigContent = generatePageViteConfig(pageKey, config);
      const viteConfigPath = path.join(__dirname, "vite." + pageKey + ".config.ts");
      fs.writeFileSync(viteConfigPath, viteConfigContent);
      console.log("已生成 " + viteConfigPath);
      
      // 生成构建脚本
      const buildScriptContent = generatePageBuildScript(pageKey, config);
      const buildScriptPath = path.join(__dirname, "../../scripts/build-" + pageKey + ".sh");
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