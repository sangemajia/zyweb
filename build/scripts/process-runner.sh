#!/bin/bash
# 进程启动器脚本，在启动新进程前执行内存清理和分配

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

# 获取可用内存（MB）
get_available_memory() {
    free -m | awk '/^Mem:/{print $7}'
}

# 设置Node.js内存限制
set_node_memory_limit() {
    # 获取系统可用内存
    local available_memory=$(get_available_memory)
    
    # 计算内存限制（使用可用内存的70%）
    local memory_limit_mb=$((available_memory * 7 / 10))
    
    # 确保内存限制在合理范围内
    if [ $memory_limit_mb -lt 512 ]; then
        memory_limit_mb=512
    elif [ $memory_limit_mb -gt 4096 ]; then
        memory_limit_mb=4096
    fi
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=${memory_limit_mb} --no-warnings"
    log_info "已设置Node.js内存限制: ${memory_limit_mb}MB"
}

# 执行内存清理
perform_memory_cleanup() {
    log_info "执行内存清理..."
    
    # 执行现有的清理脚本
    if [ -f "./build/scripts/build-cleanup.sh" ]; then
        ./build/scripts/build-cleanup.sh
    else
        log_warning "未找到清理脚本: ./build/scripts/build-cleanup.sh"
    fi
}

# 启动进程
start_process() {
    local command_to_run="$1"
    
    if [ -z "$command_to_run" ]; then
        log_error "错误: 未提供要执行的命令"
        return 1
    fi
    
    log_info "启动进程: $command_to_run"
    
    # 执行命令
    eval "$command_to_run"
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "进程执行成功"
    else
        log_error "进程执行失败 (退出码: $exit_code)"
    fi
    
    return $exit_code
}

# 主函数
main() {
    # 确保在项目根目录
    cd "$(dirname "$0")/../.."
    
    log_info "进程启动器开始执行..."
    
    # 显示当前内存使用情况
    log_info "当前内存使用情况:"
    free -h
    
    # 执行内存清理
    perform_memory_cleanup
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 获取要执行的命令（所有参数）
    local command_to_run="$*"
    
    # 启动进程
    start_process "$command_to_run"
    
    # 进程结束后再次执行清理
    log_info "进程结束后执行清理..."
    perform_memory_cleanup
    
    log_success "进程启动器执行完成"
}

# 执行主函数
main "$@"