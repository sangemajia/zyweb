#!/bin/bash

# UI组装脚本
# 该脚本用于将所有构建产物整合成一个完整的前端UI

set -e  # 遇到错误时停止执行

# 获取脚本所在目录和项目根目录
SCRIPT_DIR=$(cd ./build/scripts && pwd)
PROJECT_ROOT=$(pwd)

# 导入模块化脚本
source "$SCRIPT_DIR/utils/log.sh"
source "$SCRIPT_DIR/utils/directory.sh"
source "$SCRIPT_DIR/utils/vue-deps.sh"
source "$SCRIPT_DIR/utils/entry-file.sh"
source "$SCRIPT_DIR/utils/build-assemble.sh"
source "$SCRIPT_DIR/utils/layout-handler.sh"
source "$SCRIPT_DIR/utils/html-handler.sh"
source "$SCRIPT_DIR/utils/verify.sh"
source "$SCRIPT_DIR/utils/main-entry.sh"

# 主函数
main() {
    log_info "开始UI组装..."
    
    # 获取目录
    local dirs=$(get_directories)
    local script_dir=$(echo "$dirs" | cut -d',' -f1)
    local project_root=$(echo "$dirs" | cut -d',' -f2)
    
    # 创建目标目录
    local dir_paths=$(create_directories "$project_root")
    local dist_dir=$(echo "$dir_paths" | cut -d',' -f1)
    local zyweb_dist_dir=$(echo "$dir_paths" | cut -d',' -f2)
    local ui_dir=$(echo "$dir_paths" | cut -d',' -f3)
    local js_dir=$(echo "$dir_paths" | cut -d',' -f4)
    local css_dir=$(echo "$dir_paths" | cut -d',' -f5)
    local images_dir=$(echo "$dir_paths" | cut -d',' -f6)
    local ad_images_dir=$(echo "$dir_paths" | cut -d',' -f7)
    local layouts_dir=$(echo "$dir_paths" | cut -d',' -f8)
    
    log_info "目录创建完成"
    
    # 复制Vue相关依赖文件
    if copy_vue_dependencies "$project_root" "$js_dir"; then
        log_success "Vue依赖文件复制完成"
    else
        log_error "Vue依赖文件复制失败"
        exit 1
    fi
    
    # 复制入口文件
    if copy_entry_file "$project_root" "$ui_dir"; then
        log_success "入口文件处理完成"
    else
        log_error "入口文件处理失败"
        exit 1
    fi
    
    # 组装构建产物
    if assemble_build_artifacts "$zyweb_dist_dir" "$js_dir" "$css_dir" "$images_dir" "$ad_images_dir"; then
        log_success "构建产物组装完成"
    else
        log_error "构建产物组装失败"
        exit 1
    fi
    
    # 复制布局文件
    if copy_layout_files "$project_root" "$layouts_dir"; then
        log_success "布局文件复制完成"
        # 将布局文件添加到全局变量
        echo "window.MainLayout = MainLayout;" >> "$layouts_dir/MainLayout.js"
    else
        log_warning "布局文件复制失败或未找到"
    fi
    
    # 生成主入口文件
    if generate_main_entry "$js_dir" "$layouts_dir"; then
        log_success "主入口文件生成完成"
    else
        log_error "主入口文件生成失败"
        exit 1
    fi
    
    # 更新index.html引用
    if update_index_html "$ui_dir" "$js_dir" "$css_dir"; then
        log_success "index.html引用更新完成"
    else
        log_error "index.html引用更新失败"
        exit 1
    fi
    
    # 验证组装结果
    if verify_assembly "$ui_dir" "$js_dir" "$css_dir" "$images_dir"; then
        log_success "UI组装验证通过"
    else
        log_error "UI组装验证失败"
        exit 1
    fi
    
    log_success "UI组装完成!"
}

# 执行主函数
main "$@"