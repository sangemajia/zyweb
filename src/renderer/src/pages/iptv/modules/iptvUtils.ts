import { fetchIptvActive, fetchChannelPage, delChannel, putIptvDefault } from '@/api/iptv';
import { checkChannel } from '@/utils/channel';
import { checkIpVersion } from '@/utils/tool';
import { fetchPaginatedData } from '@/utils/common/paginationUtils';

// 获取配置
export const getSetting = async (iptvConfig, active, isVisible) => {
  try {
    const data = await fetchIptvActive();
    if (data.hasOwnProperty('default')) {
      iptvConfig.default = data['default'];
      active.nav = data['default']['id'];
      active.infiniteType = 'noMore';
    } else {
      active.infiniteType = 'noData';
    }
    if (data.hasOwnProperty('ext')) {
      iptvConfig.ext = data['ext'];
    }
    if (data.hasOwnProperty('data')) {
      iptvConfig.data = data['data'];
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
  const { markIp, delay, thumbnail } = iptvConfig.ext;

  const fetchData = async (params: any) => {
    return await fetchChannelPage({
      page: params.page,
      pageSize: params.pageSize,
      kw: searchTxt,
      group: active.class,
    });
  };

  const result = await fetchPaginatedData(
    fetchData,
    pagination,
    channelList,
    'id', // 假设频道ID为'id'，根据实际数据结构调整
  );

  // 处理分类列表
  if (Array.isArray(result.data) && result.data.length > 0) {
    // 这里可以根据实际API返回的数据结构处理分类
    // 暂时保留原有逻辑，实际项目中需要根据API返回的数据结构调整
  }

  channelList = [...channelList, ...result.data];

  // 处理延迟检查、缩略图生成和IP检查的逻辑可以在这里添加

  console.log(`[iptv] load data length: ${result.data.length}`);
  return { channelList, classList, pagination, length: result.data.length };
};
