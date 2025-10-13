#!/bin/bash

# 入口文件处理脚本
# 复制和处理入口文件(index.html)

# 复制入口文件
copy_entry_file() {
    local project_root="$1"
    local ui_dir="$2"
    
    local source_index="$project_root/src/renderer/src/index.html"
    if [ -f "$source_index" ]; then
        cp "$source_index" "$ui_dir/"
        
        # 检查并更新挂载点
        if grep -q '<div id="app"></div>' "$ui_dir/index.html"; then
            sed -i 's|<div id="app"></div>|<div id="home-container"></div>|g' "$ui_dir/index.html"
        elif grep -q '<div id="home-container"></div>' "$ui_dir/index.html"; then
            # 挂载点已经是 home-container，无需更改
            true
        else
            # 未找到预期的挂载点元素
            return 1
        fi
    else
        return 1
    fi
    
    return 0
}