import { fetchIptvActive, fetchChannelPage, delChannel, putIptvDefault } from '@/api/iptv';
import { checkChannel } from '@/utils/channel';
import { checkIpVersion } from '@/utils/tool';

// 获取配置
export const getSetting = async (iptvConfig, active, isVisible) => {
  try {
    const data = await fetchIptvActive();
    if (data.hasOwnProperty('default')) {
      iptvConfig.default = data["default"];
      active.nav = data["default"]["id"];
      active.infiniteType = 'noMore';
    } else {
      active.infiniteType = 'noData';
    }
    if (data.hasOwnProperty('ext')) {
      iptvConfig.ext = data["ext"];
    }
    if (data.hasOwnProperty('data')) {
      iptvConfig.data = data["data"];
    }
  } catch (err) {
    active.infiniteType = 'noData';
  } finally {
    isVisible.lazyload = true;
  }
  return { iptvConfig, active, isVisible };
};

// 获取直播列表
export const getChannel = async (pagination, searchTxt, active, channelList, classList, iptvConfig) => {
  const { pageIndex, pageSize } = pagination;
  const { markIp, delay, thumbnail } = iptvConfig.ext;

  const res = await fetchChannelPage({ page: pageIndex, pageSize, kw:searchTxt, group: active.class });
  if (Array.isArray(res["class"]) && res["class"].length > 0) {
    classList = [...res["class"]];
    classList.unshift({ type_id: '全部', type_name: '全部' });
  };
  if (res.hasOwnProperty('total')) pagination.count = res["total"];

  channelList = [...channelList, ...res.data];

  // 处理延迟检查、缩略图生成和IP检查的逻辑可以在这里添加

  pagination.pageIndex++;
  console.log(`[iptv] load data length: ${res.data.length}`);
  return { channelList, classList, pagination, length: res.data.length };
};