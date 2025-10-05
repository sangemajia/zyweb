import { EventEmitter } from './utils/event-emitter';
import { PlayerStorage } from './utils/storage';

interface PlayerOptions {
  container: string | HTMLElement;
  url: string;
  type?: string;
  autoplay?: boolean;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  startTime?: number;
  isLive?: boolean;
  [key: string]: any;
}

class ZwPlayerCore extends EventEmitter {
  protected container: HTMLElement;
  protected videoElement: HTMLVideoElement;
  protected options: PlayerOptions;
  protected storage: PlayerStorage;
  protected isFullscreen: boolean = false;
  protected isPip: boolean = false;
  protected isPlaying: boolean = false;

  constructor(options: PlayerOptions) {
    super();
    this.options = {
      autoplay: false,
      volume: 1,
      muted: false,
      playbackRate: 1,
      startTime: 0,
      isLive: false,
      ...options
    };
    
    this.storage = new PlayerStorage('zwplayer');
    this.initContainer();
    this.initVideoElement();
    this.initEvents();
  }

  protected initContainer(): void {
    if (typeof this.options.container === 'string') {
      const element = document.getElementById(this.options.container);
      if (!element) {
        throw new Error(`Container element with id "${this.options.container}" not found`);
      }
      this.container = element;
    } else {
      this.container = this.options.container as HTMLElement;
    }
    
    // 确保容器有相对定位
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }
  }

  protected initVideoElement(): void {
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'contain';
    
    // 设置初始属性
    this.videoElement.volume = this.options.volume!;
    this.videoElement.muted = this.options.muted!;
    this.videoElement.playbackRate = this.options.playbackRate!;
    
    this.container.appendChild(this.videoElement);
    
    // 设置视频源
    if (this.options.url) {
      this.videoElement.src = this.options.url;
    }
    
    // 自动播放
    if (this.options.autoplay) {
      this.play().catch(console.error);
    }
  }

  protected initEvents(): void {
    this.videoElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.emit('play');
    });
    
    this.videoElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.emit('pause');
    });
    
    this.videoElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.emit('ended');
    });
    
    this.videoElement.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.videoElement.currentTime,
        duration: this.videoElement.duration || 0
      });
    });
    
    this.videoElement.addEventListener('volumechange', () => {
      this.emit('volumechange', {
        volume: this.videoElement.volume,
        muted: this.videoElement.muted
      });
    });
    
    this.videoElement.addEventListener('ratechange', () => {
      this.emit('ratechange', {
        playbackRate: this.videoElement.playbackRate
      });
    });
    
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.emit('ready');
    });
    
    this.videoElement.addEventListener('error', (e) => {
      this.emit('error', e);
    });
  }

  // 基础控制方法
  async play(): Promise<void> {
    try {
      await this.videoElement.play();
      this.isPlaying = true;
    } catch (error) {
      console.error('Play failed:', error);
      throw error;
    }
  }

  pause(): void {
    this.videoElement.pause();
    this.isPlaying = false;
  }

  stop(): void {
    this.pause();
    this.videoElement.currentTime = 0;
  }

  // 音频控制方法
  setVolume(volume: number): void {
    const vol = Math.max(0, Math.min(1, volume));
    this.videoElement.volume = vol;
    this.storage.set('volume', vol);
  }

  getVolume(): number {
    return this.videoElement.volume;
  }

  setMuted(muted: boolean): void {
    this.videoElement.muted = muted;
    this.storage.set('muted', muted);
  }

  getMuted(): boolean {
    return this.videoElement.muted;
  }

  // 视频控制方法
  setPlaybackRate(rate: number): void {
    const validRate = Math.max(0.5, Math.min(4, rate));
    this.videoElement.playbackRate = validRate;
    this.storage.set('playbackRate', validRate);
  }

  getPlaybackRate(): number {
    return this.videoElement.playbackRate;
  }

  setCurrentTime(time: number): void {
    const validTime = Math.max(0, Math.min(this.getDuration(), time));
    this.videoElement.currentTime = validTime;
  }

  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }

  getDuration(): number {
    return this.videoElement.duration || 0;
  }

  // 全屏控制方法
  async enterFullscreen(): Promise<void> {
    try {
      if (this.container.requestFullscreen) {
        await this.container.requestFullscreen();
      } else if ((this.container as any).webkitRequestFullscreen) {
        await (this.container as any).webkitRequestFullscreen();
      } else if ((this.container as any).mozRequestFullScreen) {
        await (this.container as any).mozRequestFullScreen();
      } else if ((this.container as any).msRequestFullscreen) {
        await (this.container as any).msRequestFullscreen();
      }
      this.isFullscreen = true;
      this.emit('fullscreenchange', true);
    } catch (error) {
      console.error('Fullscreen failed:', error);
      throw error;
    }
  }

  async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      this.isFullscreen = false;
      this.emit('fullscreenchange', false);
    } catch (error) {
      console.error('Exit fullscreen failed:', error);
      throw error;
    }
  }

  isFullscreenMode(): boolean {
    return this.isFullscreen;
  }

  // 画中画控制方法
  async enterPip(): Promise<void> {
    try {
      if (this.videoElement.requestPictureInPicture) {
        await this.videoElement.requestPictureInPicture();
        this.isPip = true;
        this.emit('pipchange', true);
      } else {
        throw new Error('Picture-in-Picture not supported');
      }
    } catch (error) {
      console.error('PiP failed:', error);
      throw error;
    }
  }

  async exitPip(): Promise<void> {
    try {
      if (document.exitPictureInPicture) {
        await document.exitPictureInPicture();
        this.isPip = false;
        this.emit('pipchange', false);
      } else {
        throw new Error('Picture-in-Picture not supported');
      }
    } catch (error) {
      console.error('Exit PiP failed:', error);
      throw error;
    }
  }

  isPipMode(): boolean {
    return this.isPip;
  }

  // 销毁方法
  destroy(): void {
    this.removeAllListeners();
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      if (this.videoElement.parentNode) {
        this.videoElement.parentNode.removeChild(this.videoElement);
      }
    }
  }

  // 获取播放状态
  isPaused(): boolean {
    return this.videoElement.paused;
  }

  isVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }
}

export { ZwPlayerCore, PlayerOptions };