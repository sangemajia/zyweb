#!/bin/bash
# 分步构建脚本
# 将所有Vite配置文件分组，逐步构建以减少内存使用

echo "开始分步构建所有模块..."

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 确保在项目根目录
cd "$PROJECT_DIR"

# 清理之前的构建结果
echo "清理之前的构建结果..."
rm -rf dist/client/step-build
mkdir -p dist/client/step-build

# 定义构建步骤和对应的配置文件组
# 每组包含5-6个配置文件，避免内存占用过高

# 第一组配置文件
step1_configs=(
    "vite-configs-fine/vite.code-editor.config.ts:code-editor"
    "vite-configs-fine/vite.markdown-render.config.ts:markdown-render"
    "vite-configs-fine/vite.share-popup.config.ts:share-popup"
    "vite-configs-fine/vite.shortcut-input.config.ts:shortcut-input"
    "vite-configs-fine/vite.split.config.ts:split"
)

# 第二组配置文件
step2_configs=(
    "vite-configs-fine/vite.tag-nav.config.ts:tag-nav"
    "vite-configs-fine/vite.terminal.config.ts:terminal"
    "vite-configs-fine/vite.SharedButton.config.ts:SharedButton"
    "vite-configs-fine/vite.SharedCard.config.ts:SharedCard"
    "vite-configs-fine/vite.ai-brain.config.ts:ai-brain"
    "vite-configs-fine/vite.binge.config.ts:binge"
)

# 第三组配置文件
step3_configs=(
    "vite-configs-fine/vite.common-nav.config.ts:common-nav"
    "vite-configs-fine/vite.detail.config.ts:detail"
    "vite-configs-fine/vite.dialog-data.config.ts:dialog-data"
    "vite-configs-fine/vite.history.config.ts:history"
    "vite-configs-fine/vite.player.config.ts:player"
)

# 第四组配置文件
step4_configs=(
    "vite-configs-fine/vite.plugin-center.config.ts:plugin-center"
    "vite-configs-fine/vite.title-menu.config.ts:title-menu"
    "vite.analyze.config.ts:analyze"
    "vite.aside-analyze.config.ts:aside-analyze"
    "vite.aside-drive.config.ts:aside-drive"
    "vite.aside-film.config.ts:aside-film"
)

# 第五组配置文件
step5_configs=(
    "vite.aside-iptv.config.ts:aside-iptv"
    "vite.chase.config.ts:chase"
    "vite.consistent-ui.config.ts:consistent-ui"
    "vite.data-crypto.config.ts:data-crypto"
    "vite.dialog-search.config.ts:dialog-search"
)

# 第六组配置文件
step6_configs=(
    "vite.drive.config.ts:drive"
    "vite.film.config.ts:film"
    "vite.iptv.config.ts:iptv"
    "vite.lab.config.ts:lab"
    "vite.play.config.ts:play"
    "vite.setting.config.ts:setting"
)

# 第七组配置文件
step7_configs=(
    "vite.test.config.ts:test"
    "vite.web-app.config.ts:web-app"
)

# 构建步骤数组
build_steps=(
    "step1"
    "step2"
    "step3"
    "step4"
    "step5"
    "step6"
    "step7"
)

success_steps=0
total_steps=${#build_steps[@]}

# 逐个执行构建步骤
for step_name in "${build_steps[@]}"; do
    echo "=================================================="
    echo "开始执行构建步骤: $step_name"
    
    # 获取当前步骤的配置文件数组
    configs_var="${step_name}_configs[@]"
    configs=("${!configs_var}")
    
    success_count=0
    total_count=${#configs[@]}
    
    # 逐个构建当前步骤中的配置文件
    for config_info in "${configs[@]}"; do
        config_file=$(echo "$config_info" | cut -d':' -f1)
        component_name=$(echo "$config_info" | cut -d':' -f2)
        
        echo "--------------------------------------------------"
        echo "构建组件: $component_name"
        
        # 检查配置文件是否存在
        if [ ! -f "$config_file" ]; then
            echo "警告: 配置文件 $config_file 不存在，跳过 $component_name 组件"
            continue
        fi
        
        # 使用动态内存限制构建组件
        # 为iflow等关键进程保留资源，降低构建进程优先级
        nice -n 19 "$SCRIPT_DIR/dynamic-memory-build.sh" "$config_file" "$component_name"
        
        if [ $? -eq 0 ]; then
            echo "$component_name 组件构建成功!"
            ((success_count++))
        else
            echo "错误: $component_name 组件构建失败"
        fi
        
        echo ""
    done
    
    echo "步骤 $step_name 构建完成摘要:"
    echo "  总组件数: $total_count"
    echo "  成功构建: $success_count"
    echo "  失败构建: $((total_count - success_count))"
    
    if [ $success_count -eq $total_count ]; then
        echo "步骤 $step_name 所有组件构建成功!"
        ((success_steps++))
    else
        echo "步骤 $step_name 部分组件构建失败。"
    fi
    
    echo ""
done

echo "=================================================="
echo "所有构建步骤完成摘要:"
echo "  总步骤数: $total_steps"
echo "  成功步骤: $success_steps"
echo "  失败步骤: $((total_steps - success_steps))"

if [ $success_steps -eq $total_steps ]; then
    echo "所有步骤构建成功!"
    exit 0
else
    echo "部分步骤构建失败。"
    exit 1
fi