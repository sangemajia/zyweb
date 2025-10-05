// Web 环境下的请求工具
import axios, { AxiosRequestConfig } from 'axios';

const TIMEOUT = 5000;

const getTimeout = (timeout: number | undefined | null) => {
  const baseTimeout = TIMEOUT;

  if (timeout !== null && timeout !== undefined) {
    return Math.max(baseTimeout, timeout);
  }

  return baseTimeout;
};

const request = async (config: AxiosRequestConfig) => {
  config.timeout = getTimeout(config?.timeout);
  const { data } = await axios.request(config);
  return data;
};

export default request;