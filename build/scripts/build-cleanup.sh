#!/bin/bash
# 资源清理脚本，用于构建前和构建后清理资源

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

# 获取可用内存（MB）
get_available_memory() {
    free -m | awk '/^Mem:/{print $7}'
}

# 清理构建相关进程
cleanup_build_processes() {
    log_info "清理构建相关进程..."
    
    # 显示清理前的进程信息
    log_info "清理前的相关进程:"
    ps aux | grep -v grep | grep -E "(node|vite|rollup|python.*http|webkit)" || log_info "未找到相关进程"
    
    # 清理可能存在的Vite进程
    pkill -f "vite" >/dev/null 2>&1 || true
    
    # 清理可能存在的Node.js构建进程
    pkill -f "node.*build" >/dev/null 2>&1 || true
    
    # 清理可能存在的Rollup进程
    pkill -f "rollup" >/dev/null 2>&1 || true
    
    # 清理可能存在的Vite dev server进程
    pkill -f "vite.*dev" >/dev/null 2>&1 || true
    
    # 清理可能存在的Node.js进程（更广泛的匹配）
    pkill -f "node.*vite" >/dev/null 2>&1 || true
    
    # 清理可能存在的Node.js模块进程
    pkill -f "node.*module" >/dev/null 2>&1 || true
    
    # 清理可能存在的Python HTTP服务器进程
    pkill -f "python.*http.server" >/dev/null 2>&1 || true
    
    # 清理可能存在的webkit相关进程
    pkill -f "webkit" >/dev/null 2>&1 || true
    
    # 强制杀死所有Node.js进程（除了当前脚本进程和构建相关进程）
    # 注意：这里排除了当前脚本的进程ID，避免杀死自己
    local current_pid=$
    # 排除构建相关进程，避免中断构建流程
    pkill -f "node" | grep -v $current_pid | grep -v "simple-build.sh" | grep -v "assemble-ui.sh" | grep -v "integrate-app.sh" >/dev/null 2>&1 || true
    
    # 等待进程完全终止
    sleep 3
    
    # 再次检查并强制杀死可能残留的HTTP服务器进程
    kill_http_server
    
    # 显示清理后的进程信息
    log_info "清理后的相关进程:"
    ps aux | grep -v grep | grep -E "(node|vite|rollup|python.*http|webkit)" || log_info "未找到相关进程"
}

# 杀死HTTP服务器进程
kill_http_server() {
    log_info "检查并杀死HTTP服务器进程..."
    
    # 查找并杀死在8819端口运行的进程
    local http_pids=$(lsof -i :8819 -t 2>/dev/null)
    if [ ! -z "$http_pids" ]; then
        log_info "发现HTTP服务器进程 PID: $http_pids"
        kill $http_pids >/dev/null 2>&1 || true
        sleep 2
        
        # 强制杀死如果仍然存在
        kill -9 $http_pids >/dev/null 2>&1 || true
        log_info "已发送终止信号给HTTP服务器进程"
    else
        log_info "未发现8819端口的HTTP服务器进程"
    fi
    
    # 额外检查Python HTTP服务器进程
    local python_http_pids=$(ps aux | grep "python.*http.server" | grep -v grep | awk '{print $2}')
    if [ ! -z "$python_http_pids" ]; then
        log_info "发现Python HTTP服务器进程 PID: $python_http_pids"
        kill $python_http_pids >/dev/null 2>&1 || true
        sleep 2
        
        # 强制杀死如果仍然存在
        kill -9 $python_http_pids >/dev/null 2>&1 || true
        log_info "已发送终止信号给Python HTTP服务器进程"
    fi
}

# 清理Node.js缓存
cleanup_node_cache() {
    log_info "清理Node.js缓存..."
    
    # 清理npm缓存
    if command -v npm >/dev/null 2>&1; then
        npm cache verify >/dev/null 2>&1 && log_info "npm缓存已验证" || log_warning "npm缓存验证失败"
    else
        log_warning "未找到npm命令"
    fi
    
    # 清理yarn缓存
    if command -v yarn >/dev/null 2>&1; then
        yarn cache clean >/dev/null 2>&1 && log_info "yarn缓存已清理" || log_warning "yarn缓存清理失败"
    else
        log_warning "未找到yarn命令"
    fi
    
    # 清理可能存在的.vite目录
    if [ -d "node_modules/.vite" ]; then
        rm -rf node_modules/.vite
        log_info "已清理node_modules/.vite目录"
    fi
    
    # 清理可能存在的.rollup目录
    if [ -d "node_modules/.rollup" ]; then
        rm -rf node_modules/.rollup
        log_info "已清理node_modules/.rollup目录"
    fi
    
    # 清理可能存在的.vite-temp目录
    if [ -d ".vite-temp" ]; then
        rm -rf .vite-temp
        log_info "已清理.vite-temp目录"
    fi
}

# 清理构建临时文件
cleanup_temp_files() {
    log_info "清理构建临时文件..."
    
    # 不再清理构建输出目录，避免删除已构建的组件
    # 仅清理临时文件和缓存
    
    # 清理可能存在的临时文件
    rm -rf .vite-temp >/dev/null 2>&1 || true
    rm -rf .rollup-temp >/dev/null 2>&1 || true
    rm -rf .build-temp >/dev/null 2>&1 || true
    
    # 清理可能存在的Node.js临时文件
    rm -rf /tmp/vite-* >/dev/null 2>&1 || true
    rm -rf /tmp/rollup-* >/dev/null 2>&1 || true
    
    log_info "已清理临时文件和缓存"
}

# 强制垃圾回收（如果支持）
force_garbage_collection() {
    log_info "尝试强制垃圾回收..."
    
    # 如果系统支持，尝试强制垃圾回收
    if command -v sync >/dev/null 2>&1; then
        sync
        if command -v echo >/dev/null 2>&1; then
            # 尝试释放页面缓存、目录项缓存和索引节点缓存
            # 在容器环境中可能没有权限，所以忽略错误
            echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || log_info "在容器环境中无法执行drop_caches，跳过此步骤"
        fi
    fi
}

# 同步文件系统缓存
sync_filesystem_cache() {
    log_info "文件系统缓存已同步"
    sync
}

# 主清理函数
main_cleanup() {
    log_info "开始资源清理..."
    
    # 显示清理前的内存使用情况
    log_info "清理前:"
    log_info "内存使用情况:"
    free -h
    
    # 清理构建相关进程
    cleanup_build_processes
    
    # 等待一段时间确保进程完全终止
    sleep 5
    
    # 清理Node.js缓存
    cleanup_node_cache
    
    # 清理构建临时文件
    cleanup_temp_files
    
    # 强制垃圾回收
    force_garbage_collection
    
    # 同步文件系统缓存
    sync_filesystem_cache
    
    # 显示清理后的内存使用情况
    log_info "清理后:"
    log_info "内存使用情况:"
    free -h
    
    log_success "资源清理完成!"
}

# 执行主清理函数
main_cleanup