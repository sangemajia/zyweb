<template>
  <t-button class="button init w-btn" theme="default" @click="handleClick">
    <div class="status">
      <span class="title">{{ title }}</span>
      <span class="desc">
        {{ statusLabel }}:
        {{ isAutoMode ? autoText : manualText }}
      </span>
    </div>
    <div class="click" @click.stop="toggleAutoMode">
      <gesture-click-icon />
    </div>
  </t-button>
</template>

<script setup lang="ts">
import { GestureClickIcon } from 'tdesign-icons-vue-next';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  statusLabel: {
    type: String,
    default: '',
  },
  isAutoMode: {
    type: Boolean,
    default: false,
  },
  autoText: {
    type: String,
    default: '',
  },
  manualText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click', 'toggle-auto-mode']);

const handleClick = () => {
  emit('click');
};

const toggleAutoMode = () => {
  emit('toggle-auto-mode');
};
</script>
