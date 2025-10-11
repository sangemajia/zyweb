#!/bin/bash

# UI组装脚本
# 该脚本用于将所有构建产物整合成一个完整的前端UI

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

# 获取脚本所在目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

log_info "脚本目录: $SCRIPT_DIR"
log_info "项目根目录: $PROJECT_ROOT"

# 定义目录路径
DIST_DIR="$PROJECT_ROOT/dist"
ZYWEB_DIST_DIR="$DIST_DIR/zyweb"
UI_DIR="$DIST_DIR/ui"
JS_DIR="$UI_DIR/js"
CSS_DIR="$UI_DIR/css"
IMAGES_DIR="$UI_DIR/images"
AD_IMAGES_DIR="$UI_DIR/images/ad"
RESOURCES_DIR="$UI_DIR/resources"

# 创建目标目录
create_directories() {
    log_info "创建目标目录..."
    mkdir -p "$JS_DIR" "$CSS_DIR" "$IMAGES_DIR" "$AD_IMAGES_DIR" "$RESOURCES_DIR"
    log_success "目标目录创建完成"
}

# 复制入口文件
copy_entry_file() {
    log_info "复制入口文件..."
    if [ -f "$PROJECT_ROOT/src/renderer/src/index.html" ]; then
        cp "$PROJECT_ROOT/src/renderer/src/index.html" "$UI_DIR/"
        log_success "入口文件复制完成"
    else
        log_error "入口文件不存在: $PROJECT_ROOT/src/renderer/src/index.html"
        return 1
    fi
}

