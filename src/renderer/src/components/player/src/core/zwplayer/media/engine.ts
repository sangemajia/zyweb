import { PlayerConfig } from '../../types';

type MediaType = 'mp4' | 'm3u8' | 'flv' | 'mpd' | 'torrent' | 'mpegts' | 'auto';

class MediaEngine {
  protected videoElement: HTMLVideoElement;
  protected config: PlayerConfig;
  protected currentType: MediaType | null = null;
  protected currentPlayer: any = null;

  constructor(videoElement: HTMLVideoElement, config: PlayerConfig) {
    this.videoElement = videoElement;
    this.config = config;
  }

  async load(url: string, type: MediaType = 'auto'): Promise<void> {
    // 如果类型是auto，尝试检测媒体类型
    if (type === 'auto') {
      type = await this.detectMediaType(url);
    }

    // 如果类型没有改变且播放器已存在，直接设置源
    if (this.currentType === type && this.currentPlayer) {
      return this.updateSource(url, type);
    }

    // 销毁当前播放器
    this.destroyCurrentPlayer();

    // 根据类型创建相应的播放器
    switch (type) {
      case 'm3u8':
        return this.loadHls(url);
      case 'flv':
        return this.loadFlv(url);
      case 'mpd':
        return this.loadDash(url);
      case 'torrent':
        return this.loadTorrent(url);
      case 'mpegts':
        return this.loadMpegts(url);
      default:
        // 默认使用原生HTML5视频
        return this.loadNative(url);
    }
  }

  private async detectMediaType(url: string): Promise<MediaType> {
    // 简单的URL后缀检测
    if (url.includes('.m3u8') || url.includes('.m3u')) {
      return 'm3u8';
    }
    if (url.includes('.flv')) {
      return 'flv';
    }
    if (url.includes('.mpd')) {
      return 'mpd';
    }
    if (url.startsWith('magnet:')) {
      return 'torrent';
    }
    if (url.includes('.ts')) {
      return 'mpegts';
    }
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      return 'mp4';
    }
    
    // 默认返回mp4
    return 'mp4';
  }

  private async loadNative(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.videoElement.src = url;
      
      const onLoaded = () => {
        this.videoElement.removeEventListener('loadedmetadata', onLoaded);
        this.videoElement.removeEventListener('error', onError);
        this.currentType = 'mp4';
        resolve();
      };
      
      const onError = () => {
        this.videoElement.removeEventListener('loadedmetadata', onLoaded);
        this.videoElement.removeEventListener('error', onError);
        reject(new Error('Failed to load native video'));
      };
      
      this.videoElement.addEventListener('loadedmetadata', onLoaded);
      this.videoElement.addEventListener('error', onError);
    });
  }

  private async loadHls(url: string): Promise<void> {
    // 检查浏览器是否原生支持HLS
    if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      this.videoElement.src = url;
      this.currentType = 'm3u8';
      return Promise.resolve();
    }

    // 动态导入hls.js
    try {
      const { default: Hls } = await import('hls.js');
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(this.videoElement);
        this.currentPlayer = hls;
        this.currentType = 'm3u8';
        return Promise.resolve();
      } else {
        throw new Error('HLS is not supported');
      }
    } catch (error) {
      console.error('HLS load failed:', error);
      // 回退到原生播放
      return this.loadNative(url);
    }
  }

  private async loadFlv(url: string): Promise<void> {
    try {
      const { default: flvjs } = await import('flv.js');
      if (flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: url,
          isLive: this.config.isLive || false
        });
        flvPlayer.attachMediaElement(this.videoElement);
        flvPlayer.load();
        this.currentPlayer = flvPlayer;
        this.currentType = 'flv';
        return Promise.resolve();
      } else {
        throw new Error('FLV is not supported');
      }
    } catch (error) {
      console.error('FLV load failed:', error);
      throw error;
    }
  }

  private async loadDash(url: string): Promise<void> {
    try {
      const { default: shaka } = await import('shaka-player/dist/shaka-player.compiled');
      if (shaka.Player.isBrowserSupported()) {
        const player = new shaka.Player(this.videoElement);
        await player.load(url);
        this.currentPlayer = player;
        this.currentType = 'mpd';
        return Promise.resolve();
      } else {
        throw new Error('DASH is not supported');
      }
    } catch (error) {
      console.error('DASH load failed:', error);
      throw error;
    }
  }

  private async loadTorrent(url: string): Promise<void> {
    try {
      const WebTorrent = (await import('../../../modules/webtorrent')).default;
      if (WebTorrent.WEBRTC_SUPPORT) {
        const client = new WebTorrent();
        client.add(url, (torrent) => {
          const file = torrent.files.find((file) => 
            file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.webm')
          );
          if (file) {
            file.renderTo(this.videoElement, {
              autoplay: this.config.autoplay || false,
              controls: false,
            });
          }
        });
        this.currentPlayer = client;
        this.currentType = 'torrent';
        return Promise.resolve();
      } else {
        throw new Error('WebTorrent is not supported');
      }
    } catch (error) {
      console.error('Torrent load failed:', error);
      throw error;
    }
  }

  private async loadMpegts(url: string): Promise<void> {
    try {
      const { default: Mpegts } = await import('mpegts.js');
      if (Mpegts.isSupported()) {
        const player = Mpegts.createPlayer({
          type: 'mse',
          url: url,
          isLive: this.config.isLive || false
        });
        player.attachMediaElement(this.videoElement);
        player.load();
        player.play();
        this.currentPlayer = player;
        this.currentType = 'mpegts';
        return Promise.resolve();
      } else {
        throw new Error('MPEG-TS is not supported');
      }
    } catch (error) {
      console.error('MPEG-TS load failed:', error);
      throw error;
    }
  }

  private async updateSource(url: string, type: MediaType): Promise<void> {
    switch (type) {
      case 'm3u8':
        if (this.currentPlayer && this.currentPlayer.loadSource) {
          this.currentPlayer.loadSource(url);
        } else {
          this.videoElement.src = url;
        }
        break;
      case 'flv':
      case 'mpegts':
        if (this.currentPlayer && this.currentPlayer.destroy) {
          this.currentPlayer.destroy();
          // 重新加载
          return this.load(url, type);
        }
        break;
      case 'mpd':
        if (this.currentPlayer && this.currentPlayer.load) {
          await this.currentPlayer.load(url);
        }
        break;
      default:
        this.videoElement.src = url;
    }
  }

  destroy(): void {
    this.destroyCurrentPlayer();
    this.currentType = null;
  }

  private destroyCurrentPlayer(): void {
    if (this.currentPlayer) {
      if (this.currentPlayer.destroy) {
        this.currentPlayer.destroy();
      } else if (this.currentPlayer.unload) {
        this.currentPlayer.unload();
      } else if (this.currentPlayer.detachMedia) {
        this.currentPlayer.detachMedia();
      }
      this.currentPlayer = null;
    }
  }
}

export { MediaEngine, MediaType };