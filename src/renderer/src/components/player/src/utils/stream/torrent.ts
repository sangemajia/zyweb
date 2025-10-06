import WebTorrent from '../../modules/webtorrent';
import { publicOptions } from './options';

const createTorrent = (video: HTMLVideoElement, url: string, headers: { [key: string]: string } = {}) => {
  if (WebTorrent.WEBRTC_SUPPORT) {
    const options = publicOptions.webtorrent;
    const client = new WebTorrent(options);
    const torrentId = url;
    client.add(torrentId, (torrent) => {
      const file = torrent.files.find((file) => file.name.endsWith('.mp4') || file.name.endsWith('.mkv'));
      file.renderTo(video, {
        autoplay: true,
        controls: false,
      });
    });
    return client;
  } else {
    console.log('Webtorrent is not supported.');
    return null;
  }
};

const switchTorrent = (video: HTMLVideoElement, client: any, url: string) => {
  // 如果之前有正在加载或播放的任务，先停止并移除
  if (client.torrents.length > 0) {
    client.removeAllListeners();
    client.destroy();
    client = new WebTorrent();
  }

  // 使用新的磁力链接或.torrent文件URL加载种子
  client.add(url, (torrent) => {
    const file = torrent.files.find((file) => file.name.endsWith('.mp4') || file.name.endsWith('.mkv'));

    file.renderTo(video, {
      autoplay: true,
    });
  });
  return client;
};

const destroyTorrent = (player: any) => {
  // player.torrent.remove(player.video.src);
  if (player?.torrent) player.torrent.destroy();
  delete player.torrent;
};

export { createTorrent, switchTorrent, destroyTorrent };
