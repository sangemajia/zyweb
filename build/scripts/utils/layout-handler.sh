#!/bin/bash

# 布局文件处理脚本
# 复制和处理布局文件

# 复制布局文件
copy_layout_files() {
    local project_root="$1"
    local layouts_dir="$2"
    
    # 检查MainLayout.vue是否存在于源代码中
    local main_layout_src="$project_root/src/renderer/src/layouts/MainLayout.vue"
    if [ -f "$main_layout_src" ]; then
        # 创建临时目录和文件用于转换
        local temp_dir="$layouts_dir/../.temp"
        mkdir -p "$temp_dir"
        local temp_layout_file="$temp_dir/MainLayout.js"
        
        # 复制并转换MainLayout.vue为JavaScript文件
        # 这里我们简化处理，实际项目中可能需要更复杂的转换
        cat > "$temp_layout_file" << 'EOF'
// 使用全局变量替代模块导入
const { defineComponent, ref, watch } = Vue;
const { useRouter, useRoute } = VueRouter;

// 模拟TDesign组件 - 在实际环境中这些会通过全局变量提供
const TLayout = { 
  template: '<div class="t-layout"><slot name="aside"></slot><slot></slot></div>'
};
const TAside = { 
  template: '<aside class="t-aside"><slot></slot></aside>'
};
const TMenu = { 
  template: '<nav class="t-menu"><slot></slot></nav>',
  props: ['value', 'theme'],
  emits: ['change']
};
const TMenuItem = { 
  template: '<div class="t-menu-item" @click="$emit(\'click\')"><slot></slot></div>',
  props: ['value'],
  emits: ['click']
};
const THeader = { 
  template: '<header class="t-header"><slot></slot></header>',
  props: ['height']
};
const TContent = { 
  template: '<main class="t-content"><slot></slot></main>'
};
const TIcon = { 
  template: '<i class="t-icon" :class="\'t-icon-\' + name"></i>',
  props: ['name']
};
const TButton = { 
  template: '<button class="t-button" @click="$emit(\'click\')"><slot></slot></button>',
  emits: ['click']
};
const TInput = { 
  template: '<input class="t-input" v-model="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  props: ['modelValue'],
  emits: ['update:modelValue']
};

const _hoisted_1 = { class: "zy-layout" };
const _hoisted_2 = { class: "zy-aside" };
const _hoisted_3 = { class: "zy-side-nav-logo-wrapper" };
const _hoisted_4 = { class: "line" };
const _hoisted_5 = { class: "zy-default-menu t-menu--dark" };
const _hoisted_6 = { class: "header-content" };
const _hoisted_7 = { class: "header-left" };
const _hoisted_8 = { class: "system-functions" };
const _hoisted_9 = { class: "search-container" };
const _hoisted_10 = { class: "header-right" };
const _hoisted_11 = { class: "system-functions" };
const _hoisted_12 = { class: "zy-content" };
const _hoisted_13 = { class: "zy-content-layout" };

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MainLayout",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();

    // 导航项
    const navItems = [
      { name: 'home', label: '首页', icon: 'home' },
      { name: 'play', label: '播放', icon: 'play-circle' },
      { name: 'film', label: '电影', icon: 'film' },
      { name: 'iptv', label: '电视', icon: 'tv' },
      { name: 'drive', label: '网盘', icon: 'cloud' },
      { name: 'chase', label: '追刻', icon: 'heart' },
      { name: 'lab', label: '实验室', icon: 'experiment' },
      { name: 'setting', label: '设置', icon: 'setting' }
    ];

    // 状态
    const activeNav = ref('home');
    const searchValue = ref('');

    // 监听路由变化，更新激活的导航项
    watch(
      () => route.path,
      (newPath) => {
        // 根据当前路径设置激活的导航项
        if (newPath === '/' || newPath === '/home') {
          activeNav.value = 'home';
        } else {
          // 从路径中提取导航项名称
          const pathParts = newPath.split('/').filter(part => part);
          if (pathParts.length > 0) {
            activeNav.value = pathParts[0];
          }
        }
      },
      { immediate: true }
    );

    // 设置活动导航
    const setActiveNav = (name) => {
      activeNav.value = name;
      // 导航到对应页面
      router.push('/' + name);
    };

    // 浏览器历史操作
    const goBack = () => {
      router.go(-1);
    };

    const goForward = () => {
      router.go(1);
    };

    const refresh = () => {
      window.location.reload();
    };

    // 搜索处理
    const handleSearch = () => {
      if (searchValue.value.trim()) {
        // 这里可以添加搜索逻辑
        console.log('搜索:', searchValue.value);
      }
    };

    return { 
      navItems, 
      activeNav, 
      searchValue, 
      setActiveNav, 
      goBack, 
      goForward, 
      refresh, 
      handleSearch,
      TLayout,
      TAside,
      TMenu,
      TMenuItem,
      THeader,
      TContent,
      TIcon,
      TButton,
      TInput
    };
  },
  template: '<div class="zy-layout"><div class="t-layout"><aside class="t-aside zy-aside"><div class="zy-side-nav-logo-wrapper"><img class="logo" src="/resources/img/icons/logo.png" alt="logo" /><div class="line"></div></div><nav :class="[\'zy-default-menu\', \'t-menu--dark\']"><div v-for="item in navItems" :key="item.name" class="t-menu-item" :class="{ \'t-is-active\': activeNav === item.name }" @click="setActiveNav(item.name)"><i class="t-icon" :class="\'t-icon-\' + item.icon"></i><span>{{ item.label }}</span></div></nav></aside><div class="t-layout"><header height="56" class="t-header zy-header"><div class="header-content"><div class="header-left"><div class="system-functions"><button theme="default" variant="text" class="system-function" @click="goBack"><i class="t-icon t-icon-chevron-left"></i></button><button theme="default" variant="text" class="system-function" @click="goForward"><i class="t-icon t-icon-chevron-right"></i></button><button theme="default" variant="text" class="system-function" @click="refresh"><i class="t-icon t-icon-refresh"></i></button></div><div class="search-container"><input v-model="searchValue" placeholder="搜索..." class="t-input" @keyup.enter="handleSearch"><i class="t-icon t-icon-search" slot="prefix-icon"></i></input></div></div><div class="header-right"><div class="system-functions"><button theme="default" variant="text" class="system-function"><i class="t-icon t-icon-help-circle"></i></button><button theme="default" variant="text" class="system-function"><i class="t-icon t-icon-setting"></i></button></div></div></div></header><main class="t-content zy-content"><div class="zy-content-layout"><router-view /></div></main></div></div></div>'
});

