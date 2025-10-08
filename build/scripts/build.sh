#!/bin/bash
# 整合构建脚本，支持资源清理、依赖管理和分步构建
# 动态调整内存限制以适应低内存环境

# 默认参数
CLEAN_MODE="dev"  # dev 或 full (默认为dev，不清理node_modules)
BUILD_STEP="frontend"   # shared, large, feature, frontend (默认构建完整前端)

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
    echo "  -m, --mode <mode>      设置清理模式: dev（默认）"
    echo "                         dev:  保留所有资源和已安装的依赖（开发环境）"
    echo "  -s, --step <step>      设置构建步骤: shared, large, feature, film, film-medium, film-small, iptv, iptv-medium, iptv-small, drive, drive-medium, drive-small, frontend（默认）"
    echo "                         shared:       构建基础组件"
    echo "                         large:        构建大组件"
    echo "                         feature:      构建功能页面"
    echo "                         film:         构建Film页面"
    echo "                         film-medium:  构建Film页面中组件"
    echo "                         film-small:   构建Film页面小组件"
    echo "                         iptv:         构建IPTV页面"
    echo "                         iptv-medium:  构建IPTV页面中组件"
    echo "                         iptv-small:   构建IPTV页面小组件"
    echo "                         drive:        构建Drive页面"
    echo "                         drive-medium: 构建Drive页面中组件"
    echo "                         drive-small:  构建Drive页面小组件"
    echo "                         frontend:     按顺序构建所有组件（默认）"
    echo "  -h, --help             显示此帮助信息"
    echo ""
    echo "说明:"
    echo "  构建脚本会自动在启动前执行清理脚本"
    echo "  如果指定frontend或不指定步骤，将按顺序构建所有组件"
    echo "  每次构建组件后会自动执行资源清理"
    echo ""
    echo "示例:"
    echo "  $0                    # 按顺序构建所有组件"
    echo "  $0 -s shared          # 仅构建基础组件"
    echo "  $0 -s feature -m dev  # 仅构建功能页面"
    echo "  $0 -s film            # 仅构建Film页面"
    echo "  $0 -s film-medium     # 仅构建Film页面中组件"
    echo "  $0 -s iptv-small      # 仅构建IPTV页面小组件"
}

# 解析命令行参数
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -m|--mode)
                if [[ -n "$2" && "$2" != -* ]]; then
                    CLEAN_MODE="$2"
                    # 只支持dev模式，忽略full模式
                    if [ "$CLEAN_MODE" = "full" ]; then
                        log_warning "已禁用full模式，使用dev模式替代"
                        CLEAN_MODE="dev"
                    fi
                    shift 2
                else
                    log_error "选项 $1 需要一个参数"
                    show_help
                    exit 1
                fi
                ;;
            -s|--step)
                if [[ -n "$2" && "$2" != -* ]]; then
                    BUILD_STEP="$2"
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

# 获取系统可用内存 (MB)
get_available_memory() {
    if command -v free >/dev/null 2>&1; then
        free -m | awk '/^Mem:/{print $7}'
    else
        # 备用方法：从/proc/meminfo获取
        awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo 2>/dev/null || echo "500"
    fi
}

