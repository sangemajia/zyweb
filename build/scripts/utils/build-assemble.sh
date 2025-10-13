#!/bin/bash

# 构建产物组装脚本
# 组装所有构建产物

# 组装构建产物
assemble_build_artifacts() {
    local zyweb_dist_dir="$1"
    local js_dir="$2"
    local css_dir="$3"
    local images_dir="$4"
    local ad_images_dir="$5"
    
    # 检查源目录是否存在
    if [ ! -d "$zyweb_dist_dir" ]; then
        return 1
    fi
    
    # 检查源目录是否为空
    if [ -z "$(ls -A "$zyweb_dist_dir")" ]; then
        return 1
    fi
    
    # 创建用于跟踪已复制文件的临时目录
    local temp_dir="$js_dir/../.temp"
    mkdir -p "$temp_dir/js" "$temp_dir/css" "$temp_dir/images"
    
    # 遍历所有模块目录
    for module_dir in "$zyweb_dist_dir"/*/; do
        if [ -d "$module_dir" ]; then
            local module_name=$(basename "$module_dir")
            
            # 检查模块目录是否为空
            if [ -z "$(ls -A "$module_dir")" ]; then
                continue
            fi
            
            # 遍历模块中的所有文件
            for file in "$module_dir"/*; do
                if [ -f "$file" ]; then
                    local filename=$(basename "$file")
                    local extension="${filename##*.}"
                    
                    # 移除哈希值，保留原始文件名
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
                            copy_js_file "$file" "$clean_filename" "$js_dir" "$temp_dir"
                            ;;
                        css)
                            copy_css_file "$file" "$clean_filename" "$css_dir" "$temp_dir"
                            ;;
                        png|jpg|jpeg|gif|webp|svg)
                            copy_image_file "$file" "$clean_filename" "$images_dir" "$ad_images_dir" "$temp_dir"
                            ;;
                        *)
                            # 跳过未知类型文件
                            ;;
                    esac
                fi
            done
        fi
    done
    
    # 清理临时目录
    rm -rf "$temp_dir"
    
    return 0
}

# 复制JavaScript文件
copy_js_file() {
    local source_file="$1"
    local filename="$2"
    local js_dir="$3"
    local temp_dir="$4"
    
    # 检查是否已存在同名文件
    if [ -f "$temp_dir/js/$filename" ]; then
        return
    fi
    
    # 特殊处理仍然带有哈希值的文件
    local final_filename="$filename"
    if [[ "$final_filename" == *-*.js ]] && [[ "$final_filename" != *-vendor.js ]] && [[ "$final_filename" != *-app.js ]] && [[ "$final_filename" != *-main.js ]] && [[ "$final_filename" != *-shared.js ]]; then
        # 移除最后的哈希值部分
        final_filename=$(echo "$final_filename" | sed -E 's/-[a-zA-Z0-9_]+\.js$/.js/')
    fi
    
    # 特殊处理Vue相关依赖文件
    case "$final_filename" in
        vue.js|vue-router.js|pinia.js|tdesign.js|axios.js)
            # 直接复制这些文件，不进行任何处理
            cp "$source_file" "$js_dir/$final_filename"
            touch "$temp_dir/js/$final_filename"
            return
            ;;
    esac
    
    # 特殊处理路由组件文件
    if [[ "$final_filename" == home.js ]] || [[ "$filename" == home-main-* ]] || [[ "$final_filename" == film.js ]] || [[ "$filename" == film-main-* ]] || [[ "$final_filename" == iptv.js ]] || [[ "$filename" == iptv-main-* ]] || [[ "$final_filename" == drive.js ]] || [[ "$filename" == drive-main-* ]] || [[ "$final_filename" == play.js ]] || [[ "$filename" == play-main-* ]] || [[ "$final_filename" == analyze.js ]] || [[ "$filename" == analyze-main-* ]] || [[ "$final_filename" == chase.js ]] || [[ "$filename" == chase-main-* ]] || [[ "$final_filename" == setting.js ]] || [[ "$filename" == setting-main-* ]] || [[ "$final_filename" == lab.js ]] || [[ "$filename" == lab-main-* ]]; then
        # 对于路由组件文件，特殊处理引用和导出
        local temp_js_file="$temp_dir/$(basename "$source_file")"
        cp "$source_file" "$temp_js_file"
        
        # 更新JavaScript文件中的引用
        # 处理共享组件引用
        sed -i 's|"\./[^"]*-shared-components-[a-zA-Z0-9_]\+\.js"|"\./shared.js"|g' "$temp_js_file"
        # 处理共享组件的导入语句
        sed -i 's|import { M as MediaCard } from "\.\/shared\.js"|\/\/ import "\.\/shared\.js";|g' "$temp_js_file"
        sed -i 's|import { MediaCard } from "\.\/shared\.js"|\/\/ import "\.\/shared\.js";|g' "$temp_js_file"
        sed -i 's|import sharedComponents from "\.\/shared\.js"|\/\/ import "\.\/shared\.js"|g' "$temp_js_file"
        # 处理home页面的共享组件导入语句
        sed -i 's|import { M as MediaCard } from "\.\/home-shared-components-[a-zA-Z0-9_]\+\.js"|\/\/ import "\.\/shared\.js";|g' "$temp_js_file"
        # 在文件中添加获取MediaCard的代码
        sed -i 's|\/\/ import "\.\/shared\.js";|import "\.\/shared\.js";\nconst MediaCard = window.ZyWebSharedComponents.MediaCard;|g' "$temp_js_file"
        # 处理主文件引用（移除整个import语句而不是留下空字符串）
        sed -i 's|import[^;]*"\./[^"]*-main-[a-zA-Z0-9_]\+\.js"[^;]*;||g' "$temp_js_file"
        # 处理其他模块引用
        sed -i 's|"\./[^"]*-\([^"]*-[a-zA-Z0-9_]\+\.js\)"|"\.\/\1"|g' "$temp_js_file"
        # 移除Vue相关引用
        sed -i 's|import {[^}]*} from "vue";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "vue-router";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "pinia";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "tdesign-vue-next";||g' "$temp_js_file"
        # 移除导出语句
        sed -i 's|export {.*};;||g' "$temp_js_file"
        
        # 移除创建应用和挂载的代码
        sed -i '/const app = createApp(HomePage);/d' "$temp_js_file"
        sed -i '/app.mount("#home-container");/d' "$temp_js_file"
        sed -i '/const app = createApp.*;/d' "$temp_js_file"
        sed -i '/app.mount.*/d' "$temp_js_file"
        
        # 添加默认导出
        sed -i '$a\
export default HomePage;' "$temp_js_file"
        
        # 检查并添加全局变量声明（如果尚未存在）
        if ! grep -q "// 使用全局变量替代模块导入" "$temp_js_file"; then
            sed -i '1i\
// 使用全局变量替代模块导入\
const { defineComponent, ref, resolveComponent, createElementBlock, openBlock, createElementVNode, createCommentVNode, Fragment, renderList, createVNode, withCtx, normalizeStyle, createTextVNode, createBlock, unref, createApp, toDisplayString } = Vue;\
// 检查VueRouter是否存在\
const useRouter = VueRouter && typeof VueRouter.useRouter === "function" ? VueRouter.useRouter : () => ({ push: () => {} });\
// 检查Pinia是否存在\
const defineStore = Pinia && typeof Pinia.defineStore === "function" ? Pinia.defineStore : () => ({});\
const storeToRefs = Pinia && typeof Pinia.storeToRefs === "function" ? Pinia.storeToRefs : () => ({});\
' "$temp_js_file"
        fi
        
        # 复制处理后的文件
        cp "$temp_js_file" "$js_dir/$final_filename"
        
        # 清理临时文件
        rm -f "$temp_js_file"
    # 如果是主入口文件，特殊处理引用
    elif [[ "$final_filename" == *-main.js ]]; then
        # 创建临时文件
        local temp_js_file="$temp_dir/$(basename "$source_file")"
        cp "$source_file" "$temp_js_file"
        
        # 更新JavaScript文件中的引用
        # 处理共享组件引用
        sed -i 's|"\./[^"]*-shared-components-[a-zA-Z0-9_]\+\.js"|"\./shared.js"|g' "$temp_js_file"
        # 处理共享组件的导入语句
        sed -i 's|import { M as MediaCard } from "\.\/shared\.js"|\/\/ import "\.\/shared\.js";|g' "$temp_js_file"
        sed -i 's|import { MediaCard } from "\.\/shared\.js"|\/\/ import "\.\/shared\.js";|g' "$temp_js_file"
        sed -i 's|import sharedComponents from "\.\/shared\.js"|\/\/ import "\.\/shared\.js"|g' "$temp_js_file"
        # 处理home页面的共享组件导入语句
        sed -i 's|import { M as MediaCard } from "\.\/home-shared-components-[a-zA-Z0-9_]\+\.js"|\/\/ import "\.\/shared\.js";|g' "$temp_js_file"
        # 在文件中添加获取MediaCard的代码
        sed -i 's|\/\/ import "\.\/shared\.js";|import "\.\/shared\.js";\nconst MediaCard = window.ZyWebSharedComponents.MediaCard;|g' "$temp_js_file"
        # 处理主文件引用（移除整个import语句而不是留下空字符串）
        sed -i 's|import[^;]*"\./[^"]*-main-[a-zA-Z0-9_]\+\.js"[^;]*;||g' "$temp_js_file"
        # 处理其他模块引用
        sed -i 's|"\./[^"]*-\([^"]*-[a-zA-Z0-9_]\+\.js\)"|"\.\/\1"|g' "$temp_js_file"
        # 移除Vue相关引用
        sed -i 's|import {[^}]*} from "vue";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "vue-router";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "pinia";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "tdesign-vue-next";||g' "$temp_js_file"
        # 移除导出语句
        sed -i 's|export {.*};;||g' "$temp_js_file"
        
        # 检查并添加全局变量声明（如果尚未存在）
        if ! grep -q "// 使用全局变量替代模块导入" "$temp_js_file"; then
            sed -i '1i\
// 使用全局变量替代模块导入\
const { defineComponent, ref, resolveComponent, createElementBlock, openBlock, createElementVNode, createCommentVNode, Fragment, renderList, createVNode, withCtx, normalizeStyle, createTextVNode, createBlock, unref, createApp, toDisplayString } = Vue;\
// 检查VueRouter是否存在\
const useRouter = VueRouter && typeof VueRouter.useRouter === "function" ? VueRouter.useRouter : () => ({ push: () => {} });\
// 检查Pinia是否存在\
const defineStore = Pinia && typeof Pinia.defineStore === "function" ? Pinia.defineStore : () => ({});\
const storeToRefs = Pinia && typeof Pinia.storeToRefs === "function" ? Pinia.storeToRefs : () => ({});\
' "$temp_js_file"
        fi
        
        # 复制处理后的文件
        cp "$temp_js_file" "$js_dir/$final_filename"
        
        # 清理临时文件
        rm -f "$temp_js_file"
    else
        # 对于其他JavaScript文件，移除Vue相关引用
        local temp_js_file="$temp_dir/$(basename "$source_file")"
        cp "$source_file" "$temp_js_file"
        
        # 移除Vue相关引用
        sed -i 's|import {[^}]*} from "vue";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "vue-router";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "pinia";||g' "$temp_js_file"
        sed -i 's|import {[^}]*} from "tdesign-vue-next";||g' "$temp_js_file"
        # 移除导出语句
        sed -i 's|export {.*};;||g' "$temp_js_file"
        
        # 复制处理后的文件
        cp "$temp_js_file" "$js_dir/$final_filename"
        
        # 清理临时文件
        rm -f "$temp_js_file"
    fi
    
    # 记录已复制的文件名
    touch "$temp_dir/js/$final_filename"
}

