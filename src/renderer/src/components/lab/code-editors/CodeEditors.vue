<template>
  <div class="editor-pane">
    <t-tabs v-model="activeEditor" theme="card" lazy class="editor-pane-tabs">
      <t-tab-panel :label="$t('pages.lab.jsEdit.editor.js')" value="js">
        <CodeEditor
          v-model="jsContent"
          :options="jsEditConf"
          @drop.prevent="handleDrop('js', $event)"
          @monaco-object="handleMonacoObject"
          class="code-box"
        />
      </t-tab-panel>
      <t-tab-panel :label="$t('pages.lab.jsEdit.editor.html')" value="html">
        <CodeEditor
          v-model="htmlContent"
          :options="htmlEditConf"
          @drop.prevent="handleDrop('html', $event)"
          @monaco-object="handleMonacoObject"
          class="code-box"
        />
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import CodeEditor from '@/components/code-editor/CodeEditor.vue';

const props = defineProps({
  jsContent: {
    type: String,
    default: '',
  },
  htmlContent: {
    type: String,
    default: '',
  },
  jsEditConf: {
    type: Object,
    default: () => ({}),
  },
  htmlEditConf: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:jsContent', 'update:htmlContent', 'drop', 'monaco-object']);

const activeEditor = ref('js');

const handleDrop = (type: string, event: DragEvent) => {
  emit('drop', type, event);
};

const handleMonacoObject = (editor: any) => {
  emit('monaco-object', editor);
};
</script>
