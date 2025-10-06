import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { fetchHistoryData, putHistoryData } from '@/utils/common/chase';
import moment from 'moment';

// 播放
export const playEvent = async (item, iptvConfig, storePlayer, isVisible) => {
  isVisible.loading = true;

  try {
    const site: any = iptvConfig.default;
    const playerMode = storePlayer.getSetting.playerMode;
    if (playerMode.type === 'custom') {
      window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url: item.url });
      // 记录播放记录
      const { id: vod_id, logo: vod_pic, name: vod_name, url: vod_url, group: type_name } = item;
      const historyRes = await fetchHistoryData(site.key, vod_url, ['iptv']);
      const doc = {
        date: moment().unix(),
        type: 'iptv',
        relateId: site.key,
        siteSource: type_name,
        playEnd: false,
        videoId: vod_id,
        videoImage: vod_pic,
        videoName: vod_name,
        videoIndex: `${vod_name}$${vod_url}`,
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
      const { epg, markIp, logo } = iptvConfig.ext;
      storePlayer.updateConfig({
        type: 'iptv',
        status: true,
        data: {
          info: { ...item },
          ext: { epg, markIp, logo, site, setting: storePlayer.setting },
        },
      });
      window.electron.ipcRenderer.send('open-win', { action: 'play' });
    }
  } catch (err) {
    console.error(`[iptv][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
  } finally {
    isVisible.loading = false;
  }
};
