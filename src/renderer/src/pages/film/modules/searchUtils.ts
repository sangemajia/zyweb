import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { fetchCmsInit, fetchCmsSearch } from '@/api/site';

// 搜索组
export const searchGroup = (type: string, defaultConfig:{ [key: string]: string }, siteConfig) => {
  if (!defaultConfig || !defaultConfig?.id ) return [];

  let query = siteConfig.data.filter((item) => item["search"] !== 0);
  if (type === 'site') query = query.filter((item) => item["id"] === defaultConfig["id"]);
  if (type === 'group') query = query.filter((item) => item["group"] === defaultConfig["group"]);
  return query;
};

// 搜索
export const searchEvent = (searchTxt, siteConfig, active) => {
  console.log(`[film] search keyword:${searchTxt}`);
  active.infiniteType = 'noMore';
  // 重置filmData
  const filmData = { list: [], rawList: [] };
  // 重置分页
  const pagination = { ...pagination, pageIndex: 1 };
  // 设置当前搜索站点
  const searchCurrentSite = siteConfig.searchGroup ? siteConfig.searchGroup[0] : null;
  // 重置无限加载
  const infiniteId = +new Date();
  
  return { 
    active, 
    filmData, 
    pagination, 
    searchCurrentSite,
    infiniteId
  };
};