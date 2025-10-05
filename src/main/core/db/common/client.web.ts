import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
// import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema';
import { APP_DB_PATH } from '@main/utils/hiker/path.web';

const DB_PATH = APP_DB_PATH;

// 在Web环境中，我们使用内存数据库
const client = new PGlite();
const db = drizzle({ client, schema });

// const migrateAfterClientReady = async () => {
//   if (!client.ready) await client.waitReady;
//   await migrate(db, {
//     migrationsFolder: join(DB_PATH, '/db/drizzle/'), // set to your drizzle generated path
//     migrationsSchema: join(DB_PATH, '/db/schema'), // set to your schema path
//     migrationsTable: '__migrations',
//   });
// };
// migrateAfterClientReady();

const server = async () => {
  // 在Web环境中，我们不启动服务器
  console.log('Web environment: PGlite server not started');
};

export { client, db, server };