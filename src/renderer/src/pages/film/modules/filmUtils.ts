import { differenceBy } from 'lodash-es';
import { fetchCmsHome, fetchCmsInit, fetchCmsHomeVod, fetchCmsCategory, fetchCmsDetail, fetchCmsSearch } from '@/api/site';

// 获取分类
export const getClassList = async (source, classConfig, active, filterData) => {
  try {
    const res = await fetchCmsHome({ sourceId: source.id });
    if (Array.isArray(res?.class) && res?.class.length > 0) {
      const classDataFormat = [...res.class];
      classDataFormat.unshift({
        type_id: "homeVod",
        type_name: "首页"
      });
      classConfig.data = classDataFormat;
      const classItem = classDataFormat[0];
      active.class = classItem["type_id"];
    } else {
      active.infiniteType = 'categoryError';
    };
    if (Object.keys(res.filters).length > 0) filterData = res.filters;
    return { classConfig, filterData, active };
  } catch (err) {
    console.log(err);
    active.infiniteType = 'networkError';
    return { classConfig, filterData, active };
  }
};

// 获取资源
export const getFilmList = async (source, pagination, active, filmData) => {
  const pg = pagination.pageIndex;
  const t = active.tmpClass || active.class;
  const f = active.filter || {};

  let length = 0;
  try {
    let res = { list: [] };
    if (active.class === 'homeVod') {
      res = await fetchCmsHomeVod({ sourceId: source.id })
    } else {
      res = await fetchCmsCategory({
        sourceId: source.id,
        page: pg || 1,
        tid: t,
        filter: !!f,
        f: JSON.stringify(f)
      });
    };
    if (Array.isArray(res?.list) && res?.list.length > 0) {
      const newFilms = differenceBy(res.list, filmData.list, 'vod_id');
      filmData.list = [...filmData.list, ...newFilms];
      filmData.rawList = [...filmData.rawList, ...res.list];
      pagination.pageIndex++;
      length = newFilms.length;
    } else {
      active.infiniteType = 'networkError';
      length = 0;
    };
    return { filmData, pagination, active, length };
  } catch (err) {
    active.infiniteType = 'networkError';
    console.error(err);
    length = 0;
    return { filmData, pagination, active, length };
  }
};

// 搜索加载数据
export const getSearchList = async (searchTxt, pagination, siteConfig, searchCurrentSite, filmData, active, filterStatus) => {
  let length = 0;
  const pg = pagination.pageIndex;
  const searchGroup = siteConfig.searchGroup;
  let currentSite = searchCurrentSite;

  const index = searchGroup.indexOf(currentSite);
  const isLastSite = index + 1 >= searchGroup.length;

  try {
    // 1. 判断当前搜索的站点是否为空 || 超出站点
    if (!currentSite || index + 1 > searchGroup.length) {
      console.log('[film][search] no site or index out of bounds');
      return { length, searchCurrentSite: currentSite, pagination, filmData, active };
    };

    // 2. 请求数据
    const res = await fetchCmsSearch({ sourceId: currentSite.id, wd: searchTxt, pg: pg === 1 ? null : pg });
    const reSearch = res?.list;

    // 2.1 数据为空
    if (!Array.isArray(reSearch) || reSearch.length === 0) {
      console.log('[film][search] empty search results');
      // 聚搜过程中,如果某个站搜不出来结果，返回1让其他站继续搜索。单搜就返回0终止搜索
      if (isLastSite) {
        length = 0;
      } else {
        length = 1;
        currentSite = searchGroup[index + 1];
      };
      pagination.pageIndex = 1;
      return { length, searchCurrentSite: currentSite, pagination, filmData, active };
    }

    // 2.2 数据去重
    let resultDetail = filterStatus ? reSearch.filter((item) => item?.vod_name.includes(searchTxt)) : reSearch;
    let newFilms = differenceBy(resultDetail, filmData.list, 'vod_id'); // 去重
    if (newFilms.length > 0) {
      newFilms = resultDetail.map(item => ({ ...item, relateSite: currentSite }));
      filmData.list.push(...newFilms);

      length = newFilms.length;
      pagination.pageIndex++;
      return { length, searchCurrentSite: currentSite, pagination, filmData, active };
    } else {
      if (isLastSite) {
        length = 0;
      } else {
        length = 1;
        currentSite = searchGroup[index + 1];
      };
      pagination.pageIndex = 1;
      return { length, searchCurrentSite: currentSite, pagination, filmData, active };
    }
  } catch (err) {
    console.log(err)
    // 聚搜的某一个站点发生错误,返回1让其他站点能继续搜索。只有一个站点进行搜索的时候发生错误就返回0终止搜索
    if (isLastSite) {
      length = 0;
    } else {
      length = 1;
      currentSite = searchGroup[index + 1];
    };
    pagination.pageIndex = 1;
    return { length, searchCurrentSite: currentSite, pagination, filmData, active };
  }
};