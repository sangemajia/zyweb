#!/bin/bash

# ZyWeb 构建脚本
# 负责清理资源、分配内存、执行构建

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

# 动态设置Node.js内存限制
set_node_memory_limit() {
    local available_memory=$(get_available_memory)
    local memory_limit
    
    log_info "系统可用内存: ${available_memory}MB"
    
    # 根据可用内存设置合适的内存限制
    if [ $available_memory -gt 8000 ]; then
        # 8GB以上内存，使用6GB限制
        memory_limit=6144
        log_info "检测到充足内存，设置Node.js内存限制为6GB"
    elif [ $available_memory -gt 6000 ]; then
        # 6-8GB内存，使用4GB限制
        memory_limit=4096
        log_info "检测到中等内存，设置Node.js内存限制为4GB"
    elif [ $available_memory -gt 4000 ]; then
        # 4-6GB内存，使用3GB限制
        memory_limit=3072
        log_info "检测到较低内存，设置Node.js内存限制为3GB"
    else
        # 4GB以下内存，使用2GB限制
        memory_limit=2048
        log_info "检测到低内存，设置Node.js内存限制为2GB"
    fi
    
    # 导出内存限制环境变量
    export NODE_OPTIONS="--max-old-space-size=$memory_limit"
    log_info "已设置NODE_OPTIONS: $NODE_OPTIONS"
}

# 执行构建前清理（已移至package.json中执行）
cleanup_before_build() {
    log_info "构建前清理已在package.json中执行"
}

# 构建Web应用
build_web_app() {
    log_info "开始构建Web应用..."
    
    # 使用Vite构建Web版本
    if command -v yarn >/dev/null 2>&1; then
        yarn build:web
    elif command -v npm >/dev/null 2>&1; then
        npm run build:web
    else
        log_error "未找到包管理器 (yarn或npm)"
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Web应用构建完成"
    else
        log_error "Web应用构建失败"
        exit 1
    fi
}

# 主构建函数
main_build() {
    log_info "开始ZyWeb构建流程..."
    
    # 显示开始时间
    log_info "构建开始时间: $(date)"
    
    # 显示系统信息
    log_info "系统信息:"
    log_info "  CPU核心数: $(nproc)"
    log_info "  总内存: $(free -h | awk '/^Mem:/{print $2}')"
    log_info "  可用内存: $(free -h | awk '/^Mem:/{print $7}')"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 构建Web应用
    build_web_app
    
    # 显示结束时间
    log_info "构建结束时间: $(date)"
    
    log_success "ZyWeb构建流程完成!"
}

# 执行主构建函数
main_build