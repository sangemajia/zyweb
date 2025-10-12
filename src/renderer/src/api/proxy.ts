import request from '@/utils/request';

export function setT3Proxy(doc) {
  return request({
    url: '/proxy',
    method: 'post',
    data: doc,
  });
}
