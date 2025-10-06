<template>
  <div class="html_preview">
    <div class="urlbar-root">
      <div class="urlbar-control">
        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('back')">
          <arrow-left-icon />
        </t-button>
        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('forward')">
          <arrow-right-icon />
        </t-button>
        <t-button theme="default" shape="square" size="small" variant="text" @click="handleWebviewControl('refresh')">
          <rotate-icon />
        </t-button>
      </div>
      <t-input class="urlbar-url" v-model="webviewUrl" @enter="handleWebviewLoad"></t-input>
      <t-button variant="text" class="urlbar-devtool" @click="handleWebviewControl('devtools')">F12</t-button>
    </div>
    <webview
      v-if="isWebviewVisible"
      ref="webviewRef"
      class="webview-box"
      src="about:blank"
      partition="persist:js-edit"
      allowpopups
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ArrowLeftIcon, ArrowRightIcon, RotateIcon } from 'tdesign-icons-vue-next';

const props = defineProps({
  webviewUrl: {
    type: String,
    default: '',
  },
  isWebviewVisible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['webview-control', 'webview-load']);

const handleWebviewControl = (action: string) => {
  emit('webview-control', action);
};

const handleWebviewLoad = () => {
  emit('webview-load');
};
</script>
