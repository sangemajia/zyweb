// 专门用于构建的入口文件
import CodeEditor from './src/code-editor';
import type { CodeEditorProps } from './src/code-editor-types';

// 重新导出所有类型
export * from './src/code-editor-types';

export { CodeEditor };
export type { CodeEditorProps };
export default CodeEditor;
