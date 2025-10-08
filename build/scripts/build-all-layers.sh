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

# 构建Film页面
build_film_page() {
    log_info "开始构建Film页面..."
    ./build/scripts/build-film.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Film页面构建完成"
    else
        log_error "Film页面构建失败"
        return $exit_code
    fi
}

# 构建IPTV页面
build_iptv_page() {
    log_info "开始构建IPTV页面..."
    ./build/scripts/build-iptv.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "IPTV页面构建完成"
    else
        log_error "IPTV页面构建失败"
        return $exit_code
    fi
}

# 构建Drive页面
build_drive_page() {
    log_info "开始构建Drive页面..."
    ./build/scripts/build-drive.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Drive页面构建完成"
    else
        log_error "Drive页面构建失败"
        return $exit_code
    fi
}

# 构建Lab页面
build_lab_page() {
    log_info "开始构建Lab页面..."
    ./build/scripts/build-lab.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Lab页面构建完成"
    else
        log_error "Lab页面构建失败"
        return $exit_code
    fi
}

# 构建Chase页面
build_chase_page() {
    log_info "开始构建Chase页面..."
    ./build/scripts/build-chase.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Chase页面构建完成"
    else
        log_error "Chase页面构建失败"
        return $exit_code
    fi
}

# 构建Play页面
build_play_page() {
    log_info "开始构建Play页面..."
    ./build/scripts/build-play.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Play页面构建完成"
    else
        log_error "Play页面构建失败"
        return $exit_code
    fi
}

# 构建Setting页面
build_setting_page() {
    log_info "开始构建Setting页面..."
    ./build/scripts/build-setting.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Setting页面构建完成"
    else
        log_error "Setting页面构建失败"
        return $exit_code
    fi
}

# 构建Analyze页面
build_analyze_page() {
    log_info "开始构建Analyze页面..."
    ./build/scripts/build-analyze.sh
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        log_success "Analyze页面构建完成"
    else
        log_error "Analyze页面构建失败"
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
    build_film_page || return $?
    build_iptv_page || return $?
    build_drive_page || return $?
    build_lab_page || return $?
    build_chase_page || return $?
    build_play_page || return $?
    build_setting_page || return $?
    build_analyze_page || return $?
    
    # 记录结束时间
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))
    
    log_success "所有组件层构建完成! 总耗时: ${total_duration}秒"
}

# 执行主函数
main