#!/bin/bash
# Analyze页面构建脚本

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

# 获取推荐内存限制（基于清理后的最大可用内存）
get_recommended_memory_limit() {
    local component_name=$1
    
    # 检查是否存在推荐内存方案
    local recommendation_file="./build/recommendations/${component_name}_recommendation.txt"
    if [ -f "$recommendation_file" ]; then
        # 读取推荐的Node.js内存限制
        local recommended_node_memory=$(grep "推荐Node.js内存限制" "$recommendation_file" | awk '{print $NF}' | sed 's/MB//')
        if [ -n "$recommended_node_memory" ] && [ "$recommended_node_memory" -ge 50 ] && [ "$recommended_node_memory" -le 2000 ]; then
            # 检查主机性能是否匹配
            local host_performance=$(nproc)c_$(free -m | awk '/^Mem:/{print $2}')m
            local file_host_performance=$(grep "构建主机性能" "$recommendation_file" | awk '{print $NF}')
            
            if [ "$host_performance" = "$file_host_performance" ]; then
                log_info "已找到匹配的推荐内存方案: ${recommended_node_memory}MB"
                echo $recommended_node_memory
                return
            else
                log_info "主机性能差异较大，将重新生成推荐内存方案"
            fi
        else
            log_info "推荐内存方案无效，将重新生成推荐内存方案"
        fi
    fi
    
    # 如果没有找到推荐方案或主机性能差异较大，使用动态计算的内存限制
    # 动态计算内存限制（基于清理后的最大可用内存）
    local available_memory=$(get_available_memory)
    
    # 计算真实可用内存：
    # - iflow和监控进程合用至少300M
    # - 系统保留50M
    # - 剩下的才是真实的可用内存
    local real_available_memory=$((available_memory - 300 - 50))
    
    # 确保真实可用内存不低于0
    if [ $real_available_memory -lt 0 ]; then
        real_available_memory=0
    fi
    
    # 在真实可用内存基础上分配80%给Node.js进程
    local memory_limit=$((real_available_memory * 8 / 10))
    
    # 设置下限为250MB（确保有足够的内存进行构建）
    if [ $memory_limit -lt 250 ]; then
        memory_limit=250
    fi
    
    # 设置上限为1100MB（避免过度分配）
    if [ $memory_limit -gt 1100 ]; then
        memory_limit=1100
    fi
    
    echo $memory_limit
}

# 设置Node.js内存限制（纯动态方案）
set_node_memory_limit() {
    local component_name=$1
    
    # 获取推荐内存限制（基于清理后的最大可用内存）
    local memory_limit_mb=$(get_recommended_memory_limit "${component_name}")
    
    # 设置Node.js内存限制
    export NODE_OPTIONS="--max-old-space-size=${memory_limit_mb} --no-warnings --no-experimental-fetch"
    log_info "已设置Node.js内存限制: ${memory_limit_mb}MB (基于清理后的最大可用内存动态计算)"
}

# 生成推荐内存方案
generate_memory_recommendation() {
    local component_type=$1
    local available_memory=$2
    local memory_limit=$3
    local build_duration=$4
    
    # 确保推荐目录存在
    mkdir -p "./build/recommendations"
    
    # 生成推荐内存方案
    local recommendation_file="./build/recommendations/${component_type}_recommendation.txt"
    local recommended_system_memory=$((available_memory * 6 / 10))  # 推荐系统可用内存为构建时的60%
    local recommended_node_memory=$((memory_limit * 6 / 10))  # 推荐Node.js内存限制为分配内存的60%
    
    # 确保推荐值不低于最小值
    if [ $recommended_system_memory -lt 200 ]; then
        recommended_system_memory=200
    fi
    
    if [ $recommended_node_memory -lt 100 ]; then
        recommended_node_memory=100
    fi
    
    cat > "$recommendation_file" << EOF
# ${component_type} 组件构建推荐内存方案

## 构建环境信息
- 构建时间: $(date)
- 构建耗时: ${build_duration}秒
- 构建时系统可用内存: ${available_memory}MB
- 分配给node进程的内存: ${memory_limit}MB

## 推荐内存配置
- 推荐系统可用内存: ${recommended_system_memory}MB
- 推荐Node.js内存限制: ${recommended_node_memory}MB

## 使用建议
在相似环境下构建时，可以使用以下命令来加快构建速度：
\`\`\`
export NODE_OPTIONS="--max-old-space-size=${recommended_node_memory}"
# 然后执行相应的构建命令
\`\`\`

## 注意事项
1. 如果系统可用内存低于${recommended_system_memory}MB，建议增加系统内存或使用更小的组件进行构建
2. 如果构建过程中出现内存不足错误，可以适当降低Node.js内存限制
3. 推荐定期更新此推荐方案，以适应项目规模的变化
EOF

    log_info "已生成 ${component_type} 组件构建推荐内存方案: ${recommendation_file}"
}

# 通用构建函数
build_component() {
    local component_name=$1
    local config_file=$2
    
    log_info "开始构建 ${component_name}..."
    
    # 在构建前先执行一次清理
    log_info "构建前执行内存清理..."
    ./build/scripts/build-cleanup.sh
    
    # 获取组件的推荐内存限制（基于清理后的最大可用内存）
    local memory_limit=$(get_recommended_memory_limit "${component_name}")
    log_info "当前可用内存: $(get_available_memory)MB"
    log_info "计算得出的内存限制: ${memory_limit}MB"
    
    # 设置Node.js内存限制
    set_node_memory_limit "${component_name}"
    
    # 记录构建开始时间
    local start_time=$(date +%s)
    
    # 构建组件
    log_info "执行 ${component_name} 构建..."
    node --no-warnings --no-compilation-cache ./node_modules/vite/bin/vite.js build --config "${config_file}" --minify false --mode development --ssrManifest false
    
    local exit_code=$?
    local end_time=$(date +%s)
    local build_duration=$((end_time - start_time))
    
    # 记录构建内存使用情况
    local available_memory=$(get_available_memory)
    
    if [ $exit_code -eq 0 ]; then
        log_success "${component_name} 构建成功!"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 生成推荐内存构建方案
        generate_memory_recommendation "${component_name}" $available_memory $memory_limit $build_duration
        
        # 构建完成后执行内存清理
        log_info "构建完成后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return 0
    else
        log_error "错误: ${component_name} 构建失败 (退出码: $exit_code)"
        log_info "构建耗时: ${build_duration}秒"
        log_info "构建时可用内存: ${available_memory}MB"
        log_info "分配给node进程的内存: ${memory_limit}MB"
        
        # 构建失败后也执行内存清理
        log_info "构建失败后执行内存清理..."
        ./build/scripts/build-cleanup.sh
        return $exit_code
    fi
}

# 执行构建
build_component "analyze" "build/configs/vite/vite.analyze.config.ts"