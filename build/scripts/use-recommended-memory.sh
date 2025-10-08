#!/bin/bash
# 使用推荐内存构建方案的示例脚本

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
    echo "  -t, --type <type>      设置组件类型: shared, large, feature, film, film-medium, film-small, iptv, iptv-medium, iptv-small, drive, drive-medium, drive-small, frontend"
    echo "  -h, --help             显示此帮助信息"
    echo ""
    echo "说明:"
    echo "  此脚本演示如何使用推荐的内存构建方案来加快构建速度"
    echo ""
    echo "示例:"
    echo "  $0 -t frontend         # 使用前端组件的推荐内存方案"
    echo "  $0 -t shared           # 使用基础组件的推荐内存方案"
    echo "  $0 -t film             # 使用Film页面的推荐内存方案"
    echo "  $0 -t film-medium      # 使用Film页面中组件的推荐内存方案"
    echo "  $0 -t film-small       # 使用Film页面小组件的推荐内存方案"
    echo "  $0 -t iptv-small       # 使用IPTV页面小组件的推荐内存方案"
    echo "  $0 -t drive-medium     # 使用Drive页面中组件的推荐内存方案"
}

# 解析命令行参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--type)
                if [[ -n "$2" && "$2" != -* ]]; then
                    COMPONENT_TYPE="$2"
                    shift 2
                else
                    log_error "选项 $1 需要一个参数"
                    show_help
                    exit 1
                fi
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

# 应用推荐内存方案
apply_recommendation() {
    local component_type=${COMPONENT_TYPE:-"frontend"}
    local recommendation_file="./build/recommendations/${component_type}_recommendation.txt"
    
    # 检查推荐方案文件是否存在
    if [ ! -f "$recommendation_file" ]; then
        log_error "推荐方案文件不存在: $recommendation_file"
        log_info "请先运行一次构建以生成推荐方案"
        exit 1
    fi
    
    # 显示推荐方案内容
    log_info "使用 ${component_type} 组件的推荐内存方案:"
    cat "$recommendation_file"
    echo ""
    
    # 读取推荐的Node.js内存限制
    local recommended_node_memory=$(grep "推荐Node.js内存限制" "$recommendation_file" | awk '{print $NF}' | sed 's/MB//')
    if [ -n "$recommended_node_memory" ] && [ "$recommended_node_memory" -ge 50 ] && [ "$recommended_node_memory" -le 500 ]; then
        # 应用推荐的Node.js内存限制
        export NODE_OPTIONS="--max-old-space-size=${recommended_node_memory} --no-warnings --no-experimental-fetch"
        log_success "已应用推荐的Node.js内存限制: ${recommended_node_memory}MB"
    else
        log_warning "无法从推荐方案中读取有效的Node.js内存限制"
        exit 1
    fi
}

# 执行构建
run_build() {
    local component_type=${COMPONENT_TYPE:-"frontend"}
    
    # 根据组件类型执行相应的构建命令
    case $component_type in
        shared)
            log_info "执行基础组件构建..."
            ./build/scripts/build.sh -s shared
            ;;
        large)
            log_info "执行大组件构建..."
            ./build/scripts/build.sh -s large
            ;;
        feature)
            log_info "执行功能页面构建..."
            ./build/scripts/build.sh -s feature
            ;;
        film)
            log_info "执行Film页面构建..."
            ./build/scripts/build.sh -s film
            ;;
        film-medium)
            log_info "执行Film页面中组件构建..."
            ./build/scripts/build.sh -s film-medium
            ;;
        film-small)
            log_info "执行Film页面小组件构建..."
            ./build/scripts/build.sh -s film-small
            ;;
        iptv)
            log_info "执行IPTV页面构建..."
            ./build/scripts/build.sh -s iptv
            ;;
        iptv-medium)
            log_info "执行IPTV页面中组件构建..."
            ./build/scripts/build.sh -s iptv-medium
            ;;
        iptv-small)
            log_info "执行IPTV页面小组件构建..."
            ./build/scripts/build.sh -s iptv-small
            ;;
        drive)
            log_info "执行Drive页面构建..."
            ./build/scripts/build.sh -s drive
            ;;
        drive-medium)
            log_info "执行Drive页面中组件构建..."
            ./build/scripts/build.sh -s drive-medium
            ;;
        drive-small)
            log_info "执行Drive页面小组件构建..."
            ./build/scripts/build.sh -s drive-small
            ;;
        frontend|*)
            log_info "执行前端应用构建..."
            ./build/scripts/build.sh -s frontend
            ;;
    esac
}

# 主函数
main() {
    # 解析命令行参数
    parse_arguments "$@"
    
    # 确保在项目根目录
    cd "$(dirname "$0")/../.."
    
    # 应用推荐内存方案
    apply_recommendation
    
    # 执行构建
    run_build
}

# 执行主函数
main "$@"