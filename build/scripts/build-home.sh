#!/bin/bash
# Home页面构建脚本

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

# 设置Node.js内存限制
set_node_memory_limit() {
    local memory_limit_mb=1200
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=${memory_limit_mb} --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: ${memory_limit_mb}MB"
}



# 获取脚本所在目录和项目根目录
get_project_root() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "$(dirname "$(dirname "$script_dir")")"
}

# 通用构建函数
build_component() {
    local component_name=$1
    local config_file=$2
    local PROJECT_ROOT=$(get_project_root)
    
    log_info "开始构建 ${component_name}..."
    
    # 动态计算内存限制
    local memory_limit=1200
    log_info "系统可用内存: $(get_available_memory)MB"
    log_info "给iflow分配: 300MB"
    log_info "给新的node进程分配: ${memory_limit}MB (默认值)"
    
    # 设置Node.js内存限制
    set_node_memory_limit "${component_name}"
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建组件
    log_info "执行 ${component_name} 构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "${component_name} 构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        
        # 如果是home页面，提前处理修改主入口文件的挂载点
        if [ "$component_name" = "home" ]; then
            log_info "处理home页面主入口文件的挂载点..."
            # 获取构建产物目录
            local home_dist_dir="$PROJECT_ROOT/dist/zyweb/home"
            # 查找生成的主JS文件
            local main_js_file=$(find "$home_dist_dir" -name "home-main-*.js" | head -n 1)
            
            if [ -n "$main_js_file" ]; then
                # 修改挂载点
                sed -i 's/app.mount("#app")/app.mount("#home-container")/g' "$main_js_file"
                log_success "home页面主入口文件挂载点修改完成"
            else
                log_warning "未找到home页面主JS文件，跳过挂载点修改"
            fi
        fi
        
        return 0
    else
        log_error "错误: ${component_name} 构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 执行构建
build_component "home" "build/configs/vite/vite.home.config.ts"
