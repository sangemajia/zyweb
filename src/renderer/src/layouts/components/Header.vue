<template>
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
        <t-button theme="default" variant="text" class="system-function" @click="goToSettings">
          <t-icon name="setting" />
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchValue = ref('');

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

// 跳转到设置页面
const goToSettings = () => {
  router.push('/setting/index');
};
</script>

<style lang="less" scoped>
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
</style>