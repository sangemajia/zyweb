#!/bin/bash
# 动态内存限制构建脚本
# 根据系统可用内存动态调整Node.js内存限制，避免内存溢出

# 获取总内存（MB）
get_total_memory() {
    local total_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    echo $((total_kb / 1024))
}

# 获取可用内存（MB）
get_available_memory() {
    local available_kb=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    echo $((available_kb / 1024))
}

# 计算动态内存限制
calculate_memory_limit() {
    local component_name=$1
    local available_mb=$(get_available_memory)
    local total_mb=$(get_total_memory)
    
    # 使用可用内存的30%，为系统保留更多资源
    local limit=$((available_mb * 30 / 100))
    local max_limit=$((total_mb * 30 / 100))
    
    # 特殊处理需要更多内存的组件
    if [ "$component_name" = "shortcut-input" ]; then
        # shortcut-input组件需要至少100MB内存
        if [ $limit -lt 100 ]; then
            limit=100
        fi
    elif [ "$component_name" = "plugin-center" ]; then
        # plugin-center组件需要至少150MB内存
        if [ $limit -lt 150 ]; then
            limit=150
        elif [ $limit -gt 200 ]; then
            limit=200
        fi
    else
        # 其他组件限制在合理范围内（至少30MB，最多80MB）
        if [ $limit -lt 30 ]; then
            limit=30
        elif [ $limit -gt 80 ]; then
            limit=80
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
    
    # 显示内存信息
    show_memory_info "$component_name"
    
    # 计算内存限制
    local memory_limit=$(calculate_memory_limit "$component_name")
    echo "使用内存限制: ${memory_limit}MB"
    
    # 清理不必要的进程以释放内存
    echo "清理不必要的进程以释放内存..."
    # 终止占用内存过多的进程（除了关键进程）
    ps aux --sort=-%mem | awk 'NR>1 && $11 !~ /(iflow|node|npm|yarn)/ {print $2}' | head -3 | xargs -r kill -9 2>/dev/null || echo "没有找到需要终止的进程"
    
    # 清理系统缓存
    echo "清理系统缓存..."
    if command -v sudo &> /dev/null; then
        sudo sync
        sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'
    else
        echo "sudo命令不可用，跳过系统缓存清理"
    fi
    
    # 显示当前内存使用情况
    echo "当前内存使用情况:"
    free -h
    echo "前3个占用内存最多的进程:"
    ps aux --sort=-%mem | head -3
    
    echo "清理完成，可以开始编译工作。"
    
    # 使用动态内存限制构建组件
    # 为iflow等关键进程保留资源，降低构建进程优先级
    nice -n 19 node --max-old-space-size=$memory_limit --no-warnings ./node_modules/.bin/vite build --config "$config_file"
    
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "$component_name 组件构建成功!"
        return 0
    else
        echo "错误: $component_name 组件构建失败 (退出码: $exit_code)"
        return $exit_code
    fi
}

# 主函数
main() {
    if [ $# -ne 2 ]; then
        echo "错误: 参数数量不正确"
        echo "用法: $0 <配置文件> <组件名称>"
        echo "示例: $0 vite-configs-fine/vite.plugin-center.config.ts plugin-center"
        exit 1
    fi
    
    local config_file=$1
    local component_name=$2
    
    # 检查配置文件是否存在
    if [ ! -f "$config_file" ]; then
        echo "错误: 配置文件 $config_file 不存在"
        exit 1
    fi
    
    # 构建组件
    build_component "$config_file" "$component_name"
}

# 执行主函数
main "$@"