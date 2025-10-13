#!/bin/bash
# Analyze页面构建脚本 (参照zyplayer风格优化)

# 导入统一构建脚本模板
source "$(dirname "$0")/build-template.sh"

# 主函数
main() {
    log_info "Analyze页面构建脚本启动"
    
    # 执行构建
    build_component "analyze" "build/configs/vite/vite.analyze.config.ts"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Analyze页面构建完成!"
    else
        log_error "Analyze页面构建失败!"
    fi
    
    exit $exit_code
}

# 执行主函数
main