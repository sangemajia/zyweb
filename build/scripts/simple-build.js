#!/usr/bin/env node

// 简化的构建脚本，避免容器环境终止问题
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

// 等待函数
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 执行单个构建脚本
async function runBuildScript(script, name) {
  log.info(`开始构建 ${name}...`);
  
  try {
    // 执行清理脚本
    log.info("执行清理...");
    await execAsync('./build/scripts/build-cleanup.sh');
    
    // 等待一会儿
    await wait(1000);
    
    // 执行构建脚本
    log.info(`执行 ${script}...`);
    const { stdout, stderr } = await execAsync(`bash ${script}`);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    log.success(`${name} 构建完成!`);
    
    // 执行清理脚本
    log.info("执行清理...");
    await execAsync('./build/scripts/build-cleanup.sh');
    
    return true;
  } catch (error) {
    log.error(`构建 ${name} 失败: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  // 确保在项目根目录
  process.chdir(path.join(path.dirname(new URL(import.meta.url).pathname), '../..'));
  
  log.info("开始分步构建...");
  
  // 按顺序执行构建
  const components = [
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
  
  for (const component of components) {
    const success = await runBuildScript(component.script, component.name);
    if (!success) {
      log.error(`构建失败: ${component.name}`);
      process.exit(1);
    }
    
    log.info("等待5秒...");
    await wait(5000); // 等待5秒再继续
  }
  
  log.success("所有组件构建完成!");
}

// 执行主函数
main().catch(error => {
  log.error(`构建过程中发生错误: ${error.message}`);
  process.exit(1);
});