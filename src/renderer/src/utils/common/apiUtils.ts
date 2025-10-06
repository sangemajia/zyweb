// 通用API调用工具函数

/**
 * 通用API调用函数，包含错误处理和重试机制
 * @param apiCall API调用函数
 * @param retries 重试次数，默认为3
 * @param delay 重试延迟时间（毫秒），默认为1000
 * @returns API调用结果
 */
export const callApiWithRetry = async <T>(
  apiCall: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= retries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (i < retries) {
        console.warn(`API调用失败，${delay}ms后进行第${i + 1}次重试...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * 批量API调用函数
 * @param apiCalls API调用函数数组
 * @param concurrency 并发数，默认为3
 * @returns API调用结果数组
 */
export const batchApiCalls = async <T>(apiCalls: (() => Promise<T>)[], concurrency: number = 3): Promise<T[]> => {
  const results: T[] = [];

  // 创建并发执行的批次
  for (let i = 0; i < apiCalls.length; i += concurrency) {
    const batch = apiCalls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((apiCall) =>
        callApiWithRetry(apiCall).catch((error) => {
          console.error(`批量API调用失败:`, error);
          return null as unknown as T;
        }),
      ),
    );

    // 过滤掉失败的调用结果
    results.push(...batchResults.filter((result) => result !== null));
  }

  return results;
};

/**
 * 带缓存的API调用函数
 * @param key 缓存键名
 * @param apiCall API调用函数
 * @param ttl 缓存过期时间（毫秒），默认为5分钟
 * @returns API调用结果
 */
export const callApiWithCache = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl: number = 5 * 60 * 1000, // 5分钟
): Promise<T> => {
  // 尝试从缓存获取数据
  const cached = localStorage.getItem(key);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttl) {
      return data;
    }
  }

  // 缓存不存在或已过期，调用API
  const data = await callApiWithRetry(apiCall);

  // 保存到缓存
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );

  return data;
};
