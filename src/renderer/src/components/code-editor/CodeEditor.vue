// 代码编辑器组件 import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'; import * as monaco from
'monaco-editor'; export default defineComponent({ name: 'CodeEditor', props: { modelValue: { type: String, default: ''
}, options: { type: Object, default: () => ({}) } }, emits: ['update:modelValue', 'monaco-object'], setup(props, { emit
}) { const editorRef = ref
<HTMLElement | null></HTMLElement>