# 动态计算内存限制 (给iflow分配300M，新的node使用剩余内存的80%，给系统留50M)
calculate_memory_limit() {
    local available_memory=$(get_available_memory)
    
    # 给iflow分配300M
    local iflow_memory=300
    
    # 计算剩余内存
    local remaining_memory=$((available_memory - iflow_memory))
    
    # 如果剩余内存小于50M，则使用最小值
    if [ $remaining_memory -lt 50 ]; then
        remaining_memory=50
    fi
    
    # 新的node使用剩余内存的80%，但给系统留50M
    local reserved_memory=50
    local memory_limit=$((remaining_memory * 80 / 100 - reserved_memory))
    
    # 设置上限为1000MB
    if [ $memory_limit -gt 1000 ]; then
        memory_limit=1000
    fi
    
    # 设置下限为50MB
    if [ $memory_limit -lt 50 ]; then
        memory_limit=50
    fi
    
    echo $memory_limit
}

    # 设置Node.js内存限制（根据可用内存动态调整）
    set_node_memory_limit() {
        local memory_limit_mb=$(calculate_memory_limit)
        
        # 增加内存限制范围到10MB到800MB
        if [ $memory_limit_mb -lt 10 ]; then
            memory_limit_mb=10
        elif [ $memory_limit_mb -gt 800 ]; then
            memory_limit_mb=800
        fi
        
        # 检查是否存在推荐内存方案并应用
        local component_type=""
        case "${BUILD_STEP}" in
            shared) component_type="shared" ;;
            large) component_type="large" ;;
            feature) component_type="feature" ;;
            film) component_type="film" ;;
            film-medium) component_type="film-medium" ;;
            film-small) component_type="film-small" ;;
            iptv) component_type="iptv" ;;
            iptv-medium) component_type="iptv-medium" ;;
            iptv-small) component_type="iptv-small" ;;
            drive) component_type="drive" ;;
            drive-medium) component_type="drive-medium" ;;
            drive-small) component_type="drive-small" ;;
            frontend|*) component_type="frontend" ;;
        esac
        
        local recommendation_file="./build/recommendations/${component_type}_recommendation.txt"
        if [ -f "$recommendation_file" ]; then
            # 读取推荐的Node.js内存限制
            local recommended_node_memory=$(grep "推荐Node.js内存限制" "$recommendation_file" | awk '{print $NF}' | sed 's/MB//')
            if [ -n "$recommended_node_memory" ] && [ "$recommended_node_memory" -ge 10 ] && [ "$recommended_node_memory" -le 800 ]; then
                memory_limit_mb=$recommended_node_memory
                log_info "已应用推荐的Node.js内存限制: ${memory_limit_mb}MB"
            fi
        fi
        
        # 同时设置Node.js的内存限制，以提供内存保护
        export NODE_OPTIONS="--max-old-space-size=$memory_limit_mb --no-warnings --no-experimental-fetch"
        log_info "已设置Node.js内存限制: ${memory_limit_mb}MB"
        
        # 禁用WebAssembly以避免内存分配问题
        export V8_SANDBOX_DISABLE_WASM=1
        export NODE_OPTIONS="$NODE_OPTIONS --max-semi-space-size=1 --no-global-search-paths --v8-pool-size=1"
        log_info "已禁用WebAssembly并设置Node.js优化选项"
        

        # 设置系统级内存优化选项
        export MALLOC_ARENA_MAX=1
        log_info "已设置系统级内存优化选项"
    }

