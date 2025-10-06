// 统一的播放器配置接口
export interface PlayerConfig {
  // 容器元素或ID
  container: string | HTMLElement;

  // 视频源URL
  url: string;

  // 视频类型 (mp4, m3u8, flv, mpd, torrent, mpegts, auto)
  type?: string;

  // 自动播放
  autoplay?: boolean;

  // 音量 (0-1)
  volume?: number;

  // 静音
  muted?: boolean;

  // 播放速度 (0.5-4)
  playbackRate?: number;

  // 开始时间
  startTime?: number;

  // 是否为直播
  isLive?: boolean;

  // 宽度
  width?: string;

  // 高度
  height?: string;

  // 是否显示控制栏
  controls?: boolean;

  // 是否启用弹幕
  danmaku?: boolean;

  // 主题色
  themeColor?: string;

  // 控制栏自动隐藏
  autoHide?: boolean;

  // 控制栏自动隐藏时间(毫秒)
  autoHideTime?: number;

  // 其他配置项
  [key: string]: any;
}

// 弹幕评论接口
export interface DanmakuComment {
  // 弹幕文本
  text: string;

  // 弹幕颜色
  color?: string;

  // 弹幕类型 (top, bottom, scroll)
  type?: string;

  // 弹幕大小
  size?: number;

  // 弹幕发送时间
  time?: number;

  // 弹幕发送者
  author?: string;
}

// 播放器事件接口
export interface PlayerEvents {
  // 播放事件
  play: () => void;

  // 暂停事件
  pause: () => void;

  // 结束事件
  ended: () => void;

  // 时间更新事件
  timeupdate: (data: { currentTime: number; duration: number }) => void;

  // 音量变化事件
  volumechange: (data: { volume: number; muted: boolean }) => void;

  // 播放速度变化事件
  ratechange: (data: { playbackRate: number }) => void;

  // 就绪事件
  ready: () => void;

  // 错误事件
  error: (error: any) => void;

  // 全屏变化事件
  fullscreenchange: (isFullscreen: boolean) => void;

  // 画中画变化事件
  pipchange: (isPip: boolean) => void;
}

// 媒体类型
export type MediaType = 'mp4' | 'm3u8' | 'flv' | 'mpd' | 'torrent' | 'mpegts' | 'auto';
