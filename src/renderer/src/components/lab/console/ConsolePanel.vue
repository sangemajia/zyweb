<template>
  <div class="console-pane">
    <div class="console-root">
      <div class="header-name">{{ $t('pages.lab.jsEdit.console.title') }}</div>
      <div class="header-clear" @click="handleClear">
        <clear-icon />
      </div>
    </div>
    <div class="log-pane-content">
      <terminal-view :options="options" ref="terminalRef" class="log-box" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ClearIcon } from 'tdesign-icons-vue-next';
import TerminalView from '@/components/terminal/index.vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['clear']);

const terminalRef = ref(null);

const handleClear = () => {
  emit('clear');
};

defineExpose({
  terminal: terminalRef,
});
</script>
