// 通用分页工具函数

// 分页结果类型
export interface PaginationResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  [key: string]: any;
}

/**
 * 通用分页数据获取函数
 * @param fetchData 获取数据的函数
 * @param pagination 分页参数
 * @param existingData 已存在的数据数组
 * @param uniqueKey 用于去重的唯一键名
 * @returns 分页结果
 */
export const fetchPaginatedData = async <T>(
  fetchData: (params: PaginationParams) => Promise<{ data: T[]; total?: number }>,
  pagination: { pageIndex: number; pageSize: number; count?: number },
  existingData: T[],
  uniqueKey: string = 'id',
): Promise<PaginationResult<T>> => {
  const params: PaginationParams = {
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  };

  try {
    const res = await fetchData(params);
    const newData = res.data || [];
    const total = res.total || 0;

    // 简单去重实现
    const filteredData = newData.filter(
      (item: any) => !existingData.some((existing: any) => existing[uniqueKey] === item[uniqueKey]),
    );

    const hasMore = total > pagination.pageIndex * pagination.pageSize;

    pagination.pageIndex++;
    if (total > 0) {
      pagination.count = total;
    }

    return {
      data: filteredData,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('分页数据获取失败:', error);
    return {
      data: [],
      total: 0,
      hasMore: false,
    };
  }
};

/**
 * 重置分页状态
 * @param pagination 分页对象
 * @param initialPage 初始页码，默认为1
 */
export const resetPagination = (
  pagination: { pageIndex: number; pageSize: number; count?: number },
  initialPage: number = 1,
): void => {
  pagination.pageIndex = initialPage;
  pagination.count = undefined;
};
