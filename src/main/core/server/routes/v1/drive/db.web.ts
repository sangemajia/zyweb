import { FastifyPluginAsync, FastifyRequest } from 'fastify';

import { drive, setting } from './db.service.web';

const API_PREFIX = 'api/v1/drive';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const dbRes = await drive.add(req.body);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.delete(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      await drive.clear();
    } else {
      await drive.remove(ids);
    }
    return {
      code: 0,
      msg: 'ok',
      data: null,
    };
  });
  fastify.put(`/${API_PREFIX}`, async (req: FastifyRequest<{ Body: { [key: string]: any } }>) => {
    const { ids, doc } = req.body;
    const dbRes = await drive.update(ids, doc);
    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
  fastify.get(`/${API_PREFIX}/page`, async (req: FastifyRequest<{ Querystring: { [key: string]: any } }>) => {
    const { page, pageSize, kw } = req.query;
    const dbResPage = await drive.page(parseInt(page), parseInt(pageSize), kw);
    const dbResDefault = await setting.get('defaultDrive');
    const res = {
      data: dbResPage.list,
      total: dbResPage.total,
      default: dbResDefault,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.get(`/${API_PREFIX}/active`, async () => {
    const dbResAll = await drive.active();
    const dbResDefaultId = await setting.get('defaultDrive');
    const dbResDefault = await drive.get(dbResDefaultId as string);

    const res = {
      data: dbResAll,
      default: dbResDefault,
    };
    return {
      code: 0,
      msg: 'ok',
      data: res,
    };
  });
  fastify.put(`/${API_PREFIX}/default/:id`, async (req: FastifyRequest<{ Params: { [key: string]: any } }>) => {
    const { id } = req.params;
    await setting.update(['defaultDrive'], id);

    return {
      code: 0,
      msg: 'ok',
      data: true,
    };
  });
  fastify.get(`/${API_PREFIX}/:id`, async (req: FastifyRequest<{ Params: { [key: string]: any } }>) => {
    const { id } = req.params;
    const dbRes = await drive.get(id);

    return {
      code: 0,
      msg: 'ok',
      data: dbRes,
    };
  });
};

export default api;