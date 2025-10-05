// 导出原有的多播放器适配器
import MultiPlayer from './multi-player';
import { mediaUtils } from './utils/tool';

// 导出zwplayer
import { ZwPlayer } from './core/zwplayer/zwplayer';
import { PlayerConfig, DanmakuComment } from './core/zwplayer/types';

// 导出类型定义
export type { MultiPlayerInstance } from './multi-player';
export type { PlayerConfig, DanmakuComment };

// 导出所有播放器
export { 
  MultiPlayer, 
  mediaUtils,
  ZwPlayer
};