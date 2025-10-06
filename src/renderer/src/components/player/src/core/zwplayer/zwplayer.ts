import { ZwPlayerCore } from './zwplayer-core';
import { PlayerConfig, DanmakuComment } from './types';
import { MediaEngine } from './media/engine';
import { DanmakuEngine } from './danmaku/engine';
import { UIController, ControlOptions } from './ui/controller';

class ZwPlayer extends ZwPlayerCore {
  private mediaEngine: MediaEngine;
  private danmakuEngine: DanmakuEngine | null = null;
  private uiController: UIController | null = null;

  constructor(config: PlayerConfig) {
    super({
      container: config.container,
      url: config.url,
      type: config.type,
      autoplay: config.autoplay,
      volume: config.volume,
      muted: config.muted,
      playbackRate: config.playbackRate,
      startTime: config.startTime,
      isLive: config.isLive,
      ...config,
    });

    // 初始化媒体引擎
    this.mediaEngine = new MediaEngine(this.videoElement, config);

    // 如果需要弹幕功能，初始化弹幕引擎
    if (config.danmaku !== false) {
      this.danmakuEngine = new DanmakuEngine(this.container, this.videoElement);
    }

    // 如果需要UI控制，初始化UI控制器
    if (config.controls !== false) {
      const controlOptions: ControlOptions = {
        showControls: config.controls !== false,
        themeColor: config.themeColor,
        autoHide: config.autoHide,
        autoHideTime: config.autoHideTime,
      };
      this.uiController = new UIController(this, this.container, controlOptions);
    }

    // 应用初始配置
    this.applyInitialConfig(config);
  }

  private applyInitialConfig(config: PlayerConfig): void {
    // 应用初始时间
    if (config.startTime && config.startTime > 0) {
      this.once('loadedmetadata', () => {
        this.setCurrentTime(config.startTime!);
      });
    }

    // 设置容器尺寸
    if (config.width) {
      this.container.style.width = config.width;
    }
    if (config.height) {
      this.container.style.height = config.height;
    }
  }

  // 重写播放方法以支持媒体引擎
  async play(): Promise<void> {
    try {
      // 让媒体引擎处理特殊格式
      await this.mediaEngine.load(this.options.url, this.options.type);
      await super.play();
    } catch (error) {
      console.error('Play failed:', error);
      throw error;
    }
  }

  // 弹幕相关方法
  loadDanmaku(comments: DanmakuComment[]): void {
    if (this.danmakuEngine) {
      this.danmakuEngine.load(comments);
    }
  }

  sendDanmaku(comment: DanmakuComment): void {
    if (this.danmakuEngine) {
      this.danmakuEngine.send(comment);
    }
  }

  showDanmaku(): void {
    if (this.danmakuEngine) {
      this.danmakuEngine.show();
    }
  }

  hideDanmaku(): void {
    if (this.danmakuEngine) {
      this.danmakuEngine.hide();
    }
  }

  // 重写销毁方法
  destroy(): void {
    // 销毁UI控制器
    if (this.uiController) {
      this.uiController.destroy();
    }

    // 销毁媒体引擎
    this.mediaEngine.destroy();

    // 销毁弹幕引擎
    if (this.danmakuEngine) {
      this.danmakuEngine.destroy();
    }

    // 调用父类销毁方法
    super.destroy();
  }
}

export { ZwPlayer };
export type { PlayerConfig, DanmakuComment } from './types';
