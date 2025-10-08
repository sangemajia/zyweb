#!/bin/bash
# 分层构建脚本 - 按照架构层次顺序构建所有组件

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

# 构建基础组件层
build_shared_components() {
    log_info "开始构建基础组件层..."
    ./build/scripts/build-shared-components.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "基础组件层构建完成"
    else
        log_error "基础组件层构建失败"
        return $exit_code
    fi
}

# 构建Film中型组件层
build_film_medium() {
    log_info "开始构建Film中型组件层..."
    ./build/scripts/build-film-medium.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Film中型组件层构建完成"
    else
        log_error "Film中型组件层构建失败"
        return $exit_code
    fi
}

# 构建Film大型组件层
build_film_large() {
    log_info "开始构建Film大型组件层..."
    ./build/scripts/build-film-large.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Film大型组件层构建完成"
    else
        log_error "Film大型组件层构建失败"
        return $exit_code
    fi
}

# 构建Film功能页面层
build_film_feature() {
    log_info "开始构建Film功能页面层..."
    ./build/scripts/build-film-feature.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Film功能页面层构建完成"
    else
        log_error "Film功能页面层构建失败"
        return $exit_code
    fi
}

# 构建前端毛坯层
build_frontend_shell() {
    log_info "开始构建前端毛坯层..."
    ./build/scripts/build-frontend-shell.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "前端毛坯层构建完成"
    else
        log_error "前端毛坯层构建失败"
        return $exit_code
    fi
}

# 构建完整应用层
build_complete_app() {
    log_info "开始构建完整应用层..."
    ./build/scripts/build-complete-app.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "完整应用层构建完成"
    else
        log_error "完整应用层构建失败"
        return $exit_code
    fi
}

# 主函数
main() {
    # 确保在项目根目录
    cd "$(dirname "$0")/.."
    
    log_info "开始分层构建..."
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 按顺序构建各层
    build_shared_components || return $?
    build_film_medium || return $?
    build_film_large || return $?
    build_film_feature || return $?
    build_frontend_shell || return $?
    build_complete_app || return $?
    
    # 记录结束时间
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    log_success "所有组件层构建完成! 总耗时: ${total_duration}秒"
}

# 执行主函数
main