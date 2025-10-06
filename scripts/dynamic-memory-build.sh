#!/bin/bash
# 动态内存限制构建脚本
# 根据实时内存使用情况动态调整Node.js内存限制

# 获取可用内存（MB）
get_available_memory() {
    local available_kb=$(free -k | awk 'NR==2 {print $7}')
    echo $((available_kb / 1024))
}

# 获取总内存（MB）
get_total_memory() {
    local total_kb=$(free -k | awk 'NR==2 {print $2}')
    echo $((total_kb / 1024))
}

# 计算动态内存限制（使用可用内存的80%）
calculate_memory_limit() {
    local component_name=$1
    local available_mb=$(get_available_memory)
    local total_mb=$(get_total_memory)
    
    # 使用可用内存的80%，但不超过总内存的80%
    local limit=$((available_mb * 80 / 100))
    local max_limit=$((total_mb * 80 / 100))
    
    # 特殊处理shortcut-input组件，需要更多内存
    if [ "$component_name" = "shortcut-input" ]; then
        # shortcut-input组件需要至少500MB内存
        if [ $limit -lt 500 ]; then
            limit=500
        fi
    else
        # 其他组件限制在合理范围内（至少30MB，最多200MB）
        if [ $limit -lt 30 ]; then
            limit=30
        elif [ $limit -gt 200 ]; then
            limit=200
        fi
    fi
    
    # 同时确保不超过最大限制
    if [ $limit -gt $max_limit ]; then
        limit=$max_limit
    fi
    
    echo $limit
}

# 显示内存使用情况
show_memory_info() {
    local component_name=$1
    local available_mb=$(get_available_memory)
    local total_mb=$(get_total_memory)
    local limit=$(calculate_memory_limit "$component_name")
    
    echo "内存使用情况:"
    echo "  总内存: ${total_mb}MB"
    echo "  可用内存: ${available_mb}MB"
    echo "  动态内存限制: ${limit}MB"
}

# 构建组件
build_component() {
    local config_file=$1
    local component_name=$2
    
    if [ -z "$config_file" ] || [ -z "$component_name" ]; then
        echo "错误: 缺少参数"
        echo "用法: build_component <配置文件> <组件名称>"
        return 1
    fi
    
    echo "开始构建 $component_name 组件..."
    show_memory_info "$component_name"
    
    local memory_limit=$(calculate_memory_limit "$component_name")
    echo "使用内存限制: ${memory_limit}MB"
    
    # 执行清理脚本
    /workspace/cleanup.sh
    
    # 使用动态内存限制执行构建
    timeout 120 node --max-old-space-size=$memory_limit --no-warnings ./node_modules/.bin/vite build --config $config_file
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "$component_name 组件构建成功!"
    elif [ $exit_code -eq 124 ]; then
        echo "错误: $component_name 组件构建超时"
    else
        echo "错误: $component_name 组件构建失败 (退出码: $exit_code)"
    fi
    
    return $exit_code
}

# 如果直接运行此脚本，则执行构建
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    if [ $# -eq 2 ]; then
        build_component "$1" "$2"
    else
        echo "用法: $0 <配置文件> <组件名称>"
        echo "示例: $0 vite-configs-fine/vite.code-editor.config.ts code-editor"
        exit 1
    fi
fi