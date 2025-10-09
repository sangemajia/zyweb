<template>
  <button 
    class="zyweb-shared-button" 
    :class="[type, size, { disabled, loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Props {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.zyweb-shared-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  text-decoration: none;
}

.zyweb-shared-button:focus-visible {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9), 0 0 0 4px rgba(0, 123, 255, 0.3);
}

.zyweb-shared-button.disabled,
.zyweb-shared-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.zyweb-shared-button.loading {
  cursor: wait;
}

/* 尺寸 */
.zyweb-shared-button.small {
  padding: 6px 12px;
  font-size: 12px;
  height: 28px;
}

.zyweb-shared-button.medium {
  padding: 8px 16px;
  font-size: 14px;
  height: 36px;
}

.zyweb-shared-button.large {
  padding: 12px 24px;
  font-size: 16px;
  height: 48px;
}

/* 类型 */
.zyweb-shared-button.primary {
  background-color: #007bff;
  color: white;
}

.zyweb-shared-button.primary:hover:not(.disabled):not(:disabled) {
  background-color: #0069d9;
}

.zyweb-shared-button.primary:active:not(.disabled):not(:disabled) {
  background-color: #0062cc;
}

.zyweb-shared-button.secondary {
  background-color: #6c757d;
  color: white;
}

.zyweb-shared-button.secondary:hover:not(.disabled):not(:disabled) {
  background-color: #5a6268;
}

.zyweb-shared-button.success {
  background-color: #28a745;
  color: white;
}

.zyweb-shared-button.success:hover:not(.disabled):not(:disabled) {
  background-color: #218838;
}

.zyweb-shared-button.warning {
  background-color: #ffc107;
  color: #212529;
}

.zyweb-shared-button.warning:hover:not(.disabled):not(:disabled) {
  background-color: #e0a800;
}

.zyweb-shared-button.danger {
  background-color: #dc3545;
  color: white;
}

.zyweb-shared-button.danger:hover:not(.disabled):not(:disabled) {
  background-color: #c82333;
}

.zyweb-shared-button.text {
  background-color: transparent;
  color: #007bff;
}

.zyweb-shared-button.text:hover:not(.disabled):not(:disabled) {
  background-color: rgba(0, 123, 255, 0.1);
}

/* 加载状态 */
.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>