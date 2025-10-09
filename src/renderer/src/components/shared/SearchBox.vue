<template>
  <div class="search-box" :class="{ 'search-box--focused': isFocused }">
    <t-input
      v-model="searchValue"
      :placeholder="placeholder"
      size="large"
      clearable
      @focus="onFocus"
      @blur="onBlur"
      @enter="onSearch"
    >
      <template #prefix-icon>
        <t-icon name="search" />
      </template>
    </t-input>
    <t-button 
      v-if="showSearchButton" 
      theme="primary" 
      size="large" 
      @click="onSearch"
    >
      搜索
    </t-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  placeholder?: string;
  showSearchButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入搜索关键词...',
  showSearchButton: false
});

const emit = defineEmits<{
  (e: 'search', value: string): void;
}>();

const searchValue = ref('');
const isFocused = ref(false);

const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  isFocused.value = false;
};

const onSearch = () => {
  if (searchValue.value.trim()) {
    emit('search', searchValue.value.trim());
  }
};
</script>

<style lang="less" scoped>
.search-box {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 0;

  &--focused {
    .t-input {
      border-color: #45c58b;
      box-shadow: 0 0 0 2px rgba(69, 197, 139, 0.2);
    }
  }

  .t-input {
    flex: 1;
    transition: all 0.3s ease;

    :deep(.t-input__inner) {
      border-radius: 24px;
    }

    :deep(.t-icon) {
      color: #999;
    }
  }

  .t-button {
    border-radius: 24px;
  }
}
</style>