# 生成推荐内存构建方案
generate_memory_recommendation() {
    local component_type=$1
    local available_memory=$2
    local allocated_memory=$3
    local build_duration=$4
    
    # 创建推荐方案目录
    mkdir -p "./build/recommendations"
    
    # 生成推荐方案文件
    local recommendation_file="./build/recommendations/${component_type}_recommendation.txt"
    
    # 计算推荐内存（可用内存的60%，但不低于100MB）
    local recommended_memory=$((available_memory * 60 / 100))
    if [ $recommended_memory -lt 100 ]; then
        recommended_memory=100
    fi
    
    # 计算推荐的Node.js内存限制（推荐内存的80%，但不低于50MB）
    local recommended_node_memory=$((recommended_memory * 80 / 100))
    if [ $recommended_node_memory -lt 50 ]; then
        recommended_node_memory=50
    fi
    
    # 生成推荐方案内容
    cat > "$recommendation_file" << EOF
# ${component_type} 组件构建推荐内存方案

## 构建环境信息
- 构建时间: $(date)
- 构建耗时: ${build_duration}秒
- 构建时系统可用内存: ${available_memory}MB
- 分配给node进程的内存: ${allocated_memory}MB

## 推荐内存配置
- 推荐系统可用内存: ${recommended_memory}MB
- 推荐Node.js内存限制: ${recommended_node_memory}MB

## 使用建议
在相似环境下构建时，可以使用以下命令来加快构建速度：
\`\`\`
export NODE_OPTIONS="--max-old-space-size=${recommended_node_memory}"
# 然后执行相应的构建命令
\`\`\`

## 注意事项
1. 如果系统可用内存低于${recommended_memory}MB，建议增加系统内存或使用更小的组件进行构建
2. 如果构建过程中出现内存不足错误，可以适当降低Node.js内存限制
3. 推荐定期更新此推荐方案，以适应项目规模的变化
EOF
    
    log_info "已生成 ${component_type} 组件构建推荐内存方案: $recommendation_file"
}

# 构建基础组件 (Shared Components)
build_shared_components() {
    log_info "开始构建基础组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制为600MB以解决内存不足问题
    export NODE_OPTIONS="--max-old-space-size=600 --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: 600MB"
    
    # 构建基础组件
    log_info "执行基础组件构建..."
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 使用共享组件配置构建
    node --no-warnings --no-experimental-fetch ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.shared-components.config.ts --mode development --minify false --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local memory_limit=$(calculate_memory_limit)
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "基础组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "shared" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: 基础组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建大组件 (Large Components)
build_large_components() {
    log_info "开始构建大组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制为600MB以解决内存不足问题
    export NODE_OPTIONS="--max-old-space-size=600 --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: 600MB"
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建大组件
    log_info "执行大组件构建..."
    # 使用大组件配置构建
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.large-components.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "大组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "large" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: 大组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建Film页面小组件
build_film_small_components() {
    log_info "开始构建Film页面小组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制为600MB
    export NODE_OPTIONS="--max-old-space-size=600 --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: 600MB"
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建Film页面小组件
    log_info "执行Film页面小组件构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.film-small.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "Film页面小组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "film-small" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Film页面小组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建Film页面中组件
build_film_medium_components() {
    log_info "开始构建Film页面中组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建Film页面中组件
    log_info "执行Film页面中组件构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.film-medium.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "Film页面中组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "film-medium" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Film页面中组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建Film页面
build_film_page() {
    log_info "开始构建Film页面..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建Film页面
    log_info "执行Film页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.film.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "Film页面构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "film" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Film页面构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建IPTV页面小组件
build_iptv_small_components() {
    log_info "开始构建IPTV页面小组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建IPTV页面小组件
    log_info "执行IPTV页面小组件构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.iptv-small.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "IPTV页面小组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "iptv-small" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: IPTV页面小组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建IPTV页面中组件
build_iptv_medium_components() {
    log_info "开始构建IPTV页面中组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建IPTV页面中组件
    log_info "执行IPTV页面中组件构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.iptv-medium.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "IPTV页面中组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "iptv-medium" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: IPTV页面中组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建IPTV页面
build_iptv_page() {
    log_info "开始构建IPTV页面..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建IPTV页面
    log_info "执行IPTV页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.iptv.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "IPTV页面构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "iptv" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: IPTV页面构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建Drive页面小组件
build_drive_small_components() {
    log_info "开始构建Drive页面小组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建Drive页面小组件
    log_info "执行Drive页面小组件构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.drive-small.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "Drive页面小组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "drive-small" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Drive页面小组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建Drive页面中组件
build_drive_medium_components() {
    log_info "开始构建Drive页面中组件..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建Drive页面中组件
    log_info "执行Drive页面中组件构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.drive-medium.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "Drive页面中组件构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "drive-medium" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Drive页面中组件构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建Drive页面
build_drive_page() {
    log_info "开始构建Drive页面..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建Drive页面
    log_info "执行Drive页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.drive.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "Drive页面构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "drive" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Drive页面构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建功能页面 (Feature Pages)
build_feature_pages() {
    log_info "开始构建功能页面..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 分别构建每个功能页面
    log_info "执行Film页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.film.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: Film页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行IPTV页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.iptv.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: IPTV页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行Drive页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.drive.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: Drive页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行Lab页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.lab.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: Lab页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行Chase页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.chase.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: Chase页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行Play页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.play.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: Play页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行Setting页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.setting.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "错误: Setting页面构建失败 (退出码: $exit_code)"
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
    
    log_info "执行Analyze页面构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.analyze.config.ts --minify false --mode development --ssrManifest false
    
    exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "功能页面构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "feature" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: Analyze页面构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 构建前端应用 (Frontend)
build_frontend() {
    log_info "开始构建前端应用..."
    
    # 动态计算内存限制
    local memory_limit=$(calculate_memory_limit)
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (剩余内存的80%，给系统留50M)"
    
    # 设置Node.js内存限制
    set_node_memory_limit
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建前端应用
    log_info "执行前端应用构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config build/configs/vite/vite.frontend.config.ts --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "前端应用构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "frontend" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: 前端应用构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 分步构建函数（循环单次构建组件方式）
build_step_by_step() {
    log_info "开始循环单次构建组件..."
    
    # 如果指定了特定步骤，则只构建该步骤
    if [ "$BUILD_STEP" != "frontend" ]; then
        log_info "构建单个组件: $BUILD_STEP"
        case $BUILD_STEP in
            shared)
                build_shared_components || return $?
                ;;
            large)
                build_large_components || return $?
                ;;
            feature)
                build_feature_pages || return $?
                ;;
            film)
                build_film_page || return $?
                ;;
            film-medium)
                build_film_medium_components || return $?
                ;;
            film-small)
                build_film_small_components || return $?
                ;;
            iptv)
                build_iptv_page || return $?
                ;;
            iptv-medium)
                build_iptv_medium_components || return $?
                ;;
            iptv-small)
                build_iptv_small_components || return $?
                ;;
            drive)
                build_drive_page || return $?
                ;;
            drive-medium)
                build_drive_medium_components || return $?
                ;;
            drive-small)
                build_drive_small_components || return $?
                ;;
            *)
                log_error "未知构建步骤: $BUILD_STEP"
                return 1
                ;;
        esac
        return 0
    fi
    
    # 如果未指定步骤或指定为frontend，则按调整后的顺序构建所有组件
    log_info "按调整后的顺序构建所有组件..."
    
    # 构建基础组件
    log_info "1/11: 构建基础组件..."
    build_shared_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建基础组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Film页面小组件
    log_info "2/11: 构建Film页面小组件..."
    build_film_small_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Film页面小组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建IPTV页面小组件
    log_info "3/11: 构建IPTV页面小组件..."
    build_iptv_small_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建IPTV页面小组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Drive页面小组件
    log_info "4/11: 构建Drive页面小组件..."
    build_drive_small_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Drive页面小组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Film页面中组件
    log_info "5/11: 构建Film页面中组件..."
    build_film_medium_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Film页面中组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建IPTV页面中组件
    log_info "6/11: 构建IPTV页面中组件..."
    build_iptv_medium_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建IPTV页面中组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Drive页面中组件
    log_info "7/11: 构建Drive页面中组件..."
    build_drive_medium_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Drive页面中组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建大组件
    log_info "8/11: 构建大组件..."
    build_large_components || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建大组件完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Film页面
    log_info "9/11: 构建Film页面..."
    build_film_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Film页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建IPTV页面
    log_info "10/11: 构建IPTV页面..."
    build_iptv_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建IPTV页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Drive页面
    log_info "11/15: 构建Drive页面..."
    build_drive_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Drive页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Lab页面
    log_info "12/15: 构建Lab页面..."
    build_lab_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Lab页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Chase页面
    log_info "13/15: 构建Chase页面..."
    build_chase_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Chase页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Play页面
    log_info "14/15: 构建Play页面..."
    build_play_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Play页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Setting页面
    log_info "15/15: 构建Setting页面..."
    build_setting_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Setting页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    # 构建Analyze页面
    log_info "16/16: 构建Analyze页面..."
    build_analyze_page || return $?
    
    # 每次构建后执行清理脚本
    log_info "构建Analyze页面完成，执行资源清理..."
    ./build/scripts/build-cleanup.sh
    
    log_success "所有组件构建完成!"
    return 0
}

# 主函数
main() {
    # 解析命令行参数
    parse_arguments "$@"
    
    # 确保在项目根目录
    cd "$(dirname "$0")/../.."
    
    # 在启动构建前执行清理脚本
    log_info "在启动构建前执行清理脚本..."
    ./build/scripts/build-cleanup.sh
    
    # 检查资源清理是否成功
    if [ $? -ne 0 ]; then
        log_error "资源清理失败，停止构建"
        exit 1
    fi
    
    # 执行分步构建
    build_step_by_step
}

# 执行主函数
main "$@"