# 复制CSS文件
copy_css_file() {
    local source_file="$1"
    local filename="$2"
    local css_dir="$3"
    local temp_dir="$4"
    
    # 检查是否已存在同名文件
    if [ -f "$temp_dir/css/$filename" ]; then
        return
    fi
    
    # 特殊处理仍然带有哈希值的CSS文件
    local final_filename="$filename"
    if [[ "$final_filename" == *-*.css ]] && [[ "$final_filename" != *-style.css ]]; then
        # 移除最后的哈希值部分
        final_filename=$(echo "$final_filename" | sed -E 's/-[a-zA-Z0-9_]+\.css$/.css/')
    fi
    
    # 复制文件
    cp "$source_file" "$css_dir/$final_filename"
    
    # 记录已复制的文件名
    touch "$temp_dir/css/$final_filename"
}

# 复制图片文件
copy_image_file() {
    local source_file="$1"
    local filename="$2"
    local images_dir="$3"
    local ad_images_dir="$4"
    local temp_dir="$5"
    
    # 检查是否已存在同名文件
    if [ -f "$temp_dir/images/$filename" ]; then
        return
    fi
    
    # 特殊处理广告相关图片(raincloud和sp)
    if [[ "$filename" == *-raincloud.* ]] || [[ "$filename" == *-sp.* ]]; then
        # 移除模块名前缀，只保留类型名
        local final_filename=$(echo "$filename" | sed -E 's/^[^-]+-(raincloud|sp)(-[a-zA-Z0-9_]+)?\.(.*)$/\1.\3/')
        # 检查是否已存在同名文件
        if [ -f "$temp_dir/images/$final_filename" ]; then
            return
        fi
        # 复制到ad目录
        cp "$source_file" "$ad_images_dir/$final_filename"
        # 记录已复制的文件名
        touch "$temp_dir/images/$final_filename"
        return
    fi
    
    # 特殊处理播放器背景图片
    if [[ "$filename" == *-bg-player.* ]]; then
        # 移除模块名前缀和哈希值，只保留bg-player
        local final_filename="bg-player.$(echo "$filename" | sed -E 's/.*\.(.*)$/\1/' | sed -E 's/-[a-zA-Z0-9_]+\.([a-zA-Z0-9]+)$/\.\1/')"
        # 检查是否已存在同名文件
        if [ -f "$temp_dir/images/$final_filename" ]; then
            return
        fi
        # 复制到images目录
        cp "$source_file" "$images_dir/$final_filename"
        # 记录已复制的文件名
        touch "$temp_dir/images/$final_filename"
        return
    fi
    
    # 特殊处理通用图片文件（移除模块前缀和哈希值）
    # 检查是否为通用图片文件（在多个模块中出现的相同文件）
    if [[ "$filename" == *-*.jpg ]] || [[ "$filename" == *-*.png ]] || [[ "$filename" == *-*.gif ]] || [[ "$filename" == *-*.svg ]] || [[ "$filename" == *-*.webp ]]; then
        # 提取不带模块前缀的文件名
        local base_filename=$(echo "$filename" | sed -E 's/^[^-]+-(.*)$/\1/')
        
        # 进一步移除哈希值
        base_filename=$(echo "$base_filename" | sed -E 's/-[a-zA-Z0-9_]+\.([a-zA-Z0-9]+)$/\.\1/')
        
        # 检查是否已存在同名文件
        if [ -f "$temp_dir/images/$base_filename" ]; then
            return
        fi
        
        # 如果提取后的文件名与原文件名不同，说明是带模块前缀的通用文件
        if [ "$base_filename" != "$filename" ]; then
            # 复制文件并使用不带模块前缀的文件名
            cp "$source_file" "$images_dir/$base_filename"
            # 记录已复制的文件名
            touch "$temp_dir/images/$base_filename"
            return
        fi
    fi
    
    # 特殊处理仍然带有哈希值的图片文件
    local final_filename="$filename"
    if [[ "$final_filename" == *-*.* ]] && [[ "$final_filename" != *-raincloud.* ]] && [[ "$final_filename" != *-sp.* ]] && [[ "$final_filename" != *-bg-player.* ]]; then
        # 移除最后的哈希值部分
        final_filename=$(echo "$final_filename" | sed -E 's/-[a-zA-Z0-9_]+\.(.*)$/\.\1/')
    fi
    
    # 复制文件
    cp "$source_file" "$images_dir/$final_filename"
    
    # 记录已复制的文件名
    touch "$temp_dir/images/$final_filename"
}