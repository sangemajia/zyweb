#!/bin/bash
# 为Web环境优化的shared-components构建脚本

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

# 设置Node.js内存限制（为Web环境优化）
set_node_memory_limit() {
    # 获取系统可用内存
    local available_memory=$(get_available_memory)
    
    # 为Web环境分配更多内存（因为没有Electron开销）
    local memory_limit_mb=$((available_memory * 7 / 10))
    
    # 确保内存限制在合理范围内
    if [ $memory_limit_mb -lt 600 ]; then
        memory_limit_mb=600
    elif [ $memory_limit_mb -gt 2500 ]; then
        memory_limit_mb=2500
    fi
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=${memory_limit_mb} --no-warnings"
    log_info "已为Web环境设置Node.js内存限制: ${memory_limit_mb}MB"
}

# 构建共享组件库
build_shared_components() {
    log_info "开始构建共享组件库..."
    
    # 动态计算内存限制
    local memory_limit=1500
    log_info "系统可用内存: $(get_available_memory)MB"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 切换到shared-components目录进行构建
    log_info "切换到shared-components目录进行构建..."
    cd src/renderer/src/components/shared
    
    # 构建组件库
    log_info "执行共享组件库构建..."
    node --no-warnings ../../../../../node_modules/vite/bin/vite.js build --minify false --mode development
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "共享组件库构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        
        # 复制构建结果到正确位置
        log_info "复制构建结果到正确位置..."
        mkdir -p ../../../../../dist/zyweb/shared-components
        cp -r dist/* ../../../../../dist/zyweb/shared-components/
        
        # 返回项目根目录
        cd ../../../../../
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: 共享组件库构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        
        # 返回项目根目录
        cd ../../../../
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 执行构建
build_shared_components