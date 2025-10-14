#!/bin/bash

# 单进程构建脚本
# 构建整个应用以减少内存使用

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

# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=512"

# 构建目录
BUILD_DIR="/workspace/zyweb/dist/web"

# 创建构建目录
mkdir -p $BUILD_DIR

log_info "开始单进程构建整个应用..."

# 构建整个应用
log_info "构建Web应用..."
node --max-old-space-size=512 node_modules/vite/bin/vite.js build --outDir $BUILD_DIR --emptyOutDir

if [ $? -eq 0 ]; then
    log_success "应用构建完成!"
else
    log_error "应用构建失败!"
    exit 1
fi