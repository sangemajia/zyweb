import Hls from 'hls.js';
import { publicOptions } from './options';

const createHls = (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): Hls | null => {
  if (Hls.isSupported()) {
    const options: any = Object.assign({}, { ...publicOptions.hls });
    if (Object.keys(headers).length > 0) {
      options.xhrSetup = function (xhr: any, _url: string) {
        // xhr.withCredentials = true; // do send cookies
        for (const key in headers) {
          xhr.setRequestHeader(key, headers[key]);
        }
      };
    }
    const hls = new Hls(options);
    hls.loadSource(url);
    hls.attachMedia(video);
    return hls;
  } else {
    console.log('Hls is not supported.');
    return null;
  }
};

const switchHls = (video: HTMLVideoElement, hls: any, url: string): Hls => {
  hls.stopLoad();
  hls.detachMedia();

  // 重新加载新的M3U8 URL
  hls.loadSource(url);
  hls.attachMedia(video);

  // 等待新流解析完成并开始播放
  hls.once(Hls.Events.MANIFEST_PARSED, () => {
    video.play();
  });
  return hls;
};

const destroyHls = (player: any) => {
  if (player?.hls) player.hls.destroy();
  delete player.hls;
};

export { createHls, switchHls, destroyHls };