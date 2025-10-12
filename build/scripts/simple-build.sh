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

# 检查组件是否已存在
check_component_exists() {
    local component_name=$1
    
    # 根据组件名确定对应的构建产物目录
    local component_dir=""
    case $component_name in
        "shared-components")
            component_dir="dist/zyweb/shared-components"
            ;;
        "film")
            component_dir="dist/zyweb/film"
            ;;
        "iptv")
            component_dir="dist/zyweb/iptv"
            ;;
        "drive")
            component_dir="dist/zyweb/drive"
            ;;
        "lab")
            component_dir="dist/zyweb/lab"
            ;;
        "chase")
            component_dir="dist/zyweb/chase"
            ;;
        "play")
            component_dir="dist/zyweb/play"
            ;;
        "setting")
            component_dir="dist/zyweb/setting"
            ;;
        "analyze")
            component_dir="dist/zyweb/analyze"
            ;;
        "home")
            component_dir="dist/zyweb/home"
            ;;
    esac
    
    # 检查目录是否存在且不为空
    if [ -d "$component_dir" ] && [ -n "$(ls -A "$component_dir")" ]; then
        return 0  # 组件存在
    else
        return 1  # 组件不存在
    fi
}

# 构建单个组件
build_component() {
    local name=$1
    local config_file=$2
    local component_name=$3
    
    # 检查组件是否已存在
    if check_component_exists "$component_name"; then
        log_info "组件 ${name} 已存在，跳过构建..."
        return 0
    fi
    
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
    if node --max-old-space-size=${memory_limit} ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development; then
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

# 组装UI
# 准备后端服务
prepare_backend() {
    log_info "准备后端服务..."
    
    # 创建server目录
    mkdir -p dist/server
    
    # 复制后端文件
    if [ -d "src/backend" ]; then
        # 复制src目录中的所有文件
        cp -r src/backend/src dist/server/
        # 复制根目录文件
        cp src/backend/index.js dist/server/
        cp src/backend/package.json dist/server/
        cp src/backend/.env dist/server/ 2>/dev/null || true
        log_success "后端服务准备完成"
    else
        log_warning "后端服务源码目录不存在，跳过后端服务准备"
    fi
}

# 组装UI
assemble_ui() {
    log_info "开始组装UI..."
    
    if ! ./build/scripts/assemble-ui.sh; then
        log_error "UI组装失败"
        return 1
    fi
    
    log_success "UI组装完成"
}

# 集成应用
integrate_app() {
    log_info "开始集成应用..."
    
    if ! ./build/scripts/integrate-app.sh; then
        log_error "应用集成失败"
        return 1
    fi
    
    log_success "应用集成完成"
}

# 清理中间产物
cleanup_intermediate_artifacts() {
    log_info "清理中间产物..."
    
    # 定义目录路径
    local DIST_DIR="$(pwd)/dist"
    local UI_DIR="$DIST_DIR/ui"
    local SERVER_DIR="$DIST_DIR/server"
    
    # 删除dist目录中的ui和server目录
    if [ -d "$UI_DIR" ]; then
        rm -rf "$UI_DIR"
        log_info "已删除UI中间产物目录: $UI_DIR"
    fi
    
    if [ -d "$SERVER_DIR" ]; then
        rm -rf "$SERVER_DIR"
        log_info "已删除Server中间产物目录: $SERVER_DIR"
    fi
    
    log_success "中间产物清理完成"
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
            "home")
                components=("Home页面:build/configs/vite/vite.home.config.ts")
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
            "Home页面:build/configs/vite/vite.home.config.ts"
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
        
        if ! build_component "${name}" "${config_file}" "${component_name}"; then
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
    
    # 如果是完整构建（没有指定特定组件），则继续执行UI组装和应用集成
    if [ -z "$COMPONENT" ]; then
        log_info "开始执行生产环境构建后续步骤..."
        
        # 准备后端服务
        prepare_backend
        
        # 组装UI
        if ! assemble_ui; then
            log_error "UI组装阶段失败"
            exit 1
        fi
        
        # 集成应用
        if ! integrate_app; then
            log_error "应用集成阶段失败"
            exit 1
        fi
        
        log_success "生产环境构建完成!"
        log_info "集成应用程序位于: $(pwd)/dist/app"
        
        # 清理中间产物
        cleanup_intermediate_artifacts
    else
        log_info "指定组件构建完成，跳过UI组装和应用集成步骤"
    fi
}

# 解析命令行参数
parse_arguments "$@"

# 执行主函数
main