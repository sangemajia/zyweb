#!/bin/bash
# Main组件构建脚本 (参照zyplayer风格优化)

# 导入统一构建脚本模板
source "$(dirname "$0")/build-template.sh"

# 主函数
main() {
    log_info "Main组件构建脚本启动"
    
    # 执行构建
    build_component "main" "build/configs/vite/vite.main.config.ts"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Main组件构建完成!"
    else
        log_error "Main组件构建失败!"
    fi
    
    exit $exit_code
}

# 执行主函数
main