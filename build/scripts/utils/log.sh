#!/bin/bash

# 日志工具脚本
# 提供统一的日志输出功能

# 日志函数
log_info() {
    echo -e "\033[36m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# 导出函数供其他脚本使用
export -f log_info
export -f log_success
export -f log_warning
export -f log_error