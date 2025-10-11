<template>
  <div class="zy-layout">
    <t-layout>
      <t-aside key="side" class="zy-aside">
        <div class="zy-side-nav-logo-wrapper">
          <img class="logo" src="/resources/img/icons/logo.png" alt="logo" />
          <div class="line"></div>
        </div>
        <t-menu 
          :class="['zy-default-menu', 't-menu--dark']" 
          :value="activeNav"
          theme="dark"
          @change="setActiveNav"
        >
          <t-menu-item 
            v-for="item in navItems" 
            :key="item.name" 
            :value="item.name"
          >
            <template #icon>
              <t-icon :name="item.icon" />
            </template>
            <span>{{ item.label }}</span>
          </t-menu-item>
        </t-menu>
      </t-aside>
      <t-layout>
        <t-header height="56" class="zy-header">
          <div class="header-content">
            <div class="header-left">
              <div class="system-functions">
                <t-button theme="default" variant="text" class="system-function" @click="goBack">
                  <t-icon name="chevron-left" />
                </t-button>
                <t-button theme="default" variant="text" class="system-function" @click="goForward">
                  <t-icon name="chevron-right" />
                </t-button>
                <t-button theme="default" variant="text" class="system-function" @click="refresh">
                  <t-icon name="refresh" />
                </t-button>
              </div>
              <div class="search-container">
                <t-input
                  v-model="searchValue"
                  placeholder="搜索..."
                  clearable
                  @enter="handleSearch"
                >
                  <template #prefix-icon>
                    <t-icon name="search" />
                  </template>
                </t-input>
              </div>
            </div>
            <div class="header-right">
              <div class="system-functions">
                <t-button theme="default" variant="text" class="system-function">
                  <t-icon name="help-circle" />
                </t-button>
                <t-button theme="default" variant="text" class="system-function">
                  <t-icon name="setting" />
                </t-button>
              </div>
            </div>
          </div>
        </t-header>
        <t-content class="zy-content">
          <div class="zy-content-layout">
            <router-view />
          </div>
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 导航项（根据部署模式在服务端控制显示）
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

// 设置活动导航
const setActiveNav = (name: string) => {
  activeNav.value = name;
  // 导航到对应页面
  router.push(`/${name}`);
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
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.zy-layout {
  height: 100vh;
  background: var(--td-bg-color-container);

  .zy-aside {
    background: var(--td-gray-color-13);
    width: 64px;
    transition: all 0.3s;
    
    .zy-side-nav-logo-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      
      .logo {
        width: var(--td-size-10);
        height: var(--td-size-10);
        margin: var(--td-comp-paddingTB-l) 0 var(--td-comp-paddingTB-m) 0;
      }
      
      .line {
        width: 24px;
        height: 1px;
        background-color: var(--td-bg-content-active-2);
        border-radius: 12px;
        margin-bottom: var(--td-comp-paddingTB-xs);
        cursor: pointer;
      }
    }
    
    .zy-default-menu {
      background: transparent;
      
      :deep(.t-menu__item) {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: var(--td-radius-large);
        padding: 0;
        margin: 0 0 var(--td-comp-margin-xs) 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        line-height: 22px;
        font-size: var(--td-font-size-body-small);
        color: var(--td-context-secondary) !important;
        
        .t-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--td-context-secondary) !important;
        }
        
        span {
          font-weight: 700;
        }
        
        &.t-is-active {
          background-color: var(--td-bg-color-container-active);
          color: var(--td-brand-color) !important;
          
          .t-icon {
            color: var(--td-brand-color) !important;
          }
        }
      }
      
      :deep(.t-menu__item:last-child) {
        margin-bottom: var(--td-comp-paddingTB-l);
      }
    }
  }
  
  .zy-header {
    background: var(--td-bg-color-container);
    border-bottom: 1px solid var(--td-border-level-1-color);
    padding: 0 var(--td-comp-paddingLR-xs);
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: var(--td-comp-margin-l);
        
        .system-functions {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: var(--td-bg-color-container);
          border-radius: var(--td-radius-default);
          
          .system-function {
            margin-left: var(--td-comp-margin-xs);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            :deep(.t-button__text) {
              svg {
                color: var(--td-text-color-placeholder);
              }
            }
            
            :deep(.t-button--variant-text) {
              &:hover {
                border-color: transparent;
                background-color: transparent;
                
                .t-button__text {
                  svg {
                    color: var(--td-brand-color);
                  }
                }
              }
            }
          }
        }
        
        .search-container {
          .t-input {
            border-radius: 19px;
            width: 300px;
          }
        }
      }
      
      .header-right {
        display: flex;
        align-items: center;
        
        .system-functions {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: var(--td-bg-color-container);
          border-radius: var(--td-radius-default);
          
          .system-function {
            margin-left: var(--td-comp-margin-xs);
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            :deep(.t-button__text) {
              svg {
                color: var(--td-text-color-placeholder);
              }
            }
            
            :deep(.t-button--variant-text) {
              &:hover {
                border-color: transparent;
                background-color: transparent;
                
                .t-button__text {
                  svg {
                    color: var(--td-brand-color);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  .zy-content {
    position: relative;
    height: calc(100vh - 56px);
    background: var(--td-bg-container);
    margin: 0 var(--td-comp-margin-xs) var(--td-comp-margin-xs) 0;
    border-radius: var(--td-radius-default);
    
    .zy-content-layout {
      padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
      height: 100%;
      overflow: auto;
    }
  }
}

:root,
:root[theme-mode='light'] {
  --td-bg-container: #fefefe;
  --td-bg-color-container: #ffffff;
  --td-bg-color-container-active: rgba(255, 122, 0, 0.1);
  --td-bg-color-container-hover: #f3f3f3;
  --td-context-secondary: rgba(37, 38, 43, 0.72);
  --td-border-level-1-color: #e7e7e7;
  --td-text-color-placeholder: #999;
}

:root[theme-mode='dark'] {
  --td-bg-container: #242424;
  --td-bg-color-container: #101010;
  --td-bg-color-container-active: rgba(255, 122, 0, 0.2);
  --td-bg-color-container-hover: #1a1a1a;
  --td-context-secondary: rgba(255, 255, 255, 0.72);
  --td-border-level-1-color: #383838;
  --td-text-color-placeholder: #666;
}
</style>