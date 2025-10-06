<template>
  <div class="component-op">
    <t-select v-model="selectedOption" auto-width @change="handleChange">
      <t-option v-for="option in options" :key="option.value" :label="option.label" :value="option.value" />
    </t-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectedOption = ref(props.modelValue);

const handleChange = (value: string) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style lang="less" scoped>
.component-op {
  display: flex;
  height: var(--td-comp-size-m);
  padding: 0 var(--td-comp-paddingLR-xs);
  background-color: var(--td-bg-content-input-2);
  border-radius: var(--td-radius-default);
  align-items: center;

  :deep(.t-select__wrap) {
    width: fit-content;
    position: relative;
    height: calc(var(--td-comp-size-m) - (var(--td-comp-paddingTB-xxs) * 2));

    .t-input--auto-width {
      min-width: 44px;
    }

    &:hover {
      .t-input__inner {
        color: var(--td-text-color-primary);
      }
    }

    .t-input__inner {
      color: var(--td-text-color-secondary);
      font: var(--td-font-body-medium);
    }

    .t-input {
      .t-input__suffix:not(:empty) {
        display: none;
      }
    }
  }

  :deep(.t-select__wrap::before) {
    content: '';
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: calc(100% - 24px);
    background-color: var(--td-component-border);
    transition: opacity 0.2s cubic-bezier(0, 0, 0.15, 1);
    z-index: 2;
  }
}
</style>
