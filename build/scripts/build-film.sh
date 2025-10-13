#!/bin/bash
# film页面构建脚本 (参照zyplayer风格优化)

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

# 设置Node.js内存限制（优化版）
set_node_memory_limit() {
    local component_name=$1
    
    # 获取系统可用内存
    local available_memory=$(get_available_memory)
    
    # 根据组件类型和可用内存动态调整Node.js内存限制
    local memory_limit_mb
    case $component_name in
        "film"|"iptv"|"drive")
            # 复杂组件需要更多内存
            memory_limit_mb=$((available_memory * 7 / 10))
            # 确保复杂组件至少有400MB内存
            if [ $memory_limit_mb -lt 400 ]; then
                memory_limit_mb=400
            fi
            ;;
        "main")
            # 主组件需要更多内存
            memory_limit_mb=$((available_memory * 8 / 10))
            # 确保主组件至少有500MB内存
            if [ $memory_limit_mb -lt 500 ]; then
                memory_limit_mb=500
            fi
            ;;
        *)
            # 简单组件
            memory_limit_mb=$((available_memory * 6 / 10))
            # 确保简单组件至少有300MB内存
            if [ $memory_limit_mb -lt 300 ]; then
                memory_limit_mb=300
            fi
            ;;
    esac
    
    # 设置上限为2000MB
    if [ $memory_limit_mb -gt 2000 ]; then
        memory_limit_mb=2000
    fi
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=${memory_limit_mb} --no-warnings"
    log_info "已为${component_name}组件设置Node.js内存限制: ${memory_limit_mb}MB"
}

# 构建组件
build_component() {
    local component_name=$1
    local config_file=$2
    
    log_info "开始构建 ${component_name} 组件..."
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 显示系统资源信息
    log_info "系统可用内存: $(get_available_memory)MB"
    
    # 设置Node.js内存限制
    set_node_memory_limit "${component_name}"
    
    # 在构建前执行内存清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 等待清理完成
    sleep 2
    
    # 执行构建
    log_info "执行 ${component_name} 构建..."
    if node --no-warnings ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development; then
        local end_time=$(date +%s)
        local build_duration=$((end_time - start_time))
        
        log_success "${component_name} 组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建完成时可用内存: $(get_available_memory)MB"
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        
        return 0
    else
        local exit_code=$?
        local end_time=$(date +%s)
        local build_duration=$((end_time - start_time))
        
        log_error "${component_name} 组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建失败时可用内存: $(get_available_memory)MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        
        return $exit_code
    fi
}

# 主函数
main() {
    log_info "film页面构建脚本启动"
    
    # 执行构建
    build_component "film" "build/configs/vite/vite.film.config.ts"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "film页面构建完成!"
    else
        log_error "film页面构建失败!"
    fi
    
    exit $exit_code
}

# 执行主函数
main
