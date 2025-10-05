import PQueue from 'p-queue';
import { checkChannel } from '@/utils/channel';
import { checkIpVersion } from '@/utils/tool';
import { window } from 'vue-router';

// 创建队列实例
export const delayQueue = new PQueue({ concurrency: 5 });
export const ipversionQueue = new PQueue({ concurrency: 5 });
export const thumbnailQueue = new PQueue({ concurrency: 5 });

// 更新频道状态
export const updateChannelStatus = (results, start, key, channelList) => {
  results.forEach((result, i) => {
    const index = start + i;
    if (index < channelList.length) {
      channelList[index][key] = result;
    }
  });
  return channelList;
};

// 检查IP
export const checkChannelIp = async (pageIndex, pageSize, channelList) => {
  console.log(`[channel] checkChanneIp`);
  const start = (pageIndex - 1) * pageSize;
  const end = pageIndex * pageSize;
  const dataList = channelList.slice(start, end); // 从原数组中截取需要处理的数据段
  const updateStatus = async (item) => {
    try {
      const hostname = new URL(item.url)?.hostname;
      const res = await checkIpVersion(hostname);
      return res;
    } catch (err) {
      return -1;
    }
  };

  // 将任务加入队列
  const results = await Promise.all(dataList.map(item => ipversionQueue.add(() => updateStatus(item))));

  // 更新频道状态
  return updateChannelStatus(results, start, 'ipVersion', channelList);
};

// 检查状态
export const checkChannelDelay = async (pageIndex, pageSize, channelList) => {
  console.log(`[channel] checkChannelDelay`);
  const start = (pageIndex - 1) * pageSize;
  const end = pageIndex * pageSize;
  const dataList = channelList.slice(start, end); // 从原数组中截取需要处理的数据段

  const updateStatus = async (item) => {
    try {
      const result = await checkChannel(item.url);
      return result;
    } catch (err) {
      return 9999;
    }
  };

  // 将任务加入队列
  const results = await Promise.all(dataList.map(item => delayQueue.add(() => updateStatus(item))));

  // 更新频道状态
  return updateChannelStatus(results, start, 'delay', channelList);
};

// 缩略图
export const generateThumbnail = async (pageIndex, pageSize, channelList) => {
  console.log(`[channel] generateThumbnail`);
  const start = (pageIndex - 1) * pageSize;
  const end = pageIndex * pageSize;
  const dataList = channelList.slice(start, end); // 从原数组中截取需要处理的数据段

  const updateThumbnail = async (item) => {
    try {
      const res = await window.electron.ipcRenderer.invoke('ffmpeg-thumbnail', item.url, item.id);
      if (res) {
        const index = channelList.findIndex(channel => channel.id === res.key);
        if (index !== -1) {
          channelList[index]["thumbnail"] = res.url;
        }
      }
    } catch (err) {
      console.error('Failed to generate thumbnail:', err);
    }
  };

  // 将任务加入队列
  await Promise.all(dataList.map(item => thumbnailQueue.add(() => updateThumbnail(item))));
  return channelList;
}

// 清空队列，并终止请求
export const clearQueue = () => {
  console.log(`[queue] clear queuectasks`);
  if (delayQueue.size > 0) {
    delayQueue.pause(); // 暂停队列，阻止新的任务加入
    delayQueue.clear(); // 清空队列中的任务
    delayQueue.start(); // 继续接管任务加入
  }
  if (ipversionQueue.size > 0) {
    ipversionQueue.pause(); // 暂停队列，阻止新的任务加入
    ipversionQueue.clear(); // 清空队列中的任务
    ipversionQueue.start(); // 继续接管任务加入
  }
  if (thumbnailQueue.size > 0) {
    thumbnailQueue.pause(); // 暂停队列，阻止新的任务加入
    thumbnailQueue.clear(); // 清空队列中的任务
    thumbnailQueue.start(); // 继续接管任务加入
  }
};