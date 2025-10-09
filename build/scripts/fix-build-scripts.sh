#!/bin/bash

# 修复所有构建脚本中的内存分配逻辑

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 要修复的构建脚本列表
BUILD_SCRIPTS=(
  "build-analyze.sh"
  "build-chase.sh"
  "build-drive.sh"
  "build-film.sh"
  "build-iptv.sh"
  "build-lab.sh"
  "build-play.sh"
  "build-setting.sh"
  "build-shared-components.sh"
)

# 旧的内存分配代码
OLD_CODE="    # 动态计算内存限制
    local memory_limit=1200
    log_info \"系统可用内存: \$(get_available_memory)MB\"
    log_info \"给iflow分配: 300MB\"
    log_info \"给新的node进程分配: \${memory_limit}MB (默认值)\""

# 新的内存分配代码
NEW_CODE="    # 动态计算内存限制
    local available_memory=\$(get_available_memory)
    local iflow_memory=300
    local remaining_memory=\$((available_memory - iflow_memory))
    
    # 确保剩余内存至少有50MB
    if [ \$remaining_memory -lt 50 ]; then
        remaining_memory=50
    fi
    
    # 给系统留50MB，然后分配80%给Node.js进程
    local reserved_memory=50
    local memory_limit=\$((remaining_memory * 8 / 10 - reserved_memory))
    
    # 设置上限为800MB，下限为50MB
    if [ \$memory_limit -gt 800 ]; then
        memory_limit=800
    fi
    
    if [ \$memory_limit -lt 50 ]; then
        memory_limit=50
    fi
    
    log_info \"系统可用内存: \${available_memory}MB\"
    log_info \"给iflow分配: \${iflow_memory}MB\"
    log_info \"给新的node进程分配: \${memory_limit}MB\""

# 遍历所有构建脚本并更新
for script in "${BUILD_SCRIPTS[@]}"; do
  SCRIPT_PATH="$SCRIPT_DIR/$script"
  if [ -f "$SCRIPT_PATH" ]; then
    echo "正在修复 $script..."
    
    # 使用sed替换旧代码为新代码
    # 首先转义特殊字符
    ESCAPED_OLD=$(echo "$OLD_CODE" | sed 's/[/&]/\\&/g')
    ESCAPED_NEW=$(echo "$NEW_CODE" | sed 's/[&/\]/\\&/g')
    
    # 执行替换
    sed -i "s/$ESCAPED_OLD/$ESCAPED_NEW/g" "$SCRIPT_PATH"
    
    echo "$script 修复完成"
  else
    echo "警告: $SCRIPT_PATH 不存在"
  fi
done

echo "所有构建脚本修复完成"