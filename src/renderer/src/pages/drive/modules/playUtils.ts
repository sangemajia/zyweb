import { MessagePlugin } from 'tdesign-vue-next';
import { usePlayStore } from '@/store';
import { fetchAlistFile } from '@/api/drive';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import { base64 } from '@/utils/crypto';
import dayjs from 'dayjs';

// 播放
export const playEvent = async (item, driveConfig, storePlayer, isVisible, driveContent, breadcrumb) => {
  isVisible.loading = true;

  try {
    const site: any = driveConfig.default;
    const res = await fetchAlistFile({ path: item.path, sourceId: site.id });
    const playerMode = storePlayer.getSetting.playerMode;
    if (playerMode.type === 'custom') {
      window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: res.url });

      // 记录播放记录
      const historyRes = await fetchHistoryData(site.key, base64.encode(item.path), ['drive']);
      const doc = {
        date: dayjs().unix(),
        type: 'drive',
        relateId: site.key,
        siteSource: breadcrumb?.at(-1)?.path,
        playEnd: false,
        videoId: base64.encode(item.path),
        videoImage: item.thumb,
        videoName: res.name,
        videoIndex: `${res.name}${res.url}`,
        watchTime: 0,
        duration: 0,
        skipTimeInStart: 0,
        skipTimeInEnd: 0,
      };

      if (historyRes.code === 0 && historyRes.status) {
        putHistoryData('put', doc, historyRes.data.id);
      } else {
        putHistoryData('add', doc, null);
      }
    } else {
      storePlayer.updateConfig({
        type: 'drive',
        status: true,
        data: {
          info: {
            id: base64.encode(item.path),
            name: res.name,
            url: res.url,
            thumb: item.thumb,
            remark: res.remark,
            path: breadcrumb?.at(-1)?.path,
          },
          ext: { files: [...driveContent], site: driveConfig.default },
        },
      });
      window.electron.ipcRenderer.send('open-win', { action: 'play' });
    }
  } catch (err) {
    console.error(`[film][playEvent][error]`, err);
  } finally {
    isVisible.loading = false;
  }
};
