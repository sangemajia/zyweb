import PlayerAdapter from '../PlayerAdapter';
import { ZwPlayer } from './zwplayer';
import { PlayerConfig } from './types';

class ZwPlayerAdapter extends PlayerAdapter {
  player: ZwPlayer | null = null;

  barrage = (comments: any, url: string, id: string) => {
    if (!this.player) return;
    // 转换评论格式以适配zwplayer
    const danmakuComments = comments.map((item: any) => ({
      text: item.text,
      time: item.time,
      mode: item.mode === 'scroll' ? 1 : 0,
      color: item.color,
      author: id,
    }));
    this.player.loadDanmaku(danmakuComments);
  };

  create = (options: any) => {
    const config: PlayerConfig = {
      container: options.container,
      url: options.url,
      type: options.type,
      autoplay: options.autoplay !== undefined ? options.autoplay : true,
      volume: options.volume !== undefined ? options.volume : 1,
      muted: options.muted !== undefined ? options.muted : false,
      playbackRate: options.playbackRate !== undefined ? options.playbackRate : 1,
      startTime: options.startTime || 0,
      isLive: options.isLive || false,
      controls: true,
      danmaku: true,
    };

    // 处理清晰度
    if (options.quality && Array.isArray(options.quality) && options.quality.length > 0) {
      // zwplayer暂不支持动态清晰度切换，这里仅记录
      config.quality = options.quality;
    }

    // 处理下一集功能
    if (options.next) {
      config.hasNext = true;
    }

    this.player = new ZwPlayer(config);
    return this.player;
  };

  currentTime = (): number => {
    if (!this.player) return 0;
    return this.player.getCurrentTime();
  };

  destroy = () => {
    if (!this.player) return;
    this.player.destroy();
    this.player = null;
  };

  duration = (): number => {
    if (!this.player) return 0;
    return this.player.getDuration();
  };

  pause = () => {
    if (!this.player) return;
    this.player.pause();
  };

  play = () => {
    if (!this.player) return;
    this.player.play().catch(console.error);
  };

  playNext = (options: any) => {
    if (!this.player) return;
    // 重新创建播放器以播放新视频
    this.destroy();
    const newOptions = {
      ...options,
      container: options.container,
    };
    this.create(newOptions);
  };

  seek = (time: number) => {
    if (!this.player) return;
    this.player.setCurrentTime(time);
  };

  time = (): { currentTime: number; duration: number } => {
    if (!this.player)
      return {
        currentTime: 0,
        duration: 0,
      };
    return {
      currentTime: this.player.getCurrentTime(),
      duration: this.player.getDuration(),
    };
  };

  onTimeUpdate = (callback: any) => {
    if (!this.player) return;
    this.publicListener.timeUpdate = (data: any) => {
      callback({
        currentTime: data.currentTime,
        duration: data.duration,
      });
    };
    this.player.on('timeupdate', this.publicListener.timeUpdate);
  };

  offBarrage = () => {
    // zwplayer暂不支持动态关闭弹幕，这里留空
  };

  offTimeUpdate = () => {
    if (!this.player) return;
    this.player.off('timeupdate', this.publicListener.timeUpdate);
  };

  speed = (speed: number) => {
    if (!this.player) return;
    this.player.setPlaybackRate(speed);
  };

  toggle = () => {
    if (!this.player) return;
    if (this.player.isPaused()) {
      this.player.play().catch(console.error);
    } else {
      this.player.pause();
    }
  };

  volume = (volume: number) => {
    if (!this.player) return;
    this.player.setVolume(volume);
  };
}

export default ZwPlayerAdapter;