// 添加样式到文档头部
const addLayoutStyles = () => {
  const style = document.createElement('style');
  style.textContent = '.zy-layout { height: 100vh; background: #ffffff; } .zy-aside { background: #101010; width: 64px; transition: all 0.3s; } .zy-side-nav-logo-wrapper { display: flex; align-items: center; justify-content: center; width: 100%; } .logo { width: 40px; height: 40px; margin: 16px 0 12px 0; } .line { width: 24px; height: 1px; background-color: rgba(255, 255, 255, 0.1); border-radius: 12px; margin-bottom: 4px; cursor: pointer; } .zy-default-menu { background: transparent; } .t-menu-item { position: relative; width: 40px; height: 40px; border-radius: 8px; padding: 0; margin: 0 0 8px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.3s ease; line-height: 22px; font-size: 12px; color: rgba(255, 255, 255, 0.72) !important; cursor: pointer; } .t-menu-item.t-is-active { background-color: rgba(255, 122, 0, 0.1); color: #ff7a00 !important; } .t-icon { font-size: 24px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.72) !important; } .t-menu-item.t-is-active .t-icon { color: #ff7a00 !important; } .zy-header { background: #ffffff; border-bottom: 1px solid #e7e7e7; padding: 0 8px; } .header-content { display: flex; align-items: center; justify-content: space-between; height: 100%; } .header-left { display: flex; align-items: center; gap: 16px; } .system-functions { display: flex; align-items: center; justify-content: space-around; background: #ffffff; border-radius: 6px; } .system-function { margin-left: 4px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; } .system-function:hover { background-color: #f3f3f3; } .t-icon { color: #999; } .system-function:hover .t-icon { color: #ff7a00; } .search-container .t-input { border-radius: 19px; width: 300px; } .header-right { display: flex; align-items: center; } .zy-content { position: relative; height: calc(100vh - 56px); } .zy-content-layout { height: 100%; overflow-y: auto; padding: 16px; }';
  document.head.appendChild(style);
};

// 在组件加载时添加样式
addLayoutStyles();

const MainLayout = _sfc_main;
export default MainLayout;
EOF
        
        # 复制处理后的布局文件
        cp "$temp_layout_file" "$layouts_dir/MainLayout.js"
        
        # 清理临时文件
        rm -f "$temp_layout_file"
        
        return 0
    else
        return 1
    fi
}