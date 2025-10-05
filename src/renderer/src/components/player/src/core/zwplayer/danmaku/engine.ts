import { DanmakuComment } from '../../types';

interface DanmakuOptions {
  fontSize?: number;
  opacity?: number;
  speed?: number;
  fontFamily?: string;
  displayArea?: number;
  maxOverlap?: number;
}

class DanmakuEngine {
  private container: HTMLElement;
  private videoElement: HTMLVideoElement;
  private danmakuContainer: HTMLElement;
  private comments: DanmakuComment[] = [];
  private activeComments: HTMLElement[] = [];
  private isVisible: boolean = true;
  private options: DanmakuOptions;
  private animationFrameId: number = 0;

  constructor(container: HTMLElement, videoElement: HTMLVideoElement, options: DanmakuOptions = {}) {
    this.container = container;
    this.videoElement = videoElement;
    this.options = {
      fontSize: 16,
      opacity: 1,
      speed: 5,
      fontFamily: 'Arial, sans-serif',
      displayArea: 1,
      maxOverlap: 0,
      ...options
    };
    
    this.initDanmakuContainer();
    this.initEvents();
  }

  private initDanmakuContainer(): void {
    this.danmakuContainer = document.createElement('div');
    this.danmakuContainer.style.position = 'absolute';
    this.danmakuContainer.style.top = '0';
    this.danmakuContainer.style.left = '0';
    this.danmakuContainer.style.width = '100%';
    this.danmakuContainer.style.height = '100%';
    this.danmakuContainer.style.pointerEvents = 'none';
    this.danmakuContainer.style.overflow = 'hidden';
    this.danmakuContainer.style.zIndex = '10';
    
    this.container.appendChild(this.danmakuContainer);
  }

  private initEvents(): void {
    // 监听视频时间更新
    this.videoElement.addEventListener('timeupdate', () => {
      if (this.isVisible) {
        this.updateDanmakuPosition();
      }
    });
    
    // 监听视频播放状态变化
    this.videoElement.addEventListener('play', () => {
      if (this.isVisible) {
        this.resumeAnimation();
      }
    });
    
    this.videoElement.addEventListener('pause', () => {
      this.pauseAnimation();
    });
    
    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      this.updateContainerSize();
    });
    resizeObserver.observe(this.container);
  }

  private updateContainerSize(): void {
    // 更新弹幕容器尺寸
    this.danmakuContainer.style.width = `${this.container.clientWidth}px`;
    this.danmakuContainer.style.height = `${this.container.clientHeight}px`;
  }

  load(comments: DanmakuComment[]): void {
    this.comments = [...comments];
    this.clearActiveComments();
  }

  send(comment: DanmakuComment): void {
    this.comments.push(comment);
    if (this.isVisible) {
      this.createDanmakuElement(comment);
    }
  }

  show(): void {
    this.isVisible = true;
    this.danmakuContainer.style.display = 'block';
    this.resumeAnimation();
  }

  hide(): void {
    this.isVisible = false;
    this.danmakuContainer.style.display = 'none';
    this.pauseAnimation();
  }

  private createDanmakuElement(comment: DanmakuComment): HTMLElement {
    const element = document.createElement('div');
    element.textContent = comment.text;
    element.style.position = 'absolute';
    element.style.whiteSpace = 'nowrap';
    element.style.fontSize = `${this.options.fontSize}px`;
    element.style.fontFamily = this.options.fontFamily;
    element.style.color = comment.color || '#ffffff';
    element.style.opacity = `${this.options.opacity}`;
    element.style.pointerEvents = 'none';
    element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
    element.style.zIndex = '10';
    
    // 设置初始位置
    const containerHeight = this.danmakuContainer.clientHeight;
    const containerWidth = this.danmakuContainer.clientWidth;
    
    switch (comment.mode) {
      case 'top':
        element.style.top = `${(containerHeight * 0.2 * Math.random())}px`;
        element.style.left = `${(containerWidth - element.clientWidth) / 2}px`;
        break;
      case 'bottom':
        element.style.bottom = `${(containerHeight * 0.2 * Math.random())}px`;
        element.style.left = `${(containerWidth - element.clientWidth) / 2}px`;
        break;
      case 'scroll':
      default:
        const trackHeight = this.options.fontSize! * 1.5;
        const trackCount = Math.floor(containerHeight / trackHeight);
        const trackIndex = Math.floor(Math.random() * trackCount);
        element.style.top = `${trackIndex * trackHeight}px`;
        element.style.left = `${containerWidth}px`;
        break;
    }
    
    this.danmakuContainer.appendChild(element);
    this.activeComments.push(element);
    
    return element;
  }

  private updateDanmakuPosition(): void {
    const currentTime = this.videoElement.currentTime;
    const containerWidth = this.danmakuContainer.clientWidth;
    
    // 清除已经过期的弹幕
    this.activeComments = this.activeComments.filter(element => {
      const commentTime = parseFloat(element.getAttribute('data-time') || '0');
      if (currentTime - commentTime > 10) { // 弹幕显示10秒后清除
        element.remove();
        return false;
      }
      return true;
    });
    
    // 创建新的弹幕
    const newComments = this.comments.filter(comment => {
      return Math.abs(comment.time - currentTime) < 0.1 && 
             !this.activeComments.some(el => el.textContent === comment.text);
    });
    
    newComments.forEach(comment => {
      const element = this.createDanmakuElement(comment);
      element.setAttribute('data-time', currentTime.toString());
    });
    
    // 更新滚动弹幕位置
    this.activeComments.forEach(element => {
      const mode = element.getAttribute('data-mode') || 'scroll';
      if (mode === 'scroll') {
        const startTime = parseFloat(element.getAttribute('data-time') || '0');
        const progress = (currentTime - startTime) / 5; // 5秒滚动完
        const containerWidth = this.danmakuContainer.clientWidth;
        const elementWidth = element.clientWidth;
        const position = containerWidth - (containerWidth + elementWidth) * progress;
        element.style.left = `${position}px`;
      }
    });
  }

  private resumeAnimation(): void {
    if (!this.animationFrameId) {
      const animate = () => {
        if (this.isVisible && !this.videoElement.paused) {
          this.updateDanmakuPosition();
        }
        this.animationFrameId = requestAnimationFrame(animate);
      };
      this.animationFrameId = requestAnimationFrame(animate);
    }
  }

  private pauseAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  private clearActiveComments(): void {
    this.activeComments.forEach(element => element.remove());
    this.activeComments = [];
  }

  destroy(): void {
    this.pauseAnimation();
    this.clearActiveComments();
    if (this.danmakuContainer && this.danmakuContainer.parentNode) {
      this.danmakuContainer.parentNode.removeChild(this.danmakuContainer);
    }
  }
}

export { DanmakuEngine };