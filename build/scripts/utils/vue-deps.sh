#!/bin/bash

# Vue依赖处理脚本
# 复制Vue相关依赖文件

# 复制Vue相关依赖文件
copy_vue_dependencies() {
    local project_root="$1"
    local js_dir="$2"
    
    # 复制Vue
    if [ -f "$project_root/node_modules/vue/dist/vue.global.prod.js" ]; then
        cp "$project_root/node_modules/vue/dist/vue.global.prod.js" "$js_dir/vue.js"
    else
        return 1
    fi
    
    # 复制Vue Router
    if [ -f "$project_root/node_modules/vue-router/dist/vue-router.global.prod.js" ]; then
        cp "$project_root/node_modules/vue-router/dist/vue-router.global.prod.js" "$js_dir/vue-router.js"
    else
        return 1
    fi
    
    # 复制Pinia
    if [ -f "$project_root/node_modules/pinia/dist/pinia.iife.prod.js" ]; then
        cp "$project_root/node_modules/pinia/dist/pinia.iife.prod.js" "$js_dir/pinia.js"
    else
        return 1
    fi
    
    # 复制TDesign Vue Next
    if [ -f "$project_root/node_modules/tdesign-vue-next/dist/tdesign.min.js" ]; then
        cp "$project_root/node_modules/tdesign-vue-next/dist/tdesign.min.js" "$js_dir/tdesign.js"
    else
        return 1
    fi
    
    # 复制Axios
    if [ -f "$project_root/node_modules/axios/dist/axios.min.js" ]; then
        cp "$project_root/node_modules/axios/dist/axios.min.js" "$js_dir/axios.js"
    else
        return 1
    fi
    
    return 0
}