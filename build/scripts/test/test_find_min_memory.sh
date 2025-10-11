#!/bin/bash

# 测试find_min_memory_limit函数的输出

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

# 等待指定秒数
wait_seconds() {
    local seconds=$1
    log_info "等待 ${seconds} 秒..."
    sleep $seconds
}

# 测试内存限制下组件是否能编译成功
test_memory_limit() {
    local name=$1
    local config_file=$2
    local memory_limit=$3
    
    log_info "测试 ${name} 组件在 ${memory_limit}MB 内存下是否能编译成功..."
    
    # 等待一会儿
    wait_seconds 2
    
    # 设置当前测试的内存限制
    local original_node_options=$NODE_OPTIONS
    export NODE_OPTIONS="--max-old-space-size=${memory_limit} --no-warnings --no-experimental-fetch"
    
    # 执行构建，不限制超时
    if node ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development --ssrManifest false; then
        log_success "${name} 组件在 ${memory_limit}MB 内存下编译成功"
        # 恢复原来的Node.js内存限制
        export NODE_OPTIONS=$original_node_options
        return 0
    else
        local exit_code=$?
        log_error "${name} 组件在 ${memory_limit}MB 内存下编译失败 (退出码: $exit_code)"
        # 恢复原来的Node.js内存限制
        export NODE_OPTIONS=$original_node_options
        return 1
    fi
}

# 使用二分法查找最小内存限制
find_min_memory_limit() {
    local name=$1
    local config_file=$2
    local min_limit=50
    local max_limit=1100
    local min_success_limit=0
    
    log_info "开始查找 ${name} 组件编译成功的最小内存限制..."
    
    # 先测试最大内存限制是否能成功
    if ! test_memory_limit "${name}" "${config_file}" ${max_limit}; then
        log_error "${name} 组件在最大内存限制下也无法编译成功"
        return 1
    fi
    
    # 使用二分法查找最小内存限制
    while [ $min_limit -le $max_limit ]; do
        local mid_limit=$(( (min_limit + max_limit) / 2 ))
        log_info "测试内存限制: ${mid_limit}MB (范围: ${min_limit}-${max_limit}MB)"
        
        if test_memory_limit "${name}" "${config_file}" ${mid_limit}; then
            min_success_limit=$mid_limit
            max_limit=$((mid_limit - 1))
            log_info "编译成功，尝试更小的内存限制"
        else
            min_limit=$((mid_limit + 1))
            log_info "编译失败，需要更大的内存限制"
        fi
        
        # 等待一会儿再进行下一次测试
        wait_seconds 3
    done
    
    if [ $min_success_limit -gt 0 ]; then
        log_success "${name} 组件编译成功的最小内存限制为: ${min_success_limit}MB"
        echo $min_success_limit
        return 0
    else
        log_error "无法找到 ${name} 组件编译成功的最小内存限制"
        return 1
    fi
}

# 测试find_min_memory_limit函数
echo "测试find_min_memory_limit函数:"
result=$(find_min_memory_limit "基础组件" "build/configs/vite/vite.shared-components.config.ts" 2>&1)
echo "结果: $result"
echo "只保留数字: $(echo "$result" | grep -E '^[0-9]+$' | tail -1)"