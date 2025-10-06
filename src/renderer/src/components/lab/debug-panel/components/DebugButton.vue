<template>
  <t-button class="button w-btn" theme="default" @click="handleClick">
    <slot></slot>
  </t-button>
</template>

<script setup lang="ts">
const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>
