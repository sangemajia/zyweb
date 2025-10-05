// import dashjs from 'dashjs';
import shaka from 'shaka-player/dist/shaka-player.compiled';
import { publicOptions } from './options';

const createDash = (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
  if (shaka.Player.isBrowserSupported()) {
    const playerShaka = new shaka.Player(video);
    playerShaka.getNetworkingEngine().registerRequestFilter(function (type, request) {
      if (type != shaka.net.NetworkingEngine.RequestType.MANIFEST) {
        return;
      }
      for (const header in headers) {
        request.headers[header] = headers[header];
      }
    });
    playerShaka.load(url);
    const options = publicOptions.dash;
    playerShaka.configure(options);
    return playerShaka;
  } else {
    console.log('shaka is not supported.');
    return null;
  }
};

const switchDash = (video: HTMLVideoElement, dash: any, url: string) => {
  dash.destroy();
  const playerShaka = new shaka.Player(video);
  playerShaka.load(url);
  const options = publicOptions.dash;
  playerShaka.configure(options);
  return playerShaka;
};

const destroyDash = (player: any) => {
  if (player?.mpd) player.mpd.destroy();
  delete player.mpd;
};

export { createDash, switchDash, destroyDash };