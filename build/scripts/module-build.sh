#!/bin/bash

# 逐模块构建脚本
# 通过修改入口文件来逐个构建模块

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
TEMP_DIR="/workspace/zyweb/temp"

# 创建目录
mkdir -p $BUILD_DIR
mkdir -p $TEMP_DIR

# 保存原始入口文件
log_info "保存原始入口文件..."
cp /workspace/zyweb/src/renderer/index.html $TEMP_DIR/index.html.original

# 创建模块入口文件
create_module_entry() {
    local module_name=$1
    local entry_file=$2
    
    log_info "创建 ${module_name} 模块入口文件..."
    
    cat > /workspace/zyweb/src/renderer/index.html << EOF
<!doctype html>
<html is-chrome="true">
  <head>
    <meta charset="UTF-8" />
    <title>zyfun - ${module_name}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${entry_file}"></script>
  </body>
</html>
EOF
}

# 构建单个模块
build_module() {
    local module_name=$1
    local entry_file=$2
    local output_dir=$3
    
    log_info "构建 ${module_name} 模块..."
    
    # 创建模块入口
    create_module_entry "$module_name" "$entry_file"
    
    # 构建模块
    node --max-old-space-size=512 node_modules/vite/bin/vite.js build \
        --outDir "${BUILD_DIR}/${output_dir}" \
        --emptyOutDir
    
    if [ $? -eq 0 ]; then
        log_success "${module_name} 模块构建完成!"
    else
        log_error "${module_name} 模块构建失败!"
    fi
}

# 构建各个模块
log_info "开始逐模块构建..."

# 构建核心模块
build_module "核心" "/src/main.ts" "main"

# 恢复原始入口文件
log_info "恢复原始入口文件..."
cp $TEMP_DIR/index.html.original /workspace/zyweb/src/renderer/index.html

# 清理临时文件
rm -rf $TEMP_DIR

log_success "模块构建完成!"