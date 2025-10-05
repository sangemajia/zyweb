import { fetchDriveActive, putAlistInit, fetchAlistDir, fetchAlistFile } from '@/api/drive';

// 获取配置
export const getSetting = async (driveConfig, active) => {
  try {
    const data = await fetchDriveActive();
    if (data.hasOwnProperty('default') && Object.keys(data["default"]).length > 0) {
      driveConfig.default = data["default"];
      active.nav = data["default"]["id"];
      driveConfig.default.startPage = driveConfig.default.startPage ? driveConfig.default.startPage : '/';
    } else {
      active.infiniteType = 'noData';
    }
    if (Array.isArray(data['data']) && data['data'].length > 0) {
      driveConfig.data = data["data"];
    } else {
      active.infiniteType = 'noData';
    }
  } catch (err) {
    console.error(err);
  }
  return { driveConfig, active };
};

// 初始化云盘
export const initCloud = async (driveConfig, isVisible, getCloudFolder) => {
  isVisible.lazyload = true;
  try {
    const { startPage, id } = driveConfig.default;
    await putAlistInit({ sourceId: id });
    await getCloudFolder({ path: startPage});
  } finally {
    isVisible.lazyload = false;
  }
};

// 格式化面包屑
export const formatBreadcrumb = (path: string) => {
  // 确保路径以 '/' 开头
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // 移除路径末尾的 '/'
  if (path !== '/' && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 分割路径为片段数组
  const segments = path.split('/').filter(Boolean);

  // 如果没有片段，则返回包含根路径的数组
  if (segments.length === 0) {
    return [{ name: '全部文件', path: '/' }];
  }

  // 递归构建路径数组
  const pathsArray: any[] = [];
  let currentPath = '';
  // 添加根路径到数组的最后
  pathsArray.push({ name: '全部文件', path: '/' });
  for (const segment of segments) {
    currentPath = `${currentPath}/${segment}`;
    pathsArray.push({ name: segment, path: currentPath });
  }

  // 返回构建的路径数组
  return pathsArray;
}

// 获取云文件
export const getCloudFile = async (item, driveConfig, isVisible, breadcrumb) => {
  isVisible.lazyload = true;

  try {
    const { id } = driveConfig.default;
    const res = await fetchAlistFile({ path: item.path, sourceId: id });
    const tid = item.path;
    const index = tid.indexOf('/', 1);
    const path = tid.substring(index);
    return { res, path };
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    isVisible.lazyload = false;
  }
};

// 获取云文件夹
export const getCloudFolder = async (item, driveConfig, isVisible, driveContent, breadcrumb, formatBreadcrumb) => {
  isVisible.lazyload = true;

  try {
    const { id } = driveConfig.default;
    const res = await fetchAlistDir({ path: item.path, sourceId: id });
    driveContent = [...res.list];
    breadcrumb = formatBreadcrumb(item.path);
    return { driveContent, breadcrumb };
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    isVisible.lazyload = false;
  }
};