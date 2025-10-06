// 通用数据去重工具函数

/**
 * 根据指定键值对数组进行去重
 * @param array 原始数组
 * @param compareArray 用于比较的数组
 * @param key 用于比较的键名
 * @returns 去重后的数组
 */
export const differenceByKey = <T>(array: T[], compareArray: T[], key: string): T[] => {
  return array.filter((item: any) => !compareArray.some((compareItem: any) => compareItem[key] === item[key]));
};

/**
 * 根据指定键值对数组进行去重（简化版）
 * @param array 原始数组
 * @param key 用于比较的键名
 * @returns 去重后的数组
 */
export const uniqueByKey = <T>(array: T[], key: string): T[] => {
  const seen = new Set();
  return array.filter((item: any) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * 根据多个键值对数组进行去重
 * @param array 原始数组
 * @param compareArray 用于比较的数组
 * @param keys 用于比较的键名数组
 * @returns 去重后的数组
 */
export const differenceByKeys = <T>(array: T[], compareArray: T[], keys: string[]): T[] => {
  return array.filter((item: any) => {
    return !compareArray.some((compareItem: any) => {
      return keys.every((key) => compareItem[key] === item[key]);
    });
  });
};
