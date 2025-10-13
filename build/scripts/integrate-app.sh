#!/bin/bash

# 前后端集成脚本
# 该脚本用于将前端UI和后端服务集成到一个完整的应用程序中

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

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

# 获取脚本所在目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

log_info "脚本目录: $SCRIPT_DIR"
log_info "项目根目录: $PROJECT_ROOT"

# 定义目录路径
DIST_DIR="$PROJECT_ROOT/dist"
UI_DIR="$DIST_DIR/ui"
SERVER_DIR="$DIST_DIR/server"
APP_DIR="$DIST_DIR/app"

# 创建集成目录
create_app_directory() {
    log_info "创建集成应用程序目录..."
    mkdir -p "$APP_DIR"
    log_success "集成目录创建完成"
}

# 复制后端服务
copy_backend() {
    log_info "复制后端服务..."
    
    # 创建服务目录
    mkdir -p "$APP_DIR/server"
    
    # 复制后端文件
    if [ -d "$SERVER_DIR" ]; then
        cp -r "$SERVER_DIR"/* "$APP_DIR/server/" 2>/dev/null || true
        # 单独复制隐藏文件（如.env）
        cp "$SERVER_DIR"/.env "$APP_DIR/server/" 2>/dev/null || true
        log_success "后端服务复制完成"
    else
        log_error "后端服务目录不存在: $SERVER_DIR"
        return 1
    fi
}

# 复制前端UI
copy_frontend() {
    log_info "复制前端UI..."
    
    # 创建UI目录
    mkdir -p "$APP_DIR/ui"
    
    # 复制UI文件
    if [ -d "$UI_DIR" ]; then
        # 复制所有UI文件和目录
        cp -r "$UI_DIR"/* "$APP_DIR/ui/"
        log_success "前端UI复制完成"
    else
        log_error "前端UI目录不存在: $UI_DIR"
        return 1
    fi
}



# 创建环境变量文件
create_env_file() {
    log_info "创建环境变量文件..."
    
    # 从后端源码复制.env文件
    if [ -f "$PROJECT_ROOT/src/backend/.env" ]; then
        cp "$PROJECT_ROOT/src/backend/.env" "$APP_DIR/.env"
        log_success "环境变量文件从后端源码复制完成"
    else
        log_warning "后端源码中未找到.env文件，使用默认配置"
        cat > "$APP_DIR/.env" << EOF
# 部署方案设置
# 一体化部署 (standalone) 或 前后端分离部署 (separate)
DEPLOYMENT_MODE=standalone

# 数据库设置
# 支持 pglite, pg, mysql
DB_TYPE=pglite
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zyweb
DB_USER=postgres
DB_PASSWORD=postgres

# MySQL配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=zyweb
MYSQL_USER=root
MYSQL_PASSWORD=root

# 服务端口
PORT=8819
EOF
    fi
    
    log_success "环境变量文件创建完成"
}

# 创建启动脚本
create_startup_script() {
    log_info "创建启动脚本..."
    
    cat > "$APP_DIR/start.sh" << 'EOF'
#!/bin/bash

# 应用程序启动脚本

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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查Node.js是否安装
check_nodejs() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    local node_version=$(node --version)
    log_info "Node.js版本: $node_version"
}

# 检查依赖是否已安装且完整
check_dependencies() {
    log_info "检查依赖安装状态..."
    
    if [ -f "server/package.json" ]; then
        # 检查node_modules目录是否存在且不为空
        if [ -d "server/node_modules" ] && [ -n "$(ls -A server/node_modules)" ]; then
            # 只检查生产依赖是否已安装（排除开发依赖）
            local missing_deps=0
            
            # 获取package.json中的生产依赖列表
            local deps=$(node -e "const pkg = require('./server/package.json'); const deps = pkg.dependencies || {}; console.log(Object.keys(deps).join(' '));" 2>/dev/null)
            
            # 检查每个生产依赖是否存在于node_modules中
            for dep in $deps; do
                if [ ! -d "server/node_modules/$dep" ] && [ ! -d "server/node_modules/@"*"/$dep" ]; then
                    log_warning "依赖 $dep 未安装"
                    missing_deps=1
                    break
                fi
            done
            
            if [ $missing_deps -eq 0 ]; then
                log_success "依赖已安装且完整，跳过安装步骤"
                return 0
            else
                log_info "依赖不完整，需要重新安装"
                return 1
            fi
        else
            log_info "依赖未安装，需要安装依赖"
            return 1
        fi
    else
        log_error "server/package.json文件不存在"
        return 1
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装生产环境依赖..."
    
    if [ -f "server/package.json" ]; then
        cd server
        # 检查yarn是否可用，否则使用npm
        if command -v yarn &> /dev/null; then
            yarn install --production
        else
            npm install --production
        fi
        cd ..
        log_success "依赖安装完成"
    else
        log_error "server/package.json文件不存在"
        return 1
    fi
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    if [ -f "server/src/index.js" ]; then
        cd server
        node src/index.js &
        BACKEND_PID=$!
        log_success "后端服务已启动 (PID: $BACKEND_PID)"
        cd ..
    elif [ -f "server/index.js" ]; then
        cd server
        node index.js &
        BACKEND_PID=$!
        log_success "后端服务已启动 (PID: $BACKEND_PID)"
        cd ..
    else
        log_error "后端入口文件不存在"
        return 1
    fi
}

# 启动前端服务（用于前后端分离部署模式）
start_frontend() {
    log_info "启动前端服务..."
    
    # 检查是否安装了serve或其他静态文件服务器
    if command -v serve &> /dev/null; then
        serve -s ui -l 8820 &
        FRONTEND_PID=$!
        log_success "前端服务已启动 (PID: $FRONTEND_PID)"
        log_info "前端服务地址: http://localhost:8820"
    elif command -v python3 &> /dev/null && python3 -m http.server --help &> /dev/null; then
        cd ui
        python3 -m http.server 8820 &
        FRONTEND_PID=$!
        cd ..
        log_success "前端服务已启动 (PID: $FRONTEND_PID)"
        log_info "前端服务地址: http://localhost:8820"
    else
        log_warning "未找到合适的静态文件服务器，跳过前端服务启动"
        log_info "请手动启动前端服务，或安装serve: npm install -g serve"
    fi
}

# 优雅关闭所有服务
shutdown() {
    log_info "正在关闭服务..."
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null && log_info "前端服务已关闭" || log_info "前端服务已关闭"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null && log_info "后端服务已关闭" || log_info "后端服务已关闭"
    fi
    
    exit 0
}

# 注册信号处理函数
trap shutdown SIGTERM SIGINT

# 加载环境变量
load_env() {
    if [ -f ".env" ]; then
        # 只加载有效的环境变量（忽略注释和空行）
        while IFS= read -r line || [[ -n "$line" ]]; do
            # 跳过注释和空行
            if [[ -n "$line" && ! "$line" =~ ^[[:space:]*#] ]]; then
                # 分割键值对并正确导出
                key=$(echo "$line" | cut -d'=' -f1)
                value=$(echo "$line" | cut -d'=' -f2-)
                export "$key=$value"
            fi
        done < ".env"
        log_info "环境变量加载完成"
    else
        log_warning ".env文件不存在，使用默认配置"
    fi
}

# 主函数
main() {
    log_info "启动ZYWeb应用程序..."
    
    # 保存命令行设置的环境变量
    local cmd_deployment_mode="$DEPLOYMENT_MODE"
    local cmd_port="$PORT"
    
    # 加载环境变量
    load_env
    
    # 如果命令行设置了环境变量，则优先使用命令行设置的值
    if [ -n "$cmd_deployment_mode" ]; then
        DEPLOYMENT_MODE="$cmd_deployment_mode"
    fi
    
    if [ -n "$cmd_port" ]; then
        PORT="$cmd_port"
    fi
    
    # 检查依赖是否已安装且完整，如果未安装则安装依赖
    if ! check_dependencies; then
        install_dependencies
    fi
    
    # 检查部署模式
    if [ "$DEPLOYMENT_MODE" = "standalone" ]; then
        log_info "部署模式: 一体化部署"
        # 启动后端服务
        start_backend
    elif [ "$DEPLOYMENT_MODE" = "separate" ]; then
        log_info "部署模式: 前后端分离部署"
        # 启动后端服务
        start_backend
        
        # 等待后端服务启动完成
        sleep 3
        
        # 启动前端服务
        start_frontend
    else
        log_warning "未知的部署模式: $DEPLOYMENT_MODE，默认使用一体化部署"
        # 启动后端服务
        start_backend
    fi
    
    log_info "应用程序启动完成"
    log_info "服务地址: http://localhost:$PORT"
    if [ "$DEPLOYMENT_MODE" = "separate" ]; then
        log_info "前端服务地址: http://localhost:8820"
    fi
    
    # 等待服务进程
    wait
}

# 执行主函数
main "$@"
EOF
    
    # 给启动脚本添加执行权限
    chmod +x "$APP_DIR/start.sh"
    
    log_success "启动脚本创建完成"
}

# 创建README文件
create_readme() {
    log_info "创建README文件..."
    
    cat > "$APP_DIR/README.txt" << 'EOF'
ZYWeb应用程序部署说明
=====================

目录结构:
- server/: 后端服务文件
- ui/: 前端UI文件
  - js/: JavaScript文件
  - css/: CSS样式文件
  - images/: 图片资源文件
- .env: 环境变量配置文件
- start.sh: 启动脚本

部署步骤:
1. 确保系统已安装Node.js和Yarn
2. 运行 ./start.sh 启动应用程序
3. 访问 http://localhost:8819 查看应用程序

环境变量配置:
- DEPLOYMENT_MODE: 部署模式 (standalone/separate)
- DB_TYPE: 数据库类型 (pglite/pg/mysql)
- PORT: 服务端口

默认配置:
- 部署模式: 一体化部署
- 数据库: PGLite
- 端口: 8819
EOF
    
    log_success "README文件创建完成"
}

# 清理中间产物
cleanup_intermediate_artifacts() {
    log_info "清理中间产物..."
    
    # 删除dist目录中的ui和server目录，但保留zyweb目录
    if [ -d "$UI_DIR" ]; then
        rm -rf "$UI_DIR"
        log_info "已删除UI中间产物目录: $UI_DIR"
    fi
    
    if [ -d "$SERVER_DIR" ]; then
        rm -rf "$SERVER_DIR"
        log_info "已删除Server中间产物目录: $SERVER_DIR"
    fi
    
    log_success "中间产物清理完成"
}

# 验证集成结果
verify_integration() {
    log_info "验证集成结果..."
    
    # 检查目标目录是否存在
    if [ ! -d "$APP_DIR" ]; then
        log_error "应用目录不存在: $APP_DIR"
        return 1
    fi
    
    # 检查关键文件
    local required_files=(
        "$APP_DIR/server/index.js"
        "$APP_DIR/server/.env"
        "$APP_DIR/ui/index.html"
        "$APP_DIR/start.sh"
        "$APP_DIR/README.txt"
    )
    
    local missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    # 检查UI目录中是否有JS和CSS文件
    if [ ! -d "$APP_DIR/ui/js/" ] || [ -z "$(ls -A "$APP_DIR/ui/js/" 2>/dev/null)" ]; then
        missing_files+=("$APP_DIR/ui/js/ (空目录或不存在)")
    fi
    
    if [ ! -d "$APP_DIR/ui/css/" ] || [ -z "$(ls -A "$APP_DIR/ui/css/" 2>/dev/null)" ]; then
        missing_files+=("$APP_DIR/ui/css/ (空目录或不存在)")
    fi
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "所有必需文件都存在"
    else
        log_error "以下文件缺失:"
        for file in "${missing_files[@]}"; do
            log_error "  - $file"
        done
        return 1
    fi
    
    # 验证入口文件中的关键元素
    if grep -q '<div id="app"></div>' "$APP_DIR/ui/index.html"; then
        log_info "挂载点验证通过"
    else
        log_error "挂载点验证失败：未找到 app 元素"
        return 1
    fi
    
    # 验证启动脚本权限
    if [ -x "$APP_DIR/start.sh" ]; then
        log_info "启动脚本权限验证通过"
    else
        log_warning "启动脚本权限验证失败：脚本可能无法执行"
    fi
    
    log_success "集成结果验证完成"
}

# 主函数
main() {
    log_info "开始前后端集成流程"
    
    # 创建集成目录
    create_app_directory
    
    # 复制后端服务
    copy_backend
    
    # 复制前端UI
    copy_frontend
    
    # 创建环境变量文件
    create_env_file
    
    # 创建启动脚本
    create_startup_script
    
    # 创建README文件
    create_readme
    
    # 验证集成结果
    verify_integration
    
    # 清理中间产物
    cleanup_intermediate_artifacts
    
    log_success "前后端集成完成!"
    log_info "集成应用程序位于: $APP_DIR"
}

# 执行主函数
main "$@"