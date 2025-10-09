#!/bin/bash

# 测试修复后的test_component函数

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# 测试内存限制下组件是否能编译成功
test_memory_limit() {
    local name=$1
    local config_file=$2
    local memory_limit=$3
    
    log_info "测试 ${name} 组件在 ${memory_limit}MB 内存下是否能编译成功..." >&2
    
    # 等待一会儿
    sleep 1
    
    # 设置当前测试的内存限制
    local original_node_options=$NODE_OPTIONS
    export NODE_OPTIONS="--max-old-space-size=${memory_limit}"
    
    # 执行构建，不限制超时
    if node ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development --ssrManifest false; then
        log_success "${name} 组件在 ${memory_limit}MB 内存下编译成功" >&2
        # 恢复原来的Node.js内存限制
        export NODE_OPTIONS=$original_node_options
        return 0
    else
        local exit_code=$?
        log_error "${name} 组件在 ${memory_limit}MB 内存下编译失败 (退出码: $exit_code)" >&2
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
    
    log_info "开始查找 ${name} 组件编译成功的最小内存限制..." >&2
    
    # 先测试最大内存限制是否能成功
    if ! test_memory_limit "${name}" "${config_file}" ${max_limit}; then
        log_error "${name} 组件在最大内存限制下也无法编译成功" >&2
        return 1
    fi
    
    # 使用二分法查找最小内存限制
    while [ $min_limit -le $max_limit ]; do
        local mid_limit=$(( (min_limit + max_limit) / 2 ))
        log_info "测试内存限制: ${mid_limit}MB (范围: ${min_limit}-${max_limit}MB)" >&2
        
        if test_memory_limit "${name}" "${config_file}" ${mid_limit}; then
            min_success_limit=$mid_limit
            max_limit=$((mid_limit - 1))
            log_info "编译成功，尝试更小的内存限制" >&2
        else
            min_limit=$((mid_limit + 1))
            log_info "编译失败，需要更大的内存限制" >&2
        fi
        
        # 等待一会儿再进行下一次测试
        sleep 1
    done
    
    if [ $min_success_limit -gt 0 ]; then
        log_success "${name} 组件编译成功的最小内存限制为: ${min_success_limit}MB" >&2
        echo $min_success_limit
        return 0
    else
        log_error "无法找到 ${name} 组件编译成功的最小内存限制" >&2
        return 1
    fi
}

# 测试单个组件
test_component() {
    local name=$1
    local config_file=$2
    
    log_info "开始测试 ${name} 组件..." >&2
    
    # 获取最小内存限制
    local min_memory_limit
    min_memory_limit=$(find_min_memory_limit "${name}" "${config_file}" 2>/dev/null | tail -1)
    
    # 验证返回值是否为有效数字
    if ! [[ "$min_memory_limit" =~ ^[0-9]+$ ]] || [ "$min_memory_limit" -lt 50 ] || [ "$min_memory_limit" -gt 1100 ]; then
        log_error "无法确定 ${name} 组件的最小内存限制: $min_memory_limit" >&2
        return 1
    fi
    
    # 计算推荐内存（最小内存加上10%）
    local recommended_memory=$((min_memory_limit * 11 / 10))
    
    # 确保推荐值不低于最小值
    if [ $recommended_memory -lt 250 ]; then
        recommended_memory=250
    fi
    
    # 确保推荐值不高于最大值
    if [ $recommended_memory -gt 1100 ]; then
        recommended_memory=1100
    fi
    
    log_success "${name} 组件的推荐内存为: ${recommended_memory}MB" >&2
    # 返回推荐内存和最小内存限制，用逗号分隔
    echo "${recommended_memory},${min_memory_limit}"
    return 0
}

# 测试test_component函数
echo "测试test_component函数:"
result=$(test_component "基础组件" "build/configs/vite/vite.shared-components.config.ts" 2>/dev/null)
echo "结果: $result"