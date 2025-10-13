#!/bin/bash
# Lab页面构建脚本 (参照zyplayer风格优化)

# 导入统一构建脚本模板
source "$(dirname "$0")/build-template.sh"

# 主函数
main() {
    log_info "Lab页面构建脚本启动"
    
    # 执行构建
    build_component "lab" "build/configs/vite/vite.lab.config.ts"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Lab页面构建完成!"
    else
        log_error "Lab页面构建失败!"
    fi
    
    exit $exit_code
}

# 执行主函数
main