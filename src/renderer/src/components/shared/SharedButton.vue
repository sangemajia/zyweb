<template>
  <div class="shared-button" :class="type" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'primary'
  }
});

const emit = defineEmits(['click']);

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

<style scoped>
.shared-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.shared-button.primary {
  background-color: #007bff;
  color: white;
}

.shared-button.secondary {
  background-color: #6c757d;
  color: white;
}

.shared-button.success {
  background-color: #28a745;
  color: white;
}

.shared-button:hover {
  opacity: 0.8;
}
</style>