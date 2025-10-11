import request from '@/utils/request';

// 获取部署模式
export function fetchDeploymentMode() {
  return request.get('/api/v1/system/deployment-mode');
}