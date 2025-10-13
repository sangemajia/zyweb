#!/bin/bash

# HTML处理脚本
# 更新index.html中的资源引用

# 更新index.html引用
update_index_html() {
    local ui_dir="$1"
    local js_dir="$2"
    local css_dir="$3"
    
    local index_file="$ui_dir/index.html"
    if [ ! -f "$index_file" ]; then
        return 1
    fi
    
    # 获取前端路径前缀（如果设置）
    local frontend_path_prefix="${FRONTEND_PATH_PREFIX:-}"
    
    # 根据前端路径前缀设置资源路径
    local js_path_prefix="${frontend_path_prefix}/js"
    local css_path_prefix="${frontend_path_prefix}/css"
    
    # 如果没有设置前缀，则使用默认路径
    if [ -z "$frontend_path_prefix" ]; then
        js_path_prefix="/js"
        css_path_prefix="/css"
    fi
    
    # 一体化部署模式下不使用CDN，但需要添加本地Vue依赖
    # 移除可能已存在的CDN引用
    sed -i '/cdn.jsdelivr.net/d' "$index_file"
    
    # 添加本地Vue依赖引用（按正确顺序）
    # 首先添加Vue
    if ! grep -q "${js_path_prefix}/vue.js" "$index_file"; then
        sed -i '/<head>/a\    <script src="'"${js_path_prefix}"'/vue.js"><\/script>' "$index_file"
    fi
    
    # 然后添加Vue Router（在Vue之后）
    if ! grep -q "${js_path_prefix}/vue-router.js" "$index_file"; then
        sed -i '/vue.js/a\    <script src="'"${js_path_prefix}"'/vue-router.js"><\/script>' "$index_file"
    fi
    
    # 然后添加Pinia（在Vue Router之后）
    if ! grep -q "${js_path_prefix}/pinia.js" "$index_file"; then
        sed -i '/vue-router.js/a\    <script src="'"${js_path_prefix}"'/pinia.js"><\/script>' "$index_file"
    fi
    
    # 然后添加TDesign Vue Next（在Pinia之后）
    if ! grep -q "${js_path_prefix}/tdesign.js" "$index_file"; then
        sed -i '/pinia.js/a\    <script src="'"${js_path_prefix}"'/tdesign.js"><\/script>' "$index_file"
    fi
    
    # 最后添加Axios（在TDesign Vue Next之后）
    if ! grep -q "${js_path_prefix}/axios.js" "$index_file"; then
        sed -i '/tdesign.js/a\    <script src="'"${js_path_prefix}"'/axios.js"><\/script>' "$index_file"
    fi
    
    # 更新CSS引用 - 添加共享组件的CSS链接
    if ! grep -q "<link rel=\"stylesheet\" href=\"${css_path_prefix}/shared.css\">" "$index_file"; then
        sed -i '/<head>/a\
    <link rel=\"stylesheet\" href=\"'"${css_path_prefix}"'/shared.css\">' "$index_file"
    fi
    
    # 更新JS引用 - 使用主入口文件
    sed -i "s|<script type=\"module\" src=\"/src/renderer/src/main.ts\"></script>|<script type=\"module\" src=\"${js_path_prefix}/main.js\"></script>|" "$index_file"
    
    # 如果没有找到原有的引用，则添加新的JS引用
    if ! grep -q "<script type=\"module\" src=\"${js_path_prefix}/main.js\"></script>" "$index_file"; then
        sed -i "s|<div id=\"home-container\"></div>|<div id=\"home-container\"></div>\n    <script type=\"module\" src=\"${js_path_prefix}/main.js\"></script>|" "$index_file"
    fi
    
    # 确保挂载点是<div id="app"></div>
    sed -i 's|<div id="home-container"></div>|<div id="app"></div>|' "$index_file"
    
    return 0
}