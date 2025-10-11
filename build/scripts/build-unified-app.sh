#!/bin/bash

# 统一应用程序构建脚本
# 该脚本调用现有的构建脚本来构建整个zyweb应用程序

set -e  # 遇到错误时停止执行

# 日志函数
log_info() {
    echo -e "\033[36m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# 获取脚本所在目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"

# 修正项目根目录路径
PROJECT_ROOT="$PROJECT_ROOT/zyweb"

log_info "脚本目录: $SCRIPT_DIR"
log_info "项目根目录: $PROJECT_ROOT"

# 构建顺序数组
BUILD_SCRIPTS=(
    "build-shared-components.sh"
    "build-home.sh"
    "build-film.sh"
    "build-iptv.sh"
    "build-drive.sh"
    "build-play.sh"
    "build-analyze.sh"
    "build-chase.sh"
    "build-lab.sh"
    "build-setting.sh"
)

# 构建函数
build_all() {
    log_info "开始构建统一应用程序..."
    
    # 记录开始时间
    start_time=$(date +%s)
    
    # 依次执行所有构建脚本
    for script in "${BUILD_SCRIPTS[@]}"; do
        log_info "执行构建脚本: $script"
        
        # 检查脚本是否存在
        if [ ! -f "$PROJECT_ROOT/build/scripts/$script" ]; then
            log_error "构建脚本不存在: $PROJECT_ROOT/build/scripts/$script"
            return 1
        fi
        
        # 执行构建脚本
        if ! "$PROJECT_ROOT/build/scripts/$script"; then
            log_error "构建脚本执行失败: $script"
            return 1
        fi
        
        log_success "构建脚本执行成功: $script"
    done
    
    # 记录结束时间
    end_time=$(date +%s)
    build_duration=$((end_time - start_time))
    
    log_success "所有模块构建完成!"
    log_info "总构建耗时: ${build_duration}秒"
}

# 清理函数
cleanup() {
    log_info "执行内存清理..."
    # 检查清理脚本是否存在
    if [ -f "$PROJECT_ROOT/build/scripts/build-cleanup.sh" ]; then
        # 执行内存清理脚本
        "$PROJECT_ROOT/build/scripts/build-cleanup.sh"
    else
        log_info "清理脚本不存在，跳过清理步骤"
    fi
}

# 主函数
main() {
    log_info "开始统一应用程序构建流程"
    
    # 执行构建
    if build_all; then
        # 构建成功后执行清理
        cleanup
        log_success "统一应用程序构建完成!"
        exit 0
    else
        # 构建失败后也执行清理
        cleanup
        exit 1
    fi
}

# 执行主函数
main "$@"