#!/bin/bash

# 智能构建脚本，支持动态内存模式

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
    echo "  -h, --help              显示此帮助信息"
    echo "  -p, --pause             启动后暂停5秒"
    echo "  -c, --component <name>  构建指定组件"
    echo ""
    echo "示例:"
    echo "  $0                      # 使用动态内存模式构建所有组件"
    echo "  $0 -p                   # 使用动态内存模式并启动后暂停5秒"
    echo "  $0 -c film              # 构建film组件"
}

# 解析命令行参数
parse_arguments() {
    PAUSE=false
    COMPONENT=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -p|--pause)
                PAUSE=true
                shift
                ;;
            -c|--component)
                COMPONENT="$2"
                shift 2
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
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

# 获取组件的动态内存限制
get_dynamic_memory_limit() {
    local component_name=$1
    
    # 动态计算内存限制（基于清理后的最大可用内存）
    local available_memory=$(get_available_memory)
    
    # 计算真实可用内存：
    # - iflow和监控进程合用至少300M
    # - 系统保留50M
    # - 剩下的才是真实的可用内存
    local real_available_memory=$((available_memory - 300 - 50))
    
    # 检查真实可用内存是否过低
    if [ $real_available_memory -lt 230 ]; then
        log_error "当前系统内存可用过低: ${real_available_memory}MB < 230MB"
        log_error "请手动释放内存，或更换开发环境"
        exit 1
    fi
    
    # 根据组件类型分配不同的内存限制
    local memory_limit
    case $component_name in
        "film"|"iptv"|"drive"|"chase")
            # 复杂组件需要更多内存
            memory_limit=$((real_available_memory * 9 / 10))
            # 确保复杂组件至少有300MB内存
            if [ $memory_limit -lt 300 ]; then
                memory_limit=300
            fi
            ;;
        "analyze"|"lab"|"play"|"setting")
            # 中等复杂度组件
            memory_limit=$((real_available_memory * 8 / 10))
            # 确保中等复杂度组件至少有275MB内存
            if [ $memory_limit -lt 275 ]; then
                memory_limit=275
            fi
            ;;
        *)
            # 简单组件
            memory_limit=$((real_available_memory * 7 / 10))
            # 确保简单组件至少有250MB内存
            if [ $memory_limit -lt 250 ]; then
                memory_limit=250
            fi
            ;;
    esac
    
    # 设置下限为250MB（确保有足够的内存进行构建）
    if [ $memory_limit -lt 250 ]; then
        memory_limit=250
    fi
    
    echo $memory_limit
}

# 构建单个组件
build_component() {
    local name=$1
    local config_file=$2
    
    log_info "开始构建 ${name}..."
    
    # 获取动态内存限制
    local memory_limit=$(get_dynamic_memory_limit "$name")
    
    log_info "当前可用内存: $(get_available_memory)MB"
    log_info "计算得出的内存限制: ${memory_limit}MB"
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 等待一会儿（保持2秒）
    wait_seconds 2
    
    # 执行构建
    log_info "执行 ${name} 构建..."
    if node --max-old-space-size=${memory_limit} ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development --ssrManifest false; then
        local end_time=$(date +%s)
        local build_duration=$((end_time - start_time))
        log_success "${name} 构建完成!"
        return 0
    else
        local exit_code=$?
        local end_time=$(date +%s)
        local build_duration=$((end_time - start_time))
        log_error "构建 ${name} 失败 (退出码: $exit_code)"
        return 1
    fi
}

# 主函数
main() {
    log_info "智能构建脚本启动"
    
    # 启动后暂停5秒（如果指定了-p选项）
    if [ "$PAUSE" == "true" ]; then
        log_info "启动后暂停5秒..."
        wait_seconds 5
    fi
    
    # 在构建开始前先执行一次清理
    log_info "构建开始前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 等待清理完成（保持2秒）
    wait_seconds 2

    # 定义要构建的组件
    local components
    if [ -n "$COMPONENT" ]; then
        # 构建指定组件
        case $COMPONENT in
            "shared-components")
                components=("基础组件:build/configs/vite/vite.shared-components.config.ts")
                ;;
            "film")
                components=("Film页面:build/configs/vite/vite.film.config.ts")
                ;;
            "iptv")
                components=("IPTV页面:build/configs/vite/vite.iptv.config.ts")
                ;;
            "drive")
                components=("Drive页面:build/configs/vite/vite.drive.config.ts")
                ;;
            "lab")
                components=("Lab页面:build/configs/vite/vite.lab.config.ts")
                ;;
            "chase")
                components=("Chase页面:build/configs/vite/vite.chase.config.ts")
                ;;
            "play")
                components=("Play页面:build/configs/vite/vite.play.config.ts")
                ;;
            "setting")
                components=("Setting页面:build/configs/vite/vite.setting.config.ts")
                ;;
            "analyze")
                components=("Analyze页面:build/configs/vite/vite.analyze.config.ts")
                ;;
            *)
                log_error "未知组件: $COMPONENT"
                exit 1
                ;;
        esac
    else
        # 构建所有组件
        components=(
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
    fi
    
    local total_components=${#components[@]}
    local current_index=0
    
    for component in "${components[@]}"; do
        current_index=$((current_index + 1))
        log_info "进度: ${current_index}/${total_components}"
        
        local name="${component%%:*}"
        local config_file="${component#*:}"
        
        # 转换组件名为英文用于文件名
        local component_name=""
        case $name in
            "基础组件")
                component_name="shared-components"
                ;;
            "Film页面")
                component_name="film"
                ;;
            "IPTV页面")
                component_name="iptv"
                ;;
            "Drive页面")
                component_name="drive"
                ;;
            "Lab页面")
                component_name="lab"
                ;;
            "Chase页面")
                component_name="chase"
                ;;
            "Play页面")
                component_name="play"
                ;;
            "Setting页面")
                component_name="setting"
                ;;
            "Analyze页面")
                component_name="analyze"
                ;;
        esac
        
        if ! build_component "${component_name}" "${config_file}"; then
            log_error "构建失败: ${name}"
            exit 1
        fi
        
        # 在组件之间等待（保持2秒）
        if [ $current_index -lt $total_components ]; then
            log_info "组件间等待2秒..."
            wait_seconds 2
        fi
    done
    
    # 在所有组件构建完成后执行一次内存清理
    log_info "所有组件构建完成后执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    log_success "所有组件构建完成!"
}

# 解析命令行参数
parse_arguments "$@"

# 执行主函数
main