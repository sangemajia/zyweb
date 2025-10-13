#!/bin/bash

# 目录管理脚本
# 提供目录创建和管理功能

# 获取脚本所在目录和项目根目录
get_directories() {
    local script_dir=$(cd ./build/scripts && pwd)
    local project_root=$(pwd)
    echo "$script_dir,$project_root"
}

# 创建目标目录
create_directories() {
    local project_root="$1"
    
    # 定义目录路径
    local dist_dir="$project_root/dist"
    local zyweb_dist_dir="$dist_dir/zyweb"
    local ui_dir="$dist_dir/ui"
    local js_dir="$ui_dir/js"
    local css_dir="$ui_dir/css"
    local images_dir="$ui_dir/images"
    local ad_images_dir="$ui_dir/images/ad"
    local layouts_dir="$js_dir/layouts"
    
    # 创建目标目录
    mkdir -p "$js_dir" "$css_dir" "$images_dir" "$ad_images_dir" "$layouts_dir"
    
    # 输出目录路径供其他脚本使用
    echo "$dist_dir,$zyweb_dist_dir,$ui_dir,$js_dir,$css_dir,$images_dir,$ad_images_dir,$layouts_dir"
}