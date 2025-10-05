import MpegTs from 'mpegts.js';
import { publicOptions } from './options';

const createMpegts = (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}): any => {
  if (MpegTs.isSupported()) {
    const playerMpegts = MpegTs.createPlayer(
      {
        type: 'mp4', // could also be mpegts, m2ts, flv
        isLive: false,
        url,
        // withCredentials: true,
      },
      { referrerPolicy: 'no-referrer', headers },
    );
    playerMpegts.attachMediaElement(video);
    playerMpegts.load();
    playerMpegts.play();
    return playerMpegts;
  } else {
    console.log('mpegts is not supported.');
    return null;
  }
};

const switchMpegts = (video: HTMLVideoElement, mpegts: any, url: string) => {
  mpegts.destroy();
  const playerMpegts = MpegTs.createPlayer({
    type: 'mse', // could also be mpegts, m2ts, flv
    isLive: false,
    url,
  });
  playerMpegts.attachMediaElement(video);
  playerMpegts.load();
  playerMpegts.play();
  return playerMpegts;
};

const destroyMpegts = (player: any) => {
  if (player?.mpegts) player.mpegts.destroy();
  delete player.mpegts;
};

export { createMpegts, switchMpegts, destroyMpegts };