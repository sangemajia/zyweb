import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { pathToFileURL } from 'url';
import logger from '@main/core/logger';
import puppeteerInElectron from '@main/utils/sniffer';
import {
  createDir,
  deleteDir,
  deleteFile,
  saveFile,
  fileExist,
  fileSize,
  fileState,
  readFile,
} from '@main/utils/hiker/file';
import { APP_TMP_PATH } from '@main/utils/hiker/path';

const execAsync = promisify(exec);

const API_PREFIX = 'api/v1/webbridge';

const api: FastifyPluginAsync = async (fastify): Promise<void> => {
  // IPC消息处理端点
  fastify.post(
    `/${API_PREFIX}/ipc/:channel`,
    async (
      req: FastifyRequest<{
        Params: { channel: string };
        Body: any;
      }>,
    ) => {
      const { channel } = req.params;
      const args = req.body;

      logger.info(`[WebBridge][IPC] channel: ${channel}, args: ${JSON.stringify(args)}`);

      try {
        // 根据频道处理不同的IPC消息
        switch (channel) {
          // DNS更新
          case 'update-dns':
            // 这个功能在Web版本中不适用，直接返回成功
            return { code: 0, msg: 'ok', data: true };

          // 检查更新
          case 'check-for-update':
            // 这个功能在Web版本中不适用，直接返回成功
            return { code: 0, msg: 'ok', data: true };

          // 默认情况，返回成功
          default:
            return { code: 0, msg: 'ok', data: true };
        }
      } catch (error: any) {
        logger.error(`[WebBridge][IPC] Error processing channel ${channel}:`, error);
        return { code: -1, msg: error.message, data: null };
      }
    },
  );

  // 文件管理端点
  fastify.post(`/${API_PREFIX}/file/manage`, async (req: FastifyRequest<{ Body: any }>) => {
    const { action, config } = req.body;

    logger.info(`[WebBridge][File] action: ${action}, config: ${JSON.stringify(config)}`);

    try {
      const rm = async (config: any) => {
        const { path } = config;
        const pathExists = await fileExist(path);
        if (!pathExists) return false;
        if ((await fileState(path)) === 'file') return await deleteFile(path);
        else if ((await fileState(path)) === 'dir') return await deleteDir(path);
        return false;
      };

      const mk = async (config: any) => {
        const { path } = config;
        const pathExists = await fileExist(path);
        if (pathExists) return false;
        return await createDir(path);
      };

      const write = async (config: any) => {
        const { path, content } = config;
        const pathExists = await fileExist(path);
        if (pathExists && (await fileState(path)) !== 'file') return false;
        return await saveFile(path, content);
      };

      const read = async (config: any) => {
        const { path } = config;
        const pathExists = await fileExist(path);
        if (pathExists) {
          if ((await fileState(path)) === 'file') return await readFile(path);
          else if ((await fileState(path)) === 'dir') return [];
        }
        return '';
      };

      const size = async (config: any) => {
        const { path } = config;
        const pathExists = await fileExist(path);
        if (!pathExists) return 0;
        const seize = (await fileSize(path)) / 1024 / 1024;
        return seize.toFixed(2);
      };

      const state = async (config: any) => {
        const { path } = config;
        const pathExists = await fileExist(path);
        if (!pathExists) return 'unknown';
        return await fileState(path);
      };

      const exist = async (config: any) => {
        const { path } = config;
        return await fileExist(path);
      };

      const methodMap: any = { rm, mk, write, read, size, state, exist };
      if (!methodMap[action]) {
        return { code: -1, msg: 'Unknown action', data: null };
      }

      const result = await methodMap[action](config);
      return { code: 0, msg: 'ok', data: result };
    } catch (error: any) {
      logger.error(`[WebBridge][File] Error processing action ${action}:`, error);
      return { code: -1, msg: error.message, data: null };
    }
  });

  // 文件读取端点
  fastify.get(`/${API_PREFIX}/file/read`, async (req: FastifyRequest<{ Querystring: { path: string } }>) => {
    const { path } = req.query;

    try {
      const pathExists = await fileExist(path);
      if (pathExists) {
        if ((await fileState(path)) === 'file') {
          const content = await readFile(path);
          return { code: 0, msg: 'ok', data: content };
        } else if ((await fileState(path)) === 'dir') {
          return { code: 0, msg: 'ok', data: [] };
        }
      }
      return { code: -1, msg: 'File not found', data: null };
    } catch (error: any) {
      logger.error(`[WebBridge][File] Error reading file ${path}:`, error);
      return { code: -1, msg: error.message, data: null };
    }
  });

  // 文件写入端点
  fastify.post(`/${API_PREFIX}/file/write`, async (req: FastifyRequest<{ Body: any }>) => {
    const { path, content } = req.body;

    try {
      const pathExists = await fileExist(path);
      if (pathExists && (await fileState(path)) !== 'file') {
        return { code: -1, msg: 'Path exists and is not a file', data: null };
      }

      const result = await saveFile(path, content);
      return { code: 0, msg: 'ok', data: result };
    } catch (error: any) {
      logger.error(`[WebBridge][File] Error writing file ${path}:`, error);
      return { code: -1, msg: error.message, data: null };
    }
  });

  // 文件大小端点
  fastify.get(`/${API_PREFIX}/file/size`, async (req: FastifyRequest<{ Querystring: { path: string } }>) => {
    const { path } = req.query;

    try {
      const pathExists = await fileExist(path);
      if (!pathExists) {
        return { code: -1, msg: 'File not found', data: 0 };
      }

      const size = (await fileSize(path)) / 1024 / 1024;
      const sizeToMb = size.toFixed(2);
      return { code: 0, msg: 'ok', data: sizeToMb };
    } catch (error: any) {
      logger.error(`[WebBridge][File] Error getting file size for ${path}:`, error);
      return { code: -1, msg: error.message, data: 0 };
    }
  });

  // FFmpeg检查端点
  fastify.get(`/${API_PREFIX}/ffmpeg/check`, async () => {
    const timeout = globalThis.variable?.timeout || 5000;

    try {
      const { stdout, stderr } = await execAsync('ffmpeg -version', { timeout });
      if (stdout.includes('version')) {
        logger.info(`[WebBridge][FFmpeg] info output:`, stdout);
        return { code: 0, msg: 'ok', data: true };
      }

      if (stderr) {
        logger.error(`[WebBridge][FFmpeg] err output:`, stderr);
      }

      return { code: 0, msg: 'ok', data: false };
    } catch (err: any) {
      logger.error(`[WebBridge][FFmpeg] err:`, err);
      return { code: -1, msg: err.message, data: false };
    }
  });

  // FFmpeg缩略图生成端点
  fastify.post(
    `/${API_PREFIX}/ffmpeg/thumbnail`,
    async (req: FastifyRequest<{ Body: { url: string; id: string } }>) => {
      const { url, id } = req.body;
      const ua = globalThis.variable?.ua || 'Mozilla/5.0';
      const timeout = globalThis.variable?.timeout || 5000;
      const basePath = join(APP_TMP_PATH, 'thumbnail');

      try {
        if (await fileExist(basePath)) {
          if ((await fileState(basePath)) !== 'dir') await deleteDir(basePath);
        } else {
          await createDir(basePath);
        }

        const formatPath = join(basePath, `${id}.jpg`);

        const ffmpegCommand = 'ffmpeg';
        const inputOptions = ['-user_agent', `"${ua}"`, '-i', `"${url}"`];
        const outputOptions = ['-y', '-frames:v', '1', '-q:v', '20', '-update', '1'];
        const command = [ffmpegCommand, ...inputOptions, ...outputOptions, `"${formatPath}"`].join(' ');
        logger.info(`[WebBridge][FFmpeg] command: ${command}`);

        const { stdout, stderr } = await execAsync(command, { timeout });
        logger.info(`[WebBridge][FFmpeg] output:`, stdout || stderr);

        if (await fileExist(formatPath)) {
          return { code: 0, msg: 'ok', data: { id, url: pathToFileURL(formatPath).toString() } };
        }
        return { code: 0, msg: 'ok', data: { id, url: '' } };
      } catch (err: any) {
        logger.error(`[WebBridge][FFmpeg] err:`, err);
        return { code: -1, msg: err.message, data: { id, url: '' } };
      }
    },
  );

  // 媒体嗅探端点
  fastify.post(`/${API_PREFIX}/sniffer/media`, async (req: FastifyRequest<{ Body: any }>) => {
    const { url, run_script, init_script, custom_regex, sniffer_exclude, headers = {} } = req.body;

    try {
      const res = await puppeteerInElectron(url, run_script, init_script, custom_regex, sniffer_exclude, headers);
      return { code: 0, msg: 'ok', data: res };
    } catch (error: any) {
      logger.error(`[WebBridge][Sniffer] Error sniffing media from ${url}:`, error);
      return { code: -1, msg: error.message, data: null };
    }
  });

  // 会话管理端点
  fastify.post(`/${API_PREFIX}/session/manage`, async (req: FastifyRequest<{ Body: any }>) => {
    const { action } = req.body;

    try {
      // 这些功能在Web版本中需要通过后端实现
      switch (action) {
        case 'clearCache':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: true };
        case 'clearStorage':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: true };
        case 'clearAll':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: true };
        case 'getSize':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: 0 };
        default:
          return { code: -1, msg: 'Unknown session action', data: null };
      }
    } catch (error: any) {
      logger.error(`[WebBridge][Session] Error processing action ${action}:`, error);
      return { code: -1, msg: error.message, data: null };
    }
  });

  // 老板键管理端点
  fastify.post(`/${API_PREFIX}/boss/shortcut`, async (req: FastifyRequest<{ Body: any }>) => {
    const { action, config } = req.body;

    try {
      // 在Web版本中，这些功能需要通过后端实现
      switch (action) {
        case 'register':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: true };
        case 'unRegister':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: true };
        case 'isRegistered':
          // 在Web版本中，这个功能需要后端支持
          return { code: 0, msg: 'ok', data: false };
        default:
          return { code: -1, msg: 'Unknown boss shortcut action', data: null };
      }
    } catch (error: any) {
      logger.error(`[WebBridge][BossShortcut] Error processing action ${action}:`, error);
      return { code: -1, msg: error.message, data: null };
    }
  });
};

export default api;
