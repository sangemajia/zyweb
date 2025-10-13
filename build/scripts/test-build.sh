#!/bin/bash

# 简单构建脚本，用于测试源码修复

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 主函数
main() {
    log_info "开始测试构建..."
    
    # 进入项目根目录
    cd /workspace/zyweb
    
    # 安装依赖（如果尚未安装）
    if [ ! -d "node_modules" ]; then
        log_info "安装依赖..."
        yarn install
    else
        log_info "依赖已安装，跳过安装步骤"
    fi
    
    # 清理之前的构建产物
    log_info "清理之前的构建产物..."
    rm -rf dist/zyweb
    
    # 构建主页组件
    log_info "构建主页组件..."
    if node --max-old-space-size=512 ./node_modules/vite/bin/vite.js build --config "build/configs/vite/vite.home.config.ts" --minify false --mode development; then
        log_success "主页组件构建完成!"
    else
        log_error "主页组件构建失败"
        exit 1
    fi
    
    # 构建主组件
    log_info "构建主组件..."
    if node --max-old-space-size=512 ./node_modules/vite/bin/vite.js build --config "build/configs/vite/vite.main.config.ts" --minify false --mode development; then
        log_success "主组件构建完成!"
    else
        log_error "主组件构建失败"
        exit 1
    fi
    
    # 构建共享组件
    log_info "构建共享组件..."
    if node --max-old-space-size=512 ./node_modules/vite/bin/vite.js build --config "build/configs/vite/vite.shared-components.config.ts" --minify false --mode development; then
        log_success "共享组件构建完成!"
    else
        log_error "共享组件构建失败"
        exit 1
    fi
    
    log_success "所有组件构建完成!"
    
    # 组装UI
    log_info "组装UI..."
    if ./build/scripts/assemble-ui.sh; then
        log_success "UI组装完成!"
    else
        log_error "UI组装失败"
        exit 1
    fi
    
    log_success "测试构建完成!"
    log_info "构建产物位于: /workspace/zyweb/dist/zyweb"
}

# 执行主函数
main