# 复制公共资源
copy_resources() {
    log_info "复制公共资源..."
    local project_resources_dir="$PROJECT_ROOT/resources"
    if [ -d "$project_resources_dir" ]; then
        cp -r "$project_resources_dir"/* "$RESOURCES_DIR/"
        log_success "公共资源复制完成"
    else
        log_info "项目公共资源目录不存在，跳过复制"
    fi
}

# 组装构建产物
assemble_build_artifacts() {
    log_info "开始组装构建产物..."
    
    # 记录开始时间
    local start_time=$(date +%s)
    
    # 创建用于跟踪已复制文件的临时目录
    local temp_dir="$UI_DIR/.temp"
    mkdir -p "$temp_dir/js" "$temp_dir/css" "$temp_dir/images"
    
    # 遍历所有模块目录
    for module_dir in "$ZYWEB_DIST_DIR"/*/; do
        if [ -d "$module_dir" ]; then
            local module_name=$(basename "$module_dir")
            log_info "处理模块: $module_name"
            
            # 遍历模块中的所有文件
            for file in "$module_dir"/*; do
                if [ -f "$file" ]; then
                    local filename=$(basename "$file")
                    local extension="${filename##*.}"
                    
                    # 移除哈希值，保留原始文件名
                    # 处理格式：moduleName-main-[hash].ext -> moduleName.js
                    # 处理格式：moduleName-style-[hash].ext -> style.css
                    # 处理格式：moduleName-vendor-[hash].ext -> vendor.js
                    # 处理格式：moduleName-app-[hash].ext -> app.js
                    # 处理格式：moduleName-[type]-[hash].ext -> moduleName-[type].ext
                    local clean_filename=$(echo "$filename" | sed -E 's/^([^-]+)-([^-]+)-[a-zA-Z0-9_]+\.(.*)$/\1-\2.\3/')
                    
                    # 处理剩余的哈希值模式
                    clean_filename=$(echo "$clean_filename" | sed -E 's/^([^-]+)-([^-]+)-[a-zA-Z0-9_]+\.(.*)$/\1-\2.\3/')
                    clean_filename=$(echo "$clean_filename" | sed -E 's/^([^-]+)-([^-]+)-[a-zA-Z0-9_]+\.(.*)$/\1-\2.\3/')
                    
                    # 特殊处理main文件，将其重命名为模块名
                    if [[ "$clean_filename" == *-main.* ]]; then
                        clean_filename=$(echo "$clean_filename" | sed -E 's/^(.*)-main\.(.*)$/\1.\2/')
                    fi
                    
                    # 特殊处理vendor文件
                    if [[ "$clean_filename" == *-vendor.* ]]; then
                        clean_filename=$(echo "$clean_filename" | sed -E 's/^(.*)-vendor\.(.*)$/\1-vendor.\2/')
                    fi
                    
                    # 特殊处理app文件
                    if [[ "$clean_filename" == *-app.* ]]; then
                        clean_filename=$(echo "$clean_filename" | sed -E 's/^(.*)-app\.(.*)$/\1-app.\2/')
                    fi
                    
                    # 特殊处理shared-components文件
                    if [[ "$filename" == shared-components-* ]]; then
                        if [[ "$filename" == *-es-* ]]; then
                            clean_filename="shared-components-es.js"
                        elif [[ "$filename" == *-umd-* ]]; then
                            clean_filename="shared-components-umd.js"
                        elif [[ "$filename" == *-css-* ]] || [[ "$filename" == *.css ]]; then
                            clean_filename="shared-components.css"
                        else
                            clean_filename="shared-components.js"
                        fi
                    fi
                    
                    # 特殊处理home-shared-components文件
                    if [[ "$filename" == home-shared-components-* ]]; then
                        clean_filename="home-shared-components.js"
                    fi
                    
                    # 处理其他带有哈希值的文件
                    if [[ "$clean_filename" == *-*.js ]] && [[ "$clean_filename" != *-vendor.js ]] && [[ "$clean_filename" != *-app.js ]] && [[ "$clean_filename" != *-main.js ]]; then
                        # 移除最后的哈希值部分
                        clean_filename=$(echo "$clean_filename" | sed -E 's/-[a-zA-Z0-9_]+\.js$/.js/')
                    fi
                    
                    # 特别处理类似iptv-main-BYzTkU3-.js的文件
                    if [[ "$filename" == *-main-* ]]; then
                        # 提取模块名并重命名为moduleName.js
                        clean_filename=$(echo "$filename" | sed -E 's/^([^-]+)-main-.*\.(.*)$/\1.\2/')
                    fi
                    
                    # 如果没有匹配到哈希模式，则保持原文件名
                    if [ "$clean_filename" = "$filename" ]; then
                        clean_filename="$filename"
                    fi
                    
                    # 根据文件扩展名分类处理
                    case "$extension" in
                        js)
                            copy_js_file "$file" "$clean_filename"
                            ;;
                        css)
                            copy_css_file "$file" "$clean_filename"
                            ;;
                        png|jpg|jpeg|gif|webp|svg)
                            copy_image_file "$file" "$clean_filename"
                            ;;
                        *)
                            log_info "跳过未知类型文件: $filename"
                            ;;
                    esac
                fi
            done
        fi
    done
    
    # 清理临时目录
    rm -rf "$temp_dir"
    
    # 记录结束时间
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_success "构建产物组装完成，耗时: ${duration}秒"
}

# 复制JavaScript文件
copy_js_file() {
    local source_file="$1"
    local filename="$2"
    local temp_dir="$UI_DIR/.temp/js"
    
    # 检查是否已存在同名文件
    if [ -f "$temp_dir/$filename" ]; then
        log_info "跳过重复的JS文件: $filename"
        return
    fi
    
    # 特殊处理仍然带有哈希值的文件
    local final_filename="$filename"
    if [[ "$final_filename" == *-*.js ]] && [[ "$final_filename" != *-vendor.js ]] && [[ "$final_filename" != *-app.js ]] && [[ "$final_filename" != *-main.js ]] && [[ "$final_filename" != *-shared.js ]]; then
        # 移除最后的哈希值部分
        final_filename=$(echo "$final_filename" | sed -E 's/-[a-zA-Z0-9_]+\.js$/.js/')
    fi
    
    # 如果是主入口文件，特殊处理引用
    if [[ "$final_filename" == *-main.js ]] || [[ "$final_filename" == home.js ]]; then
        # 创建临时文件
        local temp_js_file="$UI_DIR/.temp/$(basename "$source_file")"
        cp "$source_file" "$temp_js_file"
        
        # 更新JavaScript文件中的引用
        # 处理共享组件引用
        sed -i 's|"\./[^"]*-shared-components-[a-zA-Z0-9_]\+\.js"|"\./home-shared-components.js"|g' "$temp_js_file"
        # 处理主文件引用
        sed -i 's|"\./[^"]*-main-[a-zA-Z0-9_]\+\.js"|"\./home-main.js"|g' "$temp_js_file"
        # 处理其他模块引用
        sed -i 's|"\./[^"]*-\([^"]*-[a-zA-Z0-9_]\+\.js\)"|"\./\1"|g' "$temp_js_file"
        # 移除Vue相关引用
        sed -i 's|import {[^}]*} from "vue";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "vue-router";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "pinia";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "tdesign-vue-next";||g' "$temp_js_file"
        
        # 在文件开头添加全局变量声明
        sed -i '1i\
// 使用全局变量替代模块导入\
const { defineComponent, ref, resolveComponent, createElementBlock, openBlock, createElementVNode, createCommentVNode, Fragment, renderList, createVNode, withCtx, normalizeStyle, createTextVNode, createBlock, unref, createApp } = Vue;\
const { useRouter } = VueRouter;\
const { defineStore, storeToRefs } = Pinia;\
' "$temp_js_file"
        
        # 复制处理后的文件
        cp "$temp_js_file" "$JS_DIR/$final_filename"
        
        # 清理临时文件
        rm -f "$temp_js_file"
    else
        # 对于其他JavaScript文件，移除Vue相关引用
        local temp_js_file="$UI_DIR/.temp/$(basename "$source_file")"
        cp "$source_file" "$temp_js_file"
        
        # 移除Vue相关引用
        sed -i 's|import {[^}]*} from "vue";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "vue-router";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "pinia";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "tdesign-vue-next";||g' "$temp_js_file"
        
        # 复制处理后的文件
        cp "$temp_js_file" "$JS_DIR/$final_filename"
        
        # 清理临时文件
        rm -f "$temp_js_file"
    fi
    
    # 记录已复制的文件名
    touch "$temp_dir/$final_filename"
    
    log_info "复制JS文件: $final_filename"
}

# 复制CSS文件
copy_css_file() {
    local source_file="$1"
    local filename="$2"
    local temp_dir="$UI_DIR/.temp/css"
    
    # 检查是否已存在同名文件
    if [ -f "$temp_dir/$filename" ]; then
        log_info "跳过重复的CSS文件: $filename"
        return
    fi
    
    # 特殊处理仍然带有哈希值的CSS文件
    local final_filename="$filename"
    if [[ "$final_filename" == *-*.css ]] && [[ "$final_filename" != *-style.css ]]; then
        # 移除最后的哈希值部分
        final_filename=$(echo "$final_filename" | sed -E 's/-[a-zA-Z0-9_]+\.css$/.css/')
    fi
    
    # 复制文件
    cp "$source_file" "$CSS_DIR/$final_filename"
    
    # 记录已复制的文件名
    touch "$temp_dir/$final_filename"
    
    log_info "复制CSS文件: $final_filename"
}

# 复制图片文件
copy_image_file() {
    local source_file="$1"
    local filename="$2"
    local temp_dir="$UI_DIR/.temp/images"
    
    # 检查是否已存在同名文件
    if [ -f "$temp_dir/$filename" ]; then
        log_info "跳过重复的图片文件: $filename"
        return
    fi
    
    # 特殊处理广告相关图片(raincloud和sp)
    if [[ "$filename" == *-raincloud.* ]] || [[ "$filename" == *-sp.* ]]; then
        # 移除模块名前缀，只保留类型名
        local final_filename=$(echo "$filename" | sed -E 's/^[^-]+-(raincloud|sp)(-[a-zA-Z0-9_]+)?\.(.*)$/\1.\3/')
        # 检查是否已存在同名文件
        if [ -f "$temp_dir/$final_filename" ]; then
            log_info "跳过重复的广告图片文件: $final_filename"
            return
        fi
        # 复制到ad目录
        cp "$source_file" "$AD_IMAGES_DIR/$final_filename"
        # 记录已复制的文件名
        touch "$temp_dir/$final_filename"
        log_info "复制广告图片文件到ad目录: $final_filename"
        return
    fi
    
    # 特殊处理播放器背景图片
    if [[ "$filename" == *-bg-player.* ]]; then
        # 移除模块名前缀，只保留bg-player
        local final_filename="bg-player.$(echo "$filename" | sed -E 's/.*\.(.*)$/\1/')"
        # 检查是否已存在同名文件
        if [ -f "$temp_dir/$final_filename" ]; then
            log_info "跳过重复的播放器背景图片文件: $final_filename"
            return
        fi
        # 复制到images目录
        cp "$source_file" "$IMAGES_DIR/$final_filename"
        # 记录已复制的文件名
        touch "$temp_dir/$final_filename"
        log_info "复制播放器背景图片文件: $final_filename"
        return
    fi
    
    # 特殊处理仍然带有哈希值的图片文件
    local final_filename="$filename"
    if [[ "$final_filename" == *-*.* ]] && [[ "$final_filename" != *-raincloud.* ]] && [[ "$final_filename" != *-sp.* ]] && [[ "$final_filename" != *-bg-player.* ]]; then
        # 移除最后的哈希值部分
        final_filename=$(echo "$final_filename" | sed -E 's/-[a-zA-Z0-9_]+\.(.*)$/.\1/')
    fi
    
    # 复制文件
    cp "$source_file" "$IMAGES_DIR/$final_filename"
    
    # 记录已复制的文件名
    touch "$temp_dir/$final_filename"
    
    log_info "复制图片文件: $final_filename"
}

# 更新index.html引用
update_index_html() {
    log_info "更新index.html中的资源引用..."
    
    local index_file="$UI_DIR/index.html"
    if [ ! -f "$index_file" ]; then
        log_error "index.html文件不存在: $index_file"
        return 1
    fi
    
    # 添加Vue和其他依赖的CDN引用
    if ! grep -q 'cdn.jsdelivr.net/npm/vue@' "$index_file"; then
        sed -i '/<head>/a\    <script src="https://cdn.jsdelivr.net/npm/vue@3.4.21/dist/vue.global.prod.js"></script>' "$index_file"
    fi
    
    if ! grep -q 'cdn.jsdelivr.net/npm/vue-router@' "$index_file"; then
        sed -i '/<head>/a\    <script src="https://cdn.jsdelivr.net/npm/vue-router@4.5.1/dist/vue-router.global.prod.js"></script>' "$index_file"
    fi
    
    if ! grep -q 'cdn.jsdelivr.net/npm/pinia@' "$index_file"; then
        sed -i '/<head>/a\    <script src="https://cdn.jsdelivr.net/npm/pinia@3.0.3/dist/pinia.iife.prod.js"></script>' "$index_file"
    fi
    
    if ! grep -q 'cdn.jsdelivr.net/npm/tdesign-vue-next@' "$index_file"; then
        sed -i '/<head>/a\    <script src="https://cdn.jsdelivr.net/npm/tdesign-vue-next@1.17.0/dist/tdesign.min.js"></script>' "$index_file"
    fi
    
    if ! grep -q 'cdn.jsdelivr.net/npm/axios@' "$index_file"; then
        sed -i '/<head>/a\    <script src="https://cdn.jsdelivr.net/npm/axios@1.9.0/dist/axios.min.js"></script>' "$index_file"
    fi
    
    # 更新CSS引用 - 添加共享组件的CSS链接
    if ! grep -q '<link rel="stylesheet" href="/css/shared.css">' "$index_file"; then
        sed -i '/<head>/a\    <link rel="stylesheet" href="/css/shared.css">' "$index_file"
    fi
    
    # 更新JS引用 - 替换原有的main.ts引用为home.js（主入口文件）
    sed -i 's|<script type="module" src="/src/renderer/src/main.ts"></script>|<script type="module" src="/js/home.js"></script>|' "$index_file"
    
    # 如果没有找到原有的引用，则添加新的JS引用
    if ! grep -q '<script type="module" src="/js/home.js"></script>' "$index_file"; then
        sed -i 's|<div id="app"></div>|<div id="app"></div>\n    <script type="module" src="/js/home.js"></script>|' "$index_file"
    fi
    
    log_success "index.html更新完成"
}

# 验证组装结果
verify_assembly() {
    log_info "验证组装结果..."
    
    local js_count=$(ls -1 "$JS_DIR" | wc -l)
    local css_count=$(ls -1 "$CSS_DIR" | wc -l)
    local image_count=$(ls -1 "$IMAGES_DIR" | wc -l)
    local resource_count=$(ls -1 "$RESOURCES_DIR" 2>/dev/null | wc -l || echo "0")
    
    log_info "JavaScript文件数量: $js_count"
    log_info "CSS文件数量: $css_count"
    log_info "图片文件数量: $image_count"
    log_info "公共资源文件数量: $resource_count"
    
    # 检查关键文件是否存在
    if [ -f "$UI_DIR/index.html" ]; then
        log_success "入口文件存在"
    else
        log_error "入口文件不存在"
        return 1
    fi
    
    log_success "组装结果验证完成"
}

# 清理函数
cleanup() {
    log_info "清理临时文件..."
    rm -rf "$UI_DIR/.temp"
    log_info "清理完成"
}

# 主函数
main() {
    log_info "开始UI组装流程"
    
    # 创建目标目录
    create_directories
    
    # 复制入口文件
    copy_entry_file
    
    # 复制公共资源
    copy_resources
    
    # 组装构建产物
    assemble_build_artifacts
    
    # 更新index.html引用
    update_index_html
    
    # 验证组装结果
    verify_assembly
    
    # 清理临时文件
    cleanup
    
    log_success "UI组装完成!"
}

# 执行主函数
main "$@"