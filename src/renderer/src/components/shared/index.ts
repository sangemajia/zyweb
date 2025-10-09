// 为Web环境优化的共享组件入口
import './shared-components.css';

export { default as SharedButton } from './SharedButton.vue';
export { default as SharedCard } from './SharedCard.vue';
export { default as SimpleShared } from './SimpleShared.vue';
export { default as MediaCard } from './MediaCard.vue';
export { default as SearchBox } from './SearchBox.vue';

// 为Web环境添加额外的导出
export const version = '__VERSION__';

// Web环境特定的工具函数
export const webUtils = {
  // 检查是否在Web环境运行
  isWeb() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },
  
  // Web环境特定的样式处理
  applyWebStyles(element, styles) {
    if (this.isWeb() && element && element.style) {
      Object.assign(element.style, styles);
    }
  }
};