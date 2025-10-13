#!/bin/bash

# 简化版UI组装脚本
# 用于定位语法错误

set -e  # 遇到错误时停止执行

# 获取脚本所在目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR"))"

echo "脚本目录: $SCRIPT_DIR"
echo "项目根目录: $PROJECT_ROOT"

# 主函数
main() {
    echo "主函数执行"
}

# 执行主函数
main "$@"