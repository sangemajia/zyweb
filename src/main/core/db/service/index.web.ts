// 在Web环境中，我们导出模拟的服务
import {
  analyze,
  drive,
  history,
  setting,
  iptv,
  channel,
  star,
  site,
  db,
} from '../../server/routes/v1/drive/db.service.web';

export { history, setting, star, site, iptv, channel, analyze, drive, db };
