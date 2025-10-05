// 按需导入流处理工具
const publicStream = {
  create: {
    customHls: async (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      const { createHls } = await import('./stream/hls');
      return createHls(video, url, headers);
    },
    customFlv: async (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      const { createFlv } = await import('./stream/flv');
      return createFlv(video, url, headers);
    },
    customTorrent: async (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      const { createTorrent } = await import('./stream/torrent');
      return createTorrent(video, url, headers);
    },
    customDash: async (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      const { createDash } = await import('./stream/dash');
      return createDash(video, url, headers);
    },
    customMpegts: async (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
      const { createMpegts } = await import('./stream/mpegts');
      return createMpegts(video, url, headers);
    },
  },
  switch: {
    customHls: async (video: HTMLVideoElement, hls: any, url: string) => {
      const { switchHls } = await import('./stream/hls');
      return switchHls(video, hls, url);
    },
    customFlv: async (video: HTMLVideoElement, flv: any, url: string) => {
      const { switchFlv } = await import('./stream/flv');
      return switchFlv(video, flv, url);
    },
    customDash: async (video: HTMLVideoElement, dash: any, url: string) => {
      const { switchDash } = await import('./stream/dash');
      return switchDash(video, dash, url);
    },
    customTorrent: async (video: HTMLVideoElement, client: any, url: string) => {
      const { switchTorrent } = await import('./stream/torrent');
      return switchTorrent(video, client, url);
    },
    customMpegts: async (video: HTMLVideoElement, mpegts: any, url: string) => {
      const { switchMpegts } = await import('./stream/mpegts');
      return switchMpegts(video, mpegts, url);
    },
  },
  destroy: {
    customHls: async (player: any) => {
      const { destroyHls } = await import('./stream/hls');
      return destroyHls(player);
    },
    customFlv: async (player: any) => {
      const { destroyFlv } = await import('./stream/flv');
      return destroyFlv(player);
    },
    customDash: async (player: any) => {
      const { destroyDash } = await import('./stream/dash');
      return destroyDash(player);
    },
    customTorrent: async (player: any) => {
      const { destroyTorrent } = await import('./stream/torrent');
      return destroyTorrent(player);
    },
    customMpegts: async (player: any) => {
      const { destroyMpegts } = await import('./stream/mpegts');
      return destroyMpegts(player);
    },
  },
};

export default publicStream;