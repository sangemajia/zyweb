#!/bin/bash

# 构建主入口文件脚本

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

# 获取可用内存（MB）
get_available_memory() {
    free -m | awk '/^Mem:/{print $7}'
}

# 设置Node.js内存限制（纯动态方案）
set_node_memory_limit() {
    # 基础内存限制
    local memory_limit_mb=1200
    
    # 获取系统可用内存
    local available_memory=$(get_available_memory)
    
    # 根据可用内存动态调整Node.js内存限制
    # 分配可用内存的60%给Node.js进程
    memory_limit_mb=$((available_memory * 6 / 10))
    
    # 确保内存限制在合理范围内
    if [ $memory_limit_mb -lt 500 ]; then
        memory_limit_mb=500
    elif [ $memory_limit_mb -gt 2000 ]; then
        memory_limit_mb=2000
    fi
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=${memory_limit_mb} --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: ${memory_limit_mb}MB (基于系统可用内存动态计算)"
}

# 构建函数
build_main() {
    log_info "开始构建主入口文件..."
    
    # 动态计算内存限制
    local memory_limit=1200
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (默认值)"
    
    # 设置Node.js内存限制（纯动态方案）
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建主入口文件
    log_info "执行主入口文件构建..."
    if node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config "build/configs/vite/vite.main.config.ts" --minify false --mode development; then
        local exit_code=0
    else
        local exit_code=$?
    fi
    
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "主入口文件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: 主入口文件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 执行构建
build_main