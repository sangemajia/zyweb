#!/bin/bash
# 优化的构建启动脚本，整合所有构建步骤并优化资源管理

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

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo "选项:"
    echo "  -t, --type <type>      设置构建类型: all, shared, large, feature, film, film-medium, film-small, iptv, iptv-medium, iptv-small, drive, drive-medium, drive-small, lab, chase, play, setting, analyze"
    echo "                         all:        构建所有组件（默认）"
    echo "                         shared:     构建基础组件"
    echo "                         large:      构建大组件"
    echo "                         feature:    构建功能页面"
    echo "                         film:       构建Film页面"
    echo "                         film-medium:构建Film页面中组件"
    echo "                         film-small: 构建Film页面小组件"
    echo "                         iptv:       构建IPTV页面"
    echo "                         iptv-medium:构建IPTV页面中组件"
    echo "                         iptv-small: 构建IPTV页面小组件"
    echo "                         drive:      构建Drive页面"
    echo "                         drive-medium:构建Drive页面中组件"
    echo "                         drive-small:构建Drive页面小组件"
    echo "                         lab:        构建Lab页面"
    echo "                         chase:      构建Chase页面"
    echo "                         play:       构建Play页面"
    echo "                         setting:    构建Setting页面"
    echo "                         analyze:    构建Analyze页面"
    echo "  -m, --memory           应用推荐内存方案（如果存在）"
    echo "  -c, --clean            构建前执行资源清理"
    echo "  -h, --help             显示此帮助信息"
    echo ""
    echo "说明:"
    echo "  此脚本用于优化Web版本的构建过程，通过分步构建和资源管理来减少内存使用"
    echo "  脚本会根据系统可用内存动态调整Node.js内存限制"
    echo ""
}

# 解析命令行参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                BUILD_TYPE="$2"
                shift 2
                ;;
            -m|--memory)
                USE_RECOMMENDED_MEMORY=true
                shift
                ;;
            -c|--clean)
                CLEAN_BEFORE_BUILD=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 默认参数
BUILD_TYPE="all"  # all, shared, large, feature, film, film-medium, film-small, iptv, iptv-medium, iptv-small, drive, drive-medium, drive-small
USE_RECOMMENDED_MEMORY=false
CLEAN_BEFORE_BUILD=false

# 获取可用内存（MB）
get_available_memory() {
    if command -v free >/dev/null 2>&1; then
        free -m | awk '/^Mem:/{print $7}'
    else
        # 备用方法：从/proc/meminfo获取
        awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo "500"
    fi
}

# 应用推荐内存方案
apply_recommendation() {
    local component_type=$1
    local recommendation_file="./build/recommendations/${component_type}_recommendation.txt"
    
    # 检查推荐方案文件是否存在
    if [ ! -f "$recommendation_file" ]; then
        log_warning "推荐方案文件不存在: $recommendation_file"
        log_info "将使用默认内存设置"
        return 1
    fi
    
    # 读取推荐的Node.js内存限制
    local recommended_node_memory=$(grep "推荐Node.js内存限制" "$recommendation_file" | awk '{print $NF}' | sed 's/MB//')
    if [ -n "$recommended_node_memory" ] && [ "$recommended_node_memory" -ge 50 ] && [ "$recommended_node_memory" -le 1000 ]; then
        # 应用推荐的Node.js内存限制
        export NODE_OPTIONS="--max-old-space-size=${recommended_node_memory} --no-warnings --no-experimental-fetch"
        log_success "已应用推荐的Node.js内存限制: ${recommended_node_memory}MB"
        return 0
    else
        log_warning "无法从推荐方案中读取有效的Node.js内存限制"
        return 1
    fi
}

# 执行资源清理
cleanup_resources() {
    log_info "执行资源清理..."
    
    # 检查清理脚本是否存在
    if [ -f "./build/scripts/build-cleanup.sh" ]; then
        ./build/scripts/build-cleanup.sh
        return $?
    else
        log_warning "清理脚本不存在，跳过资源清理"
        return 0
    fi
}

# 构建基础组件
build_shared_components() {
    log_info "构建基础组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "shared"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s shared
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建大组件
build_large_components() {
    log_info "构建大组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "large"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s large
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Film页面小组件
build_film_small_components() {
    log_info "构建Film页面小组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "film-small"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s film-small
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Film页面中组件
build_film_medium_components() {
    log_info "构建Film页面中组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "film-medium"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s film-medium
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Film页面
build_film_page() {
    log_info "构建Film页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "film"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s film
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建IPTV页面小组件
build_iptv_small_components() {
    log_info "构建IPTV页面小组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "iptv-small"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s iptv-small
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建IPTV页面中组件
build_iptv_medium_components() {
    log_info "构建IPTV页面中组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "iptv-medium"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s iptv-medium
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建IPTV页面
build_iptv_page() {
    log_info "构建IPTV页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "iptv"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s iptv
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Drive页面小组件
build_drive_small_components() {
    log_info "构建Drive页面小组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "drive-small"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s drive-small
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Drive页面中组件
build_drive_medium_components() {
    log_info "构建Drive页面中组件..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "drive-medium"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s drive-medium
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Drive页面
build_drive_page() {
    log_info "构建Drive页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "drive"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s drive
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Lab页面
build_lab_page() {
    log_info "构建Lab页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "lab"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s lab
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Chase页面
build_chase_page() {
    log_info "构建Chase页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "chase"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s chase
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Play页面
build_play_page() {
    log_info "构建Play页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "play"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s play
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Setting页面
build_setting_page() {
    log_info "构建Setting页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "setting"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s setting
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建Analyze页面
build_analyze_page() {
    log_info "构建Analyze页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "analyze"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s analyze
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建功能页面
build_feature_pages() {
    log_info "构建功能页面..."
    
    # 应用推荐内存方案（如果需要）
    if [ "$USE_RECOMMENDED_MEMORY" = true ]; then
        apply_recommendation "feature"
    fi
    
    # 执行构建
    if [ -f "./build/scripts/build.sh" ]; then
        ./build/scripts/build.sh -s feature
        return $?
    else
        log_error "构建脚本不存在"
        return 1
    fi
}

# 构建所有组件
build_all_components() {
    log_info "开始构建所有组件..."
    
    log_info "1/16: 构建基础组件..."
    build_shared_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "2/16: 构建Film页面小组件..."
    build_film_small_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "3/16: 构建IPTV页面小组件..."
    build_iptv_small_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "4/16: 构建Drive页面小组件..."
    build_drive_small_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "5/16: 构建Film页面中组件..."
    build_film_medium_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "6/16: 构建IPTV页面中组件..."
    build_iptv_medium_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "7/16: 构建Drive页面中组件..."
    build_drive_medium_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "8/16: 构建大组件..."
    build_large_components || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "9/16: 构建Film页面..."
    build_film_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "10/16: 构建IPTV页面..."
    build_iptv_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "11/16: 构建Drive页面..."
    build_drive_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "12/16: 构建Lab页面..."
    build_lab_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "13/16: 构建Chase页面..."
    build_chase_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "14/16: 构建Play页面..."
    build_play_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "15/16: 构建Setting页面..."
    build_setting_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_info "16/16: 构建Analyze页面..."
    build_analyze_page || return $?
    
    # 每次构建后执行清理
    cleanup_resources
    
    log_success "所有组件构建完成!"
    return 0
}

# 主函数
main() {
    # 解析命令行参数
    parse_arguments "$@"
    
    # 确保在项目根目录
    cd "$(dirname "$0")/../.."
    
    # 构建前资源清理（如果需要）
    if [ "$CLEAN_BEFORE_BUILD" = true ]; then
        cleanup_resources
    fi
    
    # 根据构建类型执行相应的构建
    case $BUILD_TYPE in
        all)
            build_all_components
            ;;
        shared)
            build_shared_components
            ;;
        large)
            build_large_components
            ;;
        feature)
            build_feature_pages
            ;;
        film)
            build_film_page
            ;;
        film-medium)
            build_film_medium_components
            ;;
        film-small)
            build_film_small_components
            ;;
        iptv)
            build_iptv_page
            ;;
        iptv-medium)
            build_iptv_medium_components
            ;;
        iptv-small)
            build_iptv_small_components
            ;;
        drive)
            build_drive_page
            ;;
        drive-medium)
            build_drive_medium_components
            ;;
        drive-small)
            build_drive_small_components
            ;;
        lab)
            build_lab_page
            ;;
        chase)
            build_chase_page
            ;;
        play)
            build_play_page
            ;;
        setting)
            build_setting_page
            ;;
        analyze)
            build_analyze_page
            ;;
        *)
            log_error "未知构建类型: $BUILD_TYPE"
            exit 1
            ;;
    esac
    
    local exit_code=$?
    
    # 构建后资源清理
    cleanup_resources
    
    exit $exit_code
}

# 执行主函数
main "$@"