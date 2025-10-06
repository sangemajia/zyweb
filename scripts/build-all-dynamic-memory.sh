#!/bin/bash
# 使用动态内存限制构建所有组件的脚本

echo "开始使用动态内存限制构建所有组件..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 确保在项目根目录
cd "$PROJECT_DIR"

# 构建组件列表
components=(
    "vite-configs-fine/vite.code-editor.config.ts:code-editor"
    "vite-configs-fine/vite.markdown-render.config.ts:markdown-render"
    "vite-configs-fine/vite.share-popup.config.ts:share-popup"
    "vite-configs-fine/vite.shortcut-input.config.ts:shortcut-input"
    "vite-configs-fine/vite.split.config.ts:split"
    "vite-configs-fine/vite.tag-nav.config.ts:tag-nav"
    "vite-configs-fine/vite.terminal.config.ts:terminal"
    "vite-configs-fine/vite.SharedButton.config.ts:SharedButton"
    "vite-configs-fine/vite.SharedCard.config.ts:SharedCard"
)

# 确保动态内存构建脚本有执行权限
chmod +x "$SCRIPT_DIR/dynamic-memory-build.sh"

success_count=0
total_count=${#components[@]}

# 逐个构建组件
for component_info in "${components[@]}"; do
    config_file=$(echo "$component_info" | cut -d':' -f1)
    component_name=$(echo "$component_info" | cut -d':' -f2)
    
    echo "=================================================="
    
    # 检查配置文件是否存在
    if [ ! -f "$config_file" ]; then
        echo "警告: 配置文件 $config_file 不存在，跳过 $component_name 组件"
        continue
    fi
    
    # 使用动态内存限制构建组件
    "$SCRIPT_DIR/dynamic-memory-build.sh" "$config_file" "$component_name"
    
    if [ $? -eq 0 ]; then
        ((success_count++))
    fi
    
    echo ""
done

echo "=================================================="
echo "构建完成摘要:"
echo "  总组件数: $total_count"
echo "  成功构建: $success_count"
echo "  失败构建: $((total_count - success_count))"

if [ $success_count -eq $total_count ]; then
    echo "所有组件构建成功!"
    exit 0
else
    echo "部分组件构建失败。"
    exit 1
fi