// 平台工具类，用于处理 Electron 和 Web 之间的差异
class PlatformUtils {
  // 检查是否在 Electron 环境中运行
  static isElectron(): boolean {
    // 在 Web 环境中始终返回 false
    return false;
  }

  // 检查是否在浏览器环境中运行
  static isWeb(): boolean {
    // 在 Web 环境中始终返回 true
    return true;
  }

  // 获取用户代理字符串
  static getUserAgent(): string {
    return navigator.userAgent;
  }

  // 获取平台信息
  static getPlatform(): string {
    return navigator.platform;
  }

  // 获取浏览器语言
  static getLanguage(): string {
    return navigator.language;
  }

  // 检查是否支持 localStorage
  static supportsLocalStorage(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 检查是否支持 sessionStorage
  static supportsSessionStorage(): boolean {
    try {
      const testKey = '__test__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 检查是否支持 IndexedDB
  static supportsIndexedDB(): boolean {
    return 'indexedDB' in window;
  }

  // 检查是否支持 WebGL
  static supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }

  // 检查是否支持 WebRTC
  static supportsWebRTC(): boolean {
    return !!(window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
  }

  // 检查是否支持通知
  static supportsNotifications(): boolean {
    return 'Notification' in window;
  }

  // 请求通知权限
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.supportsNotifications()) {
      return 'denied';
    }
    
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    return await Notification.requestPermission();
  }

  // 检查是否支持地理位置
  static supportsGeolocation(): boolean {
    return 'geolocation' in navigator;
  }

  // 获取地理位置
  static async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.supportsGeolocation()) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // 检查是否支持媒体设备（摄像头、麦克风）
  static supportsMediaDevices(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // 获取媒体设备列表
  static async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    if (!this.supportsMediaDevices()) {
      return [];
    }
    
    try {
      return await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.error('Failed to enumerate media devices:', error);
      return [];
    }
  }

  // 检查是否支持全屏
  static supportsFullscreen(): boolean {
    return !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
  }

  // 进入全屏模式
  static async requestFullscreen(element: Element): Promise<void> {
    if (!this.supportsFullscreen()) {
      throw new Error('Fullscreen is not supported');
    }
    
    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen mode:', error);
      throw error;
    }
  }

  // 退出全屏模式
  static async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen mode:', error);
      throw error;
    }
  }

  // 检查是否处于全屏模式
  static isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }
}

// 导出平台工具类
export { PlatformUtils };