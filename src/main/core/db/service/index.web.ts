// Web 环境下的数据库服务集合
import { drive, setting } from '../../server/routes/v1/drive/db.service.web';
import { history, site, analyze, iptv } from '../../server/routes/v1/history/db.service.web';

// 为了保持接口一致性，我们导出相同的对象
export { drive, setting, history, site, analyze, iptv };