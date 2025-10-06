#!/bin/bash
# 组件缓存管理脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CACHE_DIR="$PROJECT_DIR/dist/client/fine-components-cache"

# 创建缓存目录
create_cache_dir() {
    mkdir -p "$CACHE_DIR"
}

# 计算文件哈希值
calculate_hash() {
    local file_path=$1
    if [ -f "$file_path" ]; then
        md5sum "$file_path" | awk '{print $1}'
    else
        echo "0"
    fi
}

# 获取组件源码哈希值
get_component_hash() {
    local component_name=$1
    local component_dir="$PROJECT_DIR/src/renderer/src/components/$component_name"
    
    if [ -d "$component_dir" ]; then
        find "$component_dir" -type f -name "*.vue" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | sort | xargs md5sum | md5sum | awk '{print $1}'
    else
        echo "0"
    fi
}

# 检查组件是否已缓存且有效
is_component_cached() {
    local component_name=$1
    local cache_info_file="$CACHE_DIR/$component_name.info"
    
    # 检查缓存信息文件是否存在
    if [ ! -f "$cache_info_file" ]; then
        return 1
    fi
    
    # 读取缓存的哈希值
    local cached_hash=$(grep "component_hash=" "$cache_info_file" | cut -d'=' -f2)
    
    # 计算当前组件哈希值
    local current_hash=$(get_component_hash "$component_name")
    
    # 比较哈希值
    if [ "$cached_hash" = "$current_hash" ]; then
        return 0
    else
        return 1
    fi
}

# 缓存组件构建结果
cache_component() {
    local component_name=$1
    local component_dist_dir="$PROJECT_DIR/dist/client/fine-components/$component_name"
    local cache_component_dir="$CACHE_DIR/$component_name"
    local cache_info_file="$CACHE_DIR/$component_name.info"
    
    # 创建缓存目录
    mkdir -p "$cache_component_dir"
    
    # 复制构建结果到缓存目录
    if [ -d "$component_dist_dir" ]; then
        cp -r "$component_dist_dir"/* "$cache_component_dir"/
    fi
    
    # 保存缓存信息
    local component_hash=$(get_component_hash "$component_name")
    echo "component_hash=$component_hash" > "$cache_info_file"
    echo "cache_time=$(date)" >> "$cache_info_file"
}

# 从缓存恢复组件
restore_component_from_cache() {
    local component_name=$1
    local cache_component_dir="$CACHE_DIR/$component_name"
    local component_dist_dir="$PROJECT_DIR/dist/client/fine-components/$component_name"
    
    # 检查缓存是否存在
    if [ ! -d "$cache_component_dir" ]; then
        return 1
    fi
    
    # 创建目标目录
    mkdir -p "$component_dist_dir"
    
    # 从缓存复制到目标目录
    cp -r "$cache_component_dir"/* "$component_dist_dir"/
    
    echo "从缓存恢复 $component_name 组件成功"
    return 0
}

# 清理缓存
clean_cache() {
    if [ -d "$CACHE_DIR" ]; then
        rm -rf "$CACHE_DIR"
        echo "组件缓存已清理"
    else
        echo "缓存目录不存在"
    fi
}

# 显示缓存状态
show_cache_status() {
    if [ ! -d "$CACHE_DIR" ]; then
        echo "缓存目录不存在"
        return
    fi
    
    echo "组件缓存状态:"
    for dir in "$CACHE_DIR"/*/; do
        if [ -d "$dir" ]; then
            component_name=$(basename "$dir")
            cache_info_file="$dir/../$component_name.info"
            if [ -f "$cache_info_file" ]; then
                cache_time=$(grep "cache_time=" "$cache_info_file" | cut -d'=' -f2)
                echo "  $component_name: 已缓存 ($cache_time)"
            else
                echo "  $component_name: 已缓存 (无时间信息)"
            fi
        fi
    done
}

# 主函数
main() {
    case "$1" in
        "init")
            create_cache_dir
            ;;
        "check")
            if is_component_cached "$2"; then
                echo "组件 $2 已缓存且有效"
                exit 0
            else
                echo "组件 $2 未缓存或已过期"
                exit 1
            fi
            ;;
        "cache")
            cache_component "$2"
            ;;
        "restore")
            restore_component_from_cache "$2"
            ;;
        "clean")
            clean_cache
            ;;
        "status")
            show_cache_status
            ;;
        *)
            echo "用法: $0 {init|check|cache|restore|clean|status} [component_name]"
            exit 1
            ;;
    esac
}

# 如果直接运行此脚本，则执行主函数
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi