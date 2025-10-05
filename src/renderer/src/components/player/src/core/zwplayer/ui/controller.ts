import { ZwPlayer } from '../zwplayer';
import { PlayerConfig } from '../../types';

interface ControlOptions {
  showControls?: boolean;
  autoHide?: boolean;
  autoHideTime?: number;
  themeColor?: string;
}

class UIController {
  private player: ZwPlayer;
  private container: HTMLElement;
  private controlBar: HTMLElement;
  private controls: { [key: string]: HTMLElement } = {};
  private options: ControlOptions;
  private isMouseOver: boolean = false;
  private hideTimeout: number = 0;

  constructor(player: ZwPlayer, container: HTMLElement, options: ControlOptions = {}) {
    this.player = player;
    this.container = container;
    this.options = {
      showControls: true,
      autoHide: true,
      autoHideTime: 3000,
      themeColor: '#00a1ff',
      ...options
    };
    
    if (this.options.showControls) {
      this.initControlBar();
      this.initControls();
      this.initEvents();
    }
  }

  private initControlBar(): void {
    this.controlBar = document.createElement('div');
    this.controlBar.className = 'cp-control-bar';
    this.controlBar.style.position = 'absolute';
    this.controlBar.style.bottom = '0';
    this.controlBar.style.left = '0';
    this.controlBar.style.right = '0';
    this.controlBar.style.height = '40px';
    this.controlBar.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.controlBar.style.display = 'flex';
    this.controlBar.style.alignItems = 'center';
    this.controlBar.style.padding = '0 10px';
    this.controlBar.style.zIndex = '20';
    this.controlBar.style.transition = 'opacity 0.3s';
    
    this.container.appendChild(this.controlBar);
  }

  private initControls(): void {
    // 播放/暂停按钮
    this.controls.play = this.createButton('play', '▶', () => {
      if (this.player.isPaused()) {
        this.player.play();
      } else {
        this.player.pause();
      }
    });
    
    // 音量控制
    this.controls.volume = this.createVolumeControl();
    
    // 时间显示
    this.controls.time = this.createTimeDisplay();
    
    // 进度条
    this.controls.progress = this.createProgressControl();
    
    // 全屏按钮
    this.controls.fullscreen = this.createButton('fullscreen', '⛶', () => {
      if (this.player.isFullscreenMode()) {
        this.player.exitFullscreen();
      } else {
        this.player.enterFullscreen();
      }
    });
    
    // 画中画按钮
    this.controls.pip = this.createButton('pip', 'PIP', () => {
      if (this.player.isPipMode()) {
        this.player.exitPip();
      } else {
        this.player.enterPip();
      }
    });
    
    // 将控件添加到控制栏
    Object.values(this.controls).forEach(control => {
      this.controlBar.appendChild(control);
    });
  }

  private createButton(className: string, text: string, onClick: () => void): HTMLElement {
    const button = document.createElement('button');
    button.className = `cp-button cp-${className}`;
    button.textContent = text;
    button.style.background = 'none';
    button.style.border = 'none';
    button.style.color = 'white';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';
    button.style.padding = '5px';
    button.style.margin = '0 5px';
    button.style.minWidth = '30px';
    button.style.height = '30px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    
    button.addEventListener('click', onClick);
    
    return button;
  }

  private createVolumeControl(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cp-volume-control';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.margin = '0 10px';
    
    const button = this.createButton('volume', '🔊', () => {
      this.player.setMuted(!this.player.getMuted());
    });
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = this.player.getVolume().toString();
    slider.style.width = '60px';
    slider.style.margin = '0 5px';
    
    slider.addEventListener('input', () => {
      this.player.setVolume(parseFloat(slider.value));
    });
    
    container.appendChild(button);
    container.appendChild(slider);
    
    // 保存引用以便更新
    this.controls.volumeButton = button;
    this.controls.volumeSlider = slider;
    
    return container;
  }

  private createTimeDisplay(): HTMLElement {
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'cp-time-display';
    timeDisplay.style.color = 'white';
    timeDisplay.style.fontSize = '12px';
    timeDisplay.style.margin = '0 10px';
    timeDisplay.style.whiteSpace = 'nowrap';
    timeDisplay.textContent = '00:00 / 00:00';
    
    return timeDisplay;
  }

  private createProgressControl(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'cp-progress-container';
    container.style.flex = '1';
    container.style.margin = '0 10px';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    
    const progress = document.createElement('div');
    progress.className = 'cp-progress';
    progress.style.width = '100%';
    progress.style.height = '4px';
    progress.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    progress.style.position = 'relative';
    progress.style.cursor = 'pointer';
    
    const buffer = document.createElement('div');
    buffer.className = 'cp-progress-buffer';
    buffer.style.position = 'absolute';
    buffer.style.top = '0';
    buffer.style.left = '0';
    buffer.style.height = '100%';
    buffer.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
    buffer.style.width = '0%';
    
    const played = document.createElement('div');
    played.className = 'cp-progress-played';
    played.style.position = 'absolute';
    played.style.top = '0';
    played.style.left = '0';
    played.style.height = '100%';
    played.style.backgroundColor = this.options.themeColor;
    played.style.width = '0%';
    
    const handle = document.createElement('div');
    handle.className = 'cp-progress-handle';
    handle.style.position = 'absolute';
    handle.style.top = '-6px';
    handle.style.left = '0%';
    handle.style.width = '16px';
    handle.style.height = '16px';
    handle.style.backgroundColor = 'white';
    handle.style.borderRadius = '50%';
    handle.style.transform = 'translateX(-50%)';
    handle.style.display = 'none';
    
    progress.appendChild(buffer);
    progress.appendChild(played);
    progress.appendChild(handle);
    
    // 进度条事件
    progress.addEventListener('click', (e) => {
      const rect = progress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const duration = this.player.getDuration();
      const time = duration * percent;
      this.player.setCurrentTime(time);
    });
    
    progress.addEventListener('mouseenter', () => {
      handle.style.display = 'block';
    });
    
    progress.addEventListener('mouseleave', () => {
      handle.style.display = 'none';
    });
    
    progress.addEventListener('mousemove', (e) => {
      const rect = progress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      handle.style.left = `${percent * 100}%`;
    });
    
    // 保存引用
    this.controls.progressBuffer = buffer;
    this.controls.progressPlayed = played;
    this.controls.progressHandle = handle;
    
    container.appendChild(progress);
    return container;
  }

  private initEvents(): void {
    // 播放状态变化
    this.player.on('play', () => {
      if (this.controls.play) {
        this.controls.play.textContent = '⏸';
      }
    });
    
    this.player.on('pause', () => {
      if (this.controls.play) {
        this.controls.play.textContent = '▶';
      }
    });
    
    // 时间更新
    this.player.on('timeupdate', ({ currentTime, duration }) => {
      this.updateTimeDisplay(currentTime, duration);
      this.updateProgress(currentTime, duration);
    });
    
    // 音量变化
    this.player.on('volumechange', ({ volume, muted }) => {
      this.updateVolumeDisplay(volume, muted);
    });
    
    // 全屏变化
    this.player.on('fullscreenchange', (isFullscreen) => {
      if (this.controls.fullscreen) {
        this.controls.fullscreen.textContent = isFullscreen ? '⛶' : '⛶';
      }
    });
    
    // 画中画变化
    this.player.on('pipchange', (isPip) => {
      if (this.controls.pip) {
        this.controls.pip.textContent = isPip ? 'PIP' : 'PIP';
      }
    });
    
    // 鼠标事件用于自动隐藏控制栏
    if (this.options.autoHide) {
      this.container.addEventListener('mouseenter', () => {
        this.isMouseOver = true;
        this.showControls();
        this.clearHideTimeout();
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.isMouseOver = false;
        this.setHideTimeout();
      });
      
      this.container.addEventListener('mousemove', () => {
        this.showControls();
        this.clearHideTimeout();
        this.setHideTimeout();
      });
      
      // 初始隐藏
      this.setHideTimeout();
    }
  }

  private updateTimeDisplay(currentTime: number, duration: number): void {
    if (this.controls.time) {
      const currentFormatted = this.formatTime(currentTime);
      const durationFormatted = this.formatTime(duration);
      this.controls.time.textContent = `${currentFormatted} / ${durationFormatted}`;
    }
  }

  private updateProgress(currentTime: number, duration: number): void {
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      if (this.controls.progressPlayed) {
        this.controls.progressPlayed.style.width = `${percent}%`;
      }
      if (this.controls.progressHandle) {
        this.controls.progressHandle.style.left = `${percent}%`;
      }
    }
  }

  private updateVolumeDisplay(volume: number, muted: boolean): void {
    if (this.controls.volumeButton) {
      this.controls.volumeButton.textContent = muted ? '🔇' : volume === 0 ? '🔇' : '🔊';
    }
    if (this.controls.volumeSlider) {
      (this.controls.volumeSlider as HTMLInputElement).value = muted ? '0' : volume.toString();
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private showControls(): void {
    if (this.controlBar) {
      this.controlBar.style.opacity = '1';
    }
  }

  private hideControls(): void {
    if (this.controlBar && !this.isMouseOver) {
      this.controlBar.style.opacity = '0';
    }
  }

  private setHideTimeout(): void {
    this.clearHideTimeout();
    this.hideTimeout = window.setTimeout(() => {
      this.hideControls();
    }, this.options.autoHideTime);
  }

  private clearHideTimeout(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = 0;
    }
  }

  destroy(): void {
    this.clearHideTimeout();
    if (this.controlBar && this.controlBar.parentNode) {
      this.controlBar.parentNode.removeChild(this.controlBar);
    }
  }
}

export { UIController, ControlOptions };