#!/usr/bin/env node
// 统一构建脚本 - 智能化构建入口
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 日志函数
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

// 获取系统可用内存 (MB)
function getAvailableMemory() {
  try {
    const freeOutput = execSync('free -m', { encoding: 'utf8' });
    const lines = freeOutput.split('\n');
    const memLine = lines.find(line => line.startsWith('Mem:'));
    if (memLine) {
      const parts = memLine.split(/\s+/);
      return parseInt(parts[6]); // 可用内存
    }
  } catch (error) {
    // 备用方法
    try {
      const memInfo = fs.readFileSync('/proc/meminfo', 'utf8');
      const match = memInfo.match(/MemAvailable:\s+(\d+)/);
      if (match) {
        return Math.floor(parseInt(match[1]) / 1024);
      }
    } catch (e) {
      // 默认返回500MB
      return 500;
    }
  }
  return 500;
}

// 动态计算内存限制
function calculateMemoryLimit() {
  const availableMemory = getAvailableMemory();
  
  // 给iflow分配300MB
  const iflowMemory = 300;
  
  // 计算剩余内存
  let remainingMemory = availableMemory - iflowMemory;
  
  // 如果剩余内存小于50M，则使用最小值
  if (remainingMemory < 50) {
    remainingMemory = 50;
  }
  
  // 新的node使用剩余内存的80%，但给系统留50M
  const reservedMemory = 50;
  let memoryLimit = Math.floor(remainingMemory * 0.8 - reservedMemory);
  
  // 设置上限为1000MB
  if (memoryLimit > 1000) {
    memoryLimit = 1000;
  }
  
  // 设置下限为50MB
  if (memoryLimit < 50) {
    memoryLimit = 50;
  }
  
  return memoryLimit;
}

// 检查推荐内存方案
function checkRecommendation(componentType) {
  const recommendationFile = path.join(process.cwd(), 'build', 'recommendations', `${componentType}_recommendation.txt`);
  
  if (fs.existsSync(recommendationFile)) {
    try {
      const content = fs.readFileSync(recommendationFile, 'utf8');
      const match = content.match(/推荐Node\.js内存限制:\s*(\d+)MB/);
      if (match) {
        const recommendedMemory = parseInt(match[1]);
        if (recommendedMemory >= 50 && recommendedMemory <= 1000) {
          log.info(`发现 ${componentType} 组件的推荐内存方案: ${recommendedMemory}MB`);
          return recommendedMemory;
        }
      }
    } catch (error) {
      log.warning(`读取推荐内存方案失败: ${error.message}`);
    }
  }
  
  return null;
}

// 生成推荐内存方案
function generateMemoryRecommendation(componentType, availableMemory, allocatedMemory, buildDuration) {
  const recommendationsDir = path.join(process.cwd(), 'build', 'recommendations');
  
  // 确保推荐目录存在
  if (!fs.existsSync(recommendationsDir)) {
    fs.mkdirSync(recommendationsDir, { recursive: true });
  }
  
  // 生成推荐方案文件
  const recommendationFile = path.join(recommendationsDir, `${componentType}_recommendation.txt`);
  
  // 计算推荐内存（可用内存的60%，但不低于100MB）
  let recommendedMemory = Math.floor(availableMemory * 0.6);
  if (recommendedMemory < 100) {
    recommendedMemory = 100;
  }
  
  // 计算推荐的Node.js内存限制（推荐内存的80%，但不低于50MB）
  let recommendedNodeMemory = Math.floor(recommendedMemory * 0.8);
  if (recommendedNodeMemory < 50) {
    recommendedNodeMemory = 50;
  }
  
  // 生成推荐方案内容
  const content = `# ${componentType} 组件构建推荐内存方案

## 构建环境信息
- 构建时间: ${new Date().toString()}
- 构建耗时: ${buildDuration}秒
- 构建时系统可用内存: ${availableMemory}MB
- 分配给node进程的内存: ${allocatedMemory}MB

## 推荐内存配置
- 推荐系统可用内存: ${recommendedMemory}MB
- 推荐Node.js内存限制: ${recommendedNodeMemory}MB

## 使用建议
在相似环境下构建时，可以使用以下命令来加快构建速度：
\`\`\`
export NODE_OPTIONS="--max-old-space-size=${recommendedNodeMemory}"
# 然后执行相应的构建命令
\`\`\`

## 注意事项
1. 如果系统可用内存低于${recommendedMemory}MB，建议增加系统内存或使用更小的组件进行构建
2. 如果构建过程中出现内存不足错误，可以适当降低Node.js内存限制
3. 推荐定期更新此推荐方案，以适应项目规模的变化
`;
  
  fs.writeFileSync(recommendationFile, content);
  log.info(`已生成 ${componentType} 组件构建推荐内存方案: ${recommendationFile}`);
}

// 执行构建命令
function executeBuildCommand(command, componentType) {
  log.info(`开始构建 ${componentType}...`);
  
  // 获取构建前的内存信息
  const availableMemory = getAvailableMemory();
  log.info(`系统可用内存: ${availableMemory}MB`);
  
  // 在构建前执行清理
  log.info("构建前执行内存清理...");
  try {
    execSync('./build/scripts/build-cleanup.sh', { stdio: 'inherit' });
  } catch (error) {
    log.warning("清理脚本执行失败，继续构建...");
  }
  
  // 记录构建开始时间
  const startTime = Date.now();
  
  try {
    // 执行构建命令
    execSync(command, { stdio: 'inherit' });
    
    // 记录构建结束时间
    const endTime = Date.now();
    const buildDuration = Math.floor((endTime - startTime) / 1000);
    
    log.success(`${componentType} 构建成功!`);
    log.info(`构建耗时: ${buildDuration}秒`);
    
    // 生成推荐内存方案
    // 注意：这里我们传入0作为内存限制，因为实际的内存限制由子脚本处理
    generateMemoryRecommendation(componentType, availableMemory, 0, buildDuration);
    
    // 构建完成后执行清理
    log.info("构建完成后执行内存清理...");
    try {
      execSync('./build/scripts/build-cleanup.sh', { stdio: 'inherit' });
    } catch (error) {
      log.warning("清理脚本执行失败...");
    }
    
    return true;
  } catch (error) {
    // 记录构建结束时间
    const endTime = Date.now();
    const buildDuration = Math.floor((endTime - startTime) / 1000);
    
    log.error(`错误: ${componentType} 构建失败!`);
    log.info(`构建耗时: ${buildDuration}秒`);
    
    // 构建失败后也执行清理
    log.info("构建失败后执行内存清理...");
    try {
      execSync('./build/scripts/build-cleanup.sh', { stdio: 'inherit' });
    } catch (error) {
      log.warning("清理脚本执行失败...");
    }
    
    return false;
  }
}

// 显示帮助信息
function showHelp() {
  console.log("用法: npm run build [选项]");
  console.log("选项:");
  console.log("  --use-recommended    使用推荐内存方案进行构建");
  console.log("  --help, -h           显示此帮助信息");
  console.log("");
  console.log("说明:");
  console.log("  统一构建入口，智能管理内存限制和推荐方案");
  console.log("  首次构建会生成推荐内存方案，后续构建可使用 --use-recommended 参数");
  console.log("");
  console.log("示例:");
  console.log("  npm run build              # 首次构建，生成推荐方案");
  console.log("  npm run build --use-recommended  # 使用推荐方案构建");
}

// 主函数
async function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  // 确保在项目根目录
  process.chdir(path.join(__dirname, '../..'));
  
  // 检查是否是首次构建（没有推荐方案）
  const recommendationsDir = path.join(process.cwd(), 'build', 'recommendations');
  const hasRecommendations = fs.existsSync(recommendationsDir) && 
    fs.readdirSync(recommendationsDir).some(file => file.endsWith('_recommendation.txt'));
  
  if (!hasRecommendations) {
    log.info("检测到首次构建，将生成推荐内存方案...");
  } else {
    log.info("检测到已有推荐内存方案，可使用 --use-recommended 参数加速构建");
  }
  
  // 按顺序执行分层构建
  const layers = [
    { name: '基础组件', script: './build/scripts/build-shared-components.sh' },
    { name: 'Film页面', script: './build/scripts/build-film.sh' },
    { name: 'IPTV页面', script: './build/scripts/build-iptv.sh' },
    { name: 'Drive页面', script: './build/scripts/build-drive.sh' },
    { name: 'Lab页面', script: './build/scripts/build-lab.sh' },
    { name: 'Chase页面', script: './build/scripts/build-chase.sh' },
    { name: 'Play页面', script: './build/scripts/build-play.sh' },
    { name: 'Setting页面', script: './build/scripts/build-setting.sh' },
    { name: 'Analyze页面', script: './build/scripts/build-analyze.sh' }
  ];
  
  log.info("开始分层构建...");
  
  // 记录总开始时间
  const totalStartTime = Date.now();
  
  // 按顺序构建各层
  for (const layer of layers) {
    const success = executeBuildCommand(`bash ${layer.script}`, layer.name);
    if (!success) {
      log.error(`构建失败: ${layer.name}`);
      process.exit(1);
    }
  }
  
  // 记录总结束时间
  const totalEndTime = Date.now();
  const totalDuration = Math.floor((totalEndTime - totalStartTime) / 1000);
  
  log.success(`所有组件层构建完成! 总耗时: ${totalDuration}秒`);
}

// 执行主函数
main().catch(error => {
  log.error(`构建过程中发生错误: ${error.message}`);
  process.exit(1);
});