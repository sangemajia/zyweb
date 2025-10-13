#!/bin/bash

# 验证脚本
# 验证组装结果

# 验证组装结果
verify_assembly() {
    local ui_dir="$1"
    local js_dir="$2"
    local css_dir="$3"
    local images_dir="$4"
    
    # 检查目标目录是否存在
    if [ ! -d "$ui_dir" ]; then
        return 1
    fi
    
    local js_count=$(ls -1 "$js_dir" 2>/dev/null | wc -l)
    local css_count=$(ls -1 "$css_dir" 2>/dev/null | wc -l)
    local image_count=$(ls -1 "$images_dir" 2>/dev/null | wc -l)
    
    # 检查关键文件是否存在
    local required_files=(
        "$ui_dir/index.html"
        "$js_dir/home.js"
        "$js_dir/shared.js"
        "$css_dir/shared.css"
    )
    
    local missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -ne 0 ]; then
        return 1
    fi
    
    # 验证入口文件中的关键元素
    if ! grep -q '<div id="app"></div>' "$ui_dir/index.html"; then
        return 1
    fi
    
    return 0
}