// 代码片段建议工具
export interface Snippet {
  label: string;
  insertText: string;
  detail: string;
  documentation: string;
}

/**
 * 自定义代码片段
 */
export const SNIPPETS: Snippet[] = [
  {
    label: 'ifelse',
    insertText: `if (\${1:condition}) {
  \t$0
} else {
  \t
}
    `,
    detail: '普通if-else',
    documentation: `if (condition) {

} else {

}`,
  },
  {
    label: 'for',
    insertText: `for (let \${1:i} = 0; \${1:i} < \${2:array}.length; \${1:i}++) {
  let \${3:data} = \${2:array}[\${1:i}];
  \$0
}`,
    detail: '普通 for 循环',
    documentation: `for (let i = 0; i < array.length; i++) {
  let data = array[i];

}`,
  },
  {
    label: 'forof',
    insertText: `for (let data of \${1:array}) {
  \$0
}`,
    detail: 'for-of(遍历数组推荐)',
    documentation: `for (let data of array) {

}`,
  },
  {
    label: 'forin',
    insertText: `for (let key in \${1:object}) {
  let data = \${1:object}[key];
  \$0
}`,
    detail: 'for-in(遍历对象推荐)',
    documentation: `for (let key in object) {
  let data = object[key];

}`,
  },
];

export default SNIPPETS;
