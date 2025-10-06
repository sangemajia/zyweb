import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { fetchCmsInit, fetchCmsDetail } from '@/api/site';

// 播放
export const playEvent = async (item, siteConfig, active, isVisible, detailFormData, storePlayer) => {
  isVisible.loading = true;

  try {
    let site = item?.relateSite ? item.relateSite : siteConfig.default;

    if (!active.tmpId || active.tmpId !== site.id) {
      await fetchCmsInit({ sourceId: site.id });
      active.tmpId = site.id;
    }

    // folder模式
    if (item.hasOwnProperty('vod_tag') && item['vod_tag'] === 'folder') {
      active.tmpClass = item.vod_id;
      // 重置filmData
      const filmData = { list: [], rawList: [] };
      // 重置分页
      const pagination = { pageIndex: 1 };
      // 重置无限加载
      const infiniteId = +new Date();
      return {
        active,
        filmData,
        pagination,
        infiniteId,
        detailFormData: null,
        isVisible,
      };
    }

    if (!('vod_play_from' in item && 'vod_play_url' in item)) {
      const res = await fetchCmsDetail({ sourceId: site.id, id: item.vod_id });
      const detailItem = res?.list[0];
      if (!detailItem.vod_name) detailItem.vod_name = item.vod_name;
      if (!detailItem.vod_pic) detailItem.vod_pic = item.vod_pic;
      if (!detailItem.vod_id) detailItem.vod_id = item.vod_id;
      item = detailItem;
    }
    console.log('[film][playEvent]', item);

    const playerMode = storePlayer.getSetting.playerMode;
    const doc = {
      info: { ...item, name: item.vod_name },
      ext: { site, setting: storePlayer.setting },
    };
    if (playerMode.type === 'custom') {
      detailFormData = doc;
      isVisible.detail = true;
      return { detailFormData, isVisible, active: null, filmData: null, pagination: null, infiniteId: null };
    } else {
      storePlayer.updateConfig({
        type: 'film',
        status: true,
        data: doc,
      });
      window.electron.ipcRenderer.send('open-win', { action: 'play' });
      return { detailFormData: null, isVisible, active: null, filmData: null, pagination: null, infiniteId: null };
    }
  } catch (err) {
    console.error(`[film][playEvent][error]`, err);
    MessagePlugin.warning(t('pages.chase.reqError'));
    return { detailFormData: null, isVisible, active: null, filmData: null, pagination: null, infiniteId: null };
  } finally {
    isVisible.loading = false;
  }
};
