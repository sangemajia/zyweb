// import MpegTs from 'mpegts.js';
const MpegTs = null;
import { publicOptions } from './options';

const createMpegts = (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): any => {
  console.warn('MPEG-TS support disabled due to dependency issues');
  // 使用原生HTML5视频播放
  video.src = url;
  video.load();
  return null;
};

const switchMpegts = (video: HTMLVideoElement, mpegts: any, url: string) => {
  console.warn('MPEG-TS support disabled due to dependency issues');
  // 使用原生HTML5视频播放
  video.src = url;
  video.load();
  return null;
};

const destroyMpegts = (player: any) => {
  if (player?.mpegts) player.mpegts.destroy();
  delete player.mpegts;
};

export { createMpegts, switchMpegts, destroyMpegts };
