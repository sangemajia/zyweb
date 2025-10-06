#!/bin/bash
# 统一的组件构建脚本，使用yarn替代npm并优化内存管理

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

# 清理不必要的进程以释放内存
cleanup_memory() {
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
}

echo "开始构建所有组件..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 确保在项目根目录
cd "$PROJECT_DIR"

# 检查yarn是否可用
if ! command -v yarn &> /dev/null; then
    echo "错误: 未找到yarn命令，请先安装yarn"
    exit 1
fi

# 初始化组件缓存
if [ -f "$SCRIPT_DIR/scripts/component-cache.sh" ]; then
    "$SCRIPT_DIR/scripts/component-cache.sh" init
fi

# 构建组件列表
components=(
    "vite-configs-fine/vite.code-editor.config.ts:code-editor"
    "vite-configs-fine/vite.markdown-render.config.ts:markdown-render"
    "vite-configs-fine/vite.share-popup.config.ts:share-popup"
    "vite-configs-fine/vite.shortcut-input.config.ts:shortcut-input"
    "vite-configs-fine/vite.split.config.ts:split"
    "vite-configs-fine/vite.tag-nav.config.ts:tag-nav"
    "vite-configs-fine/vite.terminal.config.ts:terminal"
    "vite-configs-fine/vite.SharedButton.config.ts:SharedButton"
    "vite-configs-fine/vite.SharedCard.config.ts:SharedCard"
    "vite-configs-fine/vite.ai-brain.config.ts:ai-brain"
    "vite-configs-fine/vite.binge.config.ts:binge"
    "vite-configs-fine/vite.common-nav.config.ts:common-nav"
    "vite-configs-fine/vite.detail.config.ts:detail"
    "vite-configs-fine/vite.dialog-data.config.ts:dialog-data"
    "vite-configs-fine/vite.history.config.ts:history"
    "vite-configs-fine/vite.plugin-center.config.ts:plugin-center"
)

success_count=0
total_count=${#components[@]}

# 逐个构建组件（单进程流水式）
for component_info in "${components[@]}"; do
    config_file=$(echo "$component_info" | cut -d':' -f1)
    component_name=$(echo "$component_info" | cut -d':' -f2)
    
    echo "=================================================="
    
    # 检查配置文件是否存在
    if [ ! -f "$config_file" ]; then
        echo "警告: 配置文件 $config_file 不存在，跳过 $component_name 组件"
        continue
    fi
    
    # 检查组件是否已缓存且有效
    if [ -f "$SCRIPT_DIR/scripts/component-cache.sh" ] && "$SCRIPT_DIR/scripts/component-cache.sh" check "$component_name"; then
        echo "从缓存恢复 $component_name 组件..."
        "$SCRIPT_DIR/scripts/component-cache.sh" restore "$component_name"
        if [ $? -eq 0 ]; then
            echo "$component_name 组件从缓存恢复成功!"
            ((success_count++))
            continue
        else
            echo "从缓存恢复 $component_name 组件失败，重新构建..."
        fi
    else
        echo "$component_name 组件未缓存或已过期，需要重新构建..."
    fi
    
    # 在每个组件构建前执行清理以释放内存
    cleanup_memory
    
    # 显示内存信息
    show_memory_info "$component_name"
    
    # 计算内存限制
    local memory_limit=$(calculate_memory_limit "$component_name")
    echo "使用内存限制: ${memory_limit}MB"
    
    # 使用yarn构建组件，降低进程优先级
    nice -n 19 yarn vite build --config "$config_file" --mode production --max-old-space-size=$memory_limit
    
    if [ $? -eq 0 ]; then
        # 缓存构建成功的组件
        if [ -f "$SCRIPT_DIR/scripts/component-cache.sh" ]; then
            "$SCRIPT_DIR/scripts/component-cache.sh" cache "$component_name"
        fi
        ((success_count++))
        echo "$component_name 组件构建成功!"
    else
        echo "错误: $component_name 组件构建失败"
    fi
    
    echo ""
done

echo "=================================================="
echo "构建完成摘要:"
echo "  总组件数: $total_count"
echo "  成功构建: $success_count"
echo "  失败构建: $((total_count - success_count))"

if [ $success_count -eq $total_count ]; then
    echo "所有组件构建成功!"
    exit 0
else
    echo "部分组件构建失败。"
    exit 1
fi