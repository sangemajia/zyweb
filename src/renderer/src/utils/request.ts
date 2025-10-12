import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';

import { getPinia } from '@/utils/tool';

// 基础URL配置
// 在一体化部署模式下，前端和后端运行在同一域名下，使用相对路径
// 在前后端分离部署模式下，使用环境变量配置的API地址
const baseURL = String(
  import.meta.env.DEV ? '/api' : '/api'
);
const TIMEOUT = 5000;

// 获取超时时间配置
const getTimeout = (timeout: number | undefined | null) => {
  const baseTimeout = TIMEOUT;

  if (timeout !== null && timeout !== undefined) {
    return Math.max(baseTimeout, timeout);
  }

  const dbTimeout = getPinia('setting', 'timeout');
  if (dbTimeout) {
    return Math.max(baseTimeout, dbTimeout);
  }

  return baseTimeout;
};

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  withCredentials: false,
});

// 请求拦截器
service.interceptors.request.use(
  // @ts-ignore
  (config: AxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 基础请求函数
const request = async (config: AxiosRequestConfig) => {
  config.timeout = getTimeout(config?.timeout);
  const res = await service.request(config);
  if (res.data.code === 0 && res.status === 200) {
    return res.data.data;
  } else {
    throw new Error(res.data.msg || '请求失败');
  }
};

// 完整响应请求函数
const requestComplete: any = async (config: AxiosRequestConfig) => {
  config.timeout = getTimeout(config?.timeout);
  const { status, data, headers } = await service.request(config);
  return {
    status,
    data,
    headers,
  };
};

// SSE请求函数
const requestSse = (config) => {
  config.timeout = getTimeout(config?.timeout);
  const { success, fail, complete } = config?.options || {};
  const url = `${baseURL}${config.url}`;
  const method = config?.method?.toUpperCase() || 'GET';
  const headers = config?.headers || {};
  const data = config?.data || {};
  const timeout = config?.timeout || TIMEOUT;
  const ctrl = config?.ctrl || new AbortController();

  fetchEventSource(url, {
    method,
    headers,
    timeout,
    body: JSON.stringify(data),
    signal: ctrl.signal,
    onopen(response) {
      if (!response.ok) {
        const err = new Error('请求失败');
        complete?.(false, err.message);
        fail?.(err);
      }
    },
    onmessage(event) {
      try {
        let response: any = event.data;
        if (response === '[DONE]') {
          complete?.(true);
          return;
        } else {
          response = JSON.parse(response);
        }

        const choices = response?.choices?.[0];
        if (choices?.finish_reason === 'stop') {
          complete?.(true);
          return;
        } else {
          success?.(choices);
        }
      } catch (err: any) {
        console.error('解析数据失败:', err);
        complete?.(false, err.message);
        fail?.(err);
      }
    },
    onerror(err) {
      console.error('捕获到错误:', err);
      complete?.(false, err.message);
      fail?.(err);
    },
  });
};

export { 
  request as default, 
  requestComplete, 
  requestSse
};
