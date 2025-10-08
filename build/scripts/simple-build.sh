#!/bin/bash

# 简化的构建脚本，避免容器环境终止问题

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

# 等待函数
wait_seconds() {
    local seconds=$1
    log_info "等待 ${seconds} 秒..."
    sleep $seconds
}

# 获取组件的推荐内存限制
get_recommended_memory_limit() {
    local name=$1
    local recommendation_file="./build/recommendations/${name}_recommendation.txt"
    
    # 检查是否存在推荐内存方案并应用
    if [ -f "$recommendation_file" ]; then
        # 读取推荐的Node.js内存限制
        local recommended_node_memory=$(grep "推荐Node.js内存限制" "$recommendation_file" | awk '{print $NF}' | sed 's/MB//')
        if [ -n "$recommended_node_memory" ] && [ "$recommended_node_memory" -ge 50 ] && [ "$recommended_node_memory" -le 2000 ]; then
            echo $recommended_node_memory
            return
        fi
    fi
    
    # 如果没有找到推荐方案，使用动态计算的内存限制
    # 动态计算内存限制（基于清理后的最大可用内存）
    local available_memory=$(get_available_memory)
    
    # 给系统留100MB，然后分配90%给Node.js进程（最大化利用可用内存）
    local reserved_memory=100
    local memory_limit=$((available_memory * 9 / 10 - reserved_memory))
    
    # 设置下限为200MB（确保有足够的内存进行构建）
    if [ $memory_limit -lt 200 ]; then
        memory_limit=200
    fi
    
    # 设置上限为1000MB（避免过度分配）
    if [ $memory_limit -gt 1000 ]; then
        memory_limit=1000
    fi
    
    echo $memory_limit
}

# 构建单个组件
build_component() {
    local name=$1
    local config_file=$2
    local timeout_duration=180  # 默认超时时间3分钟
    
    log_info "开始构建 ${name}..."
    
    # 在构建前先执行一次清理，确保获得最大的可用内存
    log_info "构建前执行内存清理..."
    "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/build-cleanup.sh
    
    # 等待清理完成（保持2秒）
    wait_seconds 2
    
    # 获取组件的推荐内存限制（基于清理后的最大可用内存）
    local memory_limit=$(get_recommended_memory_limit "$name")
    log_info "当前可用内存: $(get_available_memory)MB"
    log_info "计算得出的内存限制: ${memory_limit}MB"
    
    # 等待一会儿（保持2秒）
    wait_seconds 2
    
    # 执行构建（移除timeout命令以避免可能的内存问题）
    log_info "执行 ${name} 构建..."
    # 使用独立的命令设置Node.js内存限制，避免环境变量传递问题
    if node --max-old-space-size=${memory_limit} --no-warnings --no-experimental-fetch ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development --ssrManifest false; then
        log_success "${name} 构建完成!"
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/build-cleanup.sh
        
        return 0
    else
        local exit_code=$?
        log_error "构建 ${name} 失败 (退出码: $exit_code)"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/build-cleanup.sh
        
        return 1
    fi
}

# 主函数
main() {
    log_info "开始构建组件..."
    
    # 按顺序执行构建
    local components=(
        "基础组件:build/configs/vite/vite.shared-components.config.ts"
        "Film页面:build/configs/vite/vite.film.config.ts"
        "IPTV页面:build/configs/vite/vite.iptv.config.ts"
        "Drive页面:build/configs/vite/vite.drive.config.ts"
        "Lab页面:build/configs/vite/vite.lab.config.ts"
        "Chase页面:build/configs/vite/vite.chase.config.ts"
        "Play页面:build/configs/vite/vite.play.config.ts"
        "Setting页面:build/configs/vite/vite.setting.config.ts"
        "Analyze页面:build/configs/vite/vite.analyze.config.ts"
    )
    
    local total_components=${#components[@]}
    local current_index=0
    
    for component in "${components[@]}"; do
        current_index=$((current_index + 1))
        log_info "进度: ${current_index}/${total_components}"
        
        local name="${component%%:*}"
        local config_file="${component#*:}"
        
        if ! build_component "${name}" "${config_file}"; then
            log_error "构建失败: ${name}"
            exit 1
        fi
        
        # 在组件之间等待（根据用户反馈调整为2秒）
        if [ $current_index -lt $total_components ]; then
            log_info "组件间等待2秒..."
            wait_seconds 2
        fi
    done
    
    log_success "所有组件构建完成!"
}

# 执行主函数
main