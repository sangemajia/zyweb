interface DanmakuComment {
  id?: string;
  text: string;
  time: number;
  color?: string;
  mode?: 'scroll' | 'top' | 'bottom';
  size?: number;
  author?: string;
}

interface PlayerConfig {
  container: string | HTMLElement;
  url: string;
  type?: 'mp4' | 'm3u8' | 'flv' | 'mpd' | 'torrent' | 'mpegts' | 'auto';
  autoplay?: boolean;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  startTime?: number;
  isLive?: boolean;
  controls?: boolean;
  width?: string;
  height?: string;
  [key: string]: any;
}

interface PlayerEvents {
  play: () => void;
  pause: () => void;
  ended: () => void;
  timeupdate: (data: { currentTime: number; duration: number }) => void;
  volumechange: (data: { volume: number; muted: boolean }) => void;
  ratechange: (data: { playbackRate: number }) => void;
  ready: () => void;
  error: (error: Error) => void;
  fullscreenchange: (isFullscreen: boolean) => void;
  pipchange: (isPip: boolean) => void;
  [key: string]: (...args: any[]) => void;
}

interface CustomPlayerInterface {
  // 基础控制
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  
  // 音频控制
  setVolume(volume: number): void;
  getVolume(): number;
  setMuted(muted: boolean): void;
  getMuted(): boolean;
  
  // 视频控制
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  setCurrentTime(time: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  
  // 全屏控制
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  isFullscreenMode(): boolean;
  
  // 画中画控制
  enterPip(): Promise<void>;
  exitPip(): Promise<void>;
  isPipMode(): boolean;
  
  // 弹幕控制
  loadDanmaku(comments: DanmakuComment[]): void;
  sendDanmaku(comment: DanmakuComment): void;
  showDanmaku(): void;
  hideDanmaku(): void;
  
  // 事件监听
  on<T extends keyof PlayerEvents>(event: T, callback: PlayerEvents[T]): void;
  on(event: string, callback: Function): void;
  off<T extends keyof PlayerEvents>(event: T, callback: PlayerEvents[T]): void;
  off(event: string, callback: Function): void;
  once<T extends keyof PlayerEvents>(event: T, callback: PlayerEvents[T]): void;
  once(event: string, callback: Function): void;
  emit(event: string, ...args: any[]): void;
  
  // 状态检查
  isPaused(): boolean;
  isVideoElement(): HTMLVideoElement;
  
  // 销毁
  destroy(): void;
}

export type { DanmakuComment, PlayerConfig, PlayerEvents, CustomPlayerInterface };