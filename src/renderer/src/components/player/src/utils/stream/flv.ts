import flvjs from 'flv.js';
import { publicOptions } from './options';

const createFlv = (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): any => {
  if (flvjs.isSupported()) {
    const flvPlayer = flvjs.createPlayer(
      Object.assign({}, { ...publicOptions.flv.mediaDataSource }, { url: url }),
      Object.assign({}, { ...publicOptions.flv.optionalConfig }, headers),
    );
    flvPlayer.attachMediaElement(video);
    flvPlayer.load();
    return flvPlayer;
  } else {
    console.log('flvjs is not supported.');
    return null;
  }
};

const switchFlv = (video: HTMLVideoElement, flv: any, url: string) => {
  flv.pause();
  flv.unload();
  flv.detachMediaElement();
  flv.destroy();
  flv = flvjs.createPlayer(
    Object.assign({}, publicOptions.flv.mediaDataSource || {}, {
      url: url,
    }),
    publicOptions.flv.optionalConfig || {},
  );
  flv.attachMediaElement(video);
  flv.load();
  return flv;
};

const destroyFlv = (player: any) => {
  if (player?.flv) player.flv.destroy();
  delete player.flv;
};

export { createFlv, switchFlv, destroyFlv };