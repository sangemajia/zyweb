// 媒体引擎接口
export interface MediaEngine {
  // 加载媒体资源
  load(url: string, type?: string): Promise<void>;

  // 销毁媒体引擎
  destroy(): void;
}

// 弹幕引擎接口
export interface DanmakuEngine {
  // 加载弹幕
  load(comments: any[]): void;

  // 发送弹幕
  send(comment: any): void;

  // 显示弹幕
  show(): void;

  // 隐藏弹幕
  hide(): void;

  // 销毁弹幕引擎
  destroy(): void;
}

// UI控制器接口
export interface UIController {
  // 更新播放状态
  updatePlayState(isPlaying: boolean): void;

  // 更新时间信息
  updateTime(currentTime: number, duration: number): void;

  // 更新音量信息
  updateVolume(volume: number, muted: boolean): void;

  // 更新播放速度
  updatePlaybackRate(rate: number): void;

  // 更新全屏状态
  updateFullscreenState(isFullscreen: boolean): void;

  // 更新画中画状态
  updatePipState(isPip: boolean): void;

  // 销毁UI控制器
  destroy(): void;
}
