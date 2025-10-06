import drpySuggestions from './drpy_suggestions';
import drpyObjectInner from './drpy_object_inner.ts?raw';

export const handleMonacoDrop = (
  type: string,
  e: DragEvent,
  setContent: (content: { js: string; html: string }) => void,
  content: { js: string; html: string },
) => {
  e.preventDefault();

  const file = e.dataTransfer?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const newContent = { ...content };
      newContent[type] = event.target?.result as string;
      setContent(newContent);
    };
    reader.readAsText(file);
  }
};

export const handleMonacoObject = (monaco: any) => {
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model: any, position: any, _context: any, _token: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const monacoRange = new monaco.Range(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn,
      );
      return {
        suggestions: drpySuggestions(monacoRange, monaco).map((proposal: any) => ({
          label: proposal.label,
          detail: proposal.detail,
          kind: proposal.kind || monaco.languages.CompletionItemKind.Function, // 确保指定了一个有效的kind
          insertText: proposal.insertText,
          insertTextRules: proposal.insertTextRules || monaco.languages.CompletionItemInsertTextRule.None,
          documentation: proposal.documentation,
          range: monacoRange, // 使用正确的范围类型
        })),
      };
    },
  });
  monaco.languages.typescript.javascriptDefaults.addExtraLib(drpyObjectInner);
};
