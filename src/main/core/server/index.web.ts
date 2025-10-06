import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';

import { JsonDB, Config } from 'node-json-db';
import { join } from 'path';
import logger from './logger.web';
import { APP_TMP_PATH, APP_LOG_PATH } from './path.web';
import routesV1Modules from './routes/v1/index.web';

// 数据库初始化
const db = new JsonDB(new Config(join(APP_LOG_PATH, 'server.json'), true, false, '/'));

const server = fastify();

// 注册 CORS
server.register(fastifyCors, {
  origin: '*', // 允许所有来源
});

// 注册 multipart
server.register(fastifyMultipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// 注册路由
server.register(routesV1Modules, { prefix: '' });

// 错误处理
server.setErrorHandler((error, request, reply) => {
  console.error('服务错误:', error);
  reply.status(500).send({ error: '服务器内部错误' });
});

// 启动服务器
const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('服务器启动成功，监听端口 3000');
  } catch (err) {
    console.error('服务器启动失败:', err);
    process.exit(1);
  }
};

start();

export default server;
