import { FastifyInstance } from 'fastify';
import { APP_CONFIG_PATH, APP_STORE_PATH, APP_TMP_PATH } from '@main/utils/hiker/path.web';
import fs from 'fs';
import path from 'path';

// 确保必要的目录存在
const ensureDirectories = () => {
  const dirs = [APP_STORE_PATH, APP_TMP_PATH, APP_CONFIG_PATH];
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// WebBridge API 路由
export const work = async (fastify: FastifyInstance) => {
  // 确保必要的目录存在
  ensureDirectories();
  // IPC 消息处理端点
  fastify.post('/api/v1/webbridge/ipc/:channel', async (request, reply) => {
    const { channel } = request.params as { channel: string };
    const args = request.body as any[];

    // 这里应该处理 IPC 消息并返回结果
    // 目前只是简单返回一个模拟响应
    // 在实际实现中，这里需要根据 channel 和 args 调用相应的处理函数
    console.log(`Received IPC message for channel: ${channel}`, args);

    return {
      code: 0,
      msg: 'ok',
      data: {
        channel,
        args,
        timestamp: new Date().toISOString(),
      },
    };
  });

  // 文件管理 API 端点
  fastify.post('/api/v1/webbridge/file/manage', async (request, reply) => {
    const { action, config } = request.body as { action: string; config: any };

    // 处理文件操作
    try {
      switch (action) {
        case 'read':
          // 读取文件
          const filePath = path.join(APP_CONFIG_PATH, config.path);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return {
              code: 0,
              msg: 'ok',
              data: {
                action,
                config,
                result: content,
                timestamp: new Date().toISOString(),
              },
            };
          } else {
            return {
              code: 1,
              msg: 'File not found',
              data: {
                action,
                config,
                result: null,
                timestamp: new Date().toISOString(),
              },
            };
          }

        case 'write':
          // 写入文件
          const writePath = path.join(APP_CONFIG_PATH, config.path);
          // 确保目录存在
          const dir = path.dirname(writePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(writePath, config.content, 'utf-8');
          return {
            code: 0,
            msg: 'ok',
            data: {
              action,
              config,
              result: 'success',
              timestamp: new Date().toISOString(),
            },
          };

        case 'rm':
          // 删除文件
          const rmPath = path.join(APP_CONFIG_PATH, config.path);
          if (fs.existsSync(rmPath)) {
            fs.unlinkSync(rmPath);
            return {
              code: 0,
              msg: 'ok',
              data: {
                action,
                config,
                result: 'success',
                timestamp: new Date().toISOString(),
              },
            };
          } else {
            return {
              code: 1,
              msg: 'File not found',
              data: {
                action,
                config,
                result: 'failed',
                timestamp: new Date().toISOString(),
              },
            };
          }

        case 'size':
          // 获取文件大小
          const sizePath = path.join(APP_CONFIG_PATH, config.path);
          if (fs.existsSync(sizePath)) {
            const stats = fs.statSync(sizePath);
            return {
              code: 0,
              msg: 'ok',
              data: {
                action,
                config,
                result: stats.size,
                timestamp: new Date().toISOString(),
              },
            };
          } else {
            return {
              code: 1,
              msg: 'File not found',
              data: {
                action,
                config,
                result: 0,
                timestamp: new Date().toISOString(),
              },
            };
          }

        default:
          return {
            code: 1,
            msg: `Unsupported file action: ${action}`,
            data: {
              action,
              config,
              result: 'failed',
              timestamp: new Date().toISOString(),
            },
          };
      }
    } catch (error) {
      return {
        code: 1,
        msg: `File operation failed: ${error.message}`,
        data: {
          action,
          config,
          result: 'failed',
          timestamp: new Date().toISOString(),
        },
      };
    }
  });

  // FFmpeg 相关 API 端点
  fastify.post('/api/v1/webbridge/ffmpeg/:action', async (request, reply) => {
    const { action } = request.params as { action: string };
    const params = request.body as any;

    // 处理 FFmpeg 相关操作
    try {
      switch (action) {
        case 'check':
          // 检查 FFmpeg 是否可用
          // 这里应该检查 FFmpeg 是否已安装并可用
          // 目前返回模拟响应
          return {
            code: 0,
            msg: 'ok',
            data: {
              action,
              result: true,
              version: '4.4.1',
              timestamp: new Date().toISOString(),
            },
          };

        case 'thumbnail':
          // 生成缩略图
          // 这里应该调用 FFmpeg 生成缩略图
          // 目前返回模拟响应
          return {
            code: 0,
            msg: 'ok',
            data: {
              action,
              params,
              result: 'thumbnail_generated',
              path: `/thumbnails/${params.id}.jpg`,
              timestamp: new Date().toISOString(),
            },
          };

        default:
          return {
            code: 1,
            msg: `Unsupported FFmpeg action: ${action}`,
            data: {
              action,
              params,
              result: 'failed',
              timestamp: new Date().toISOString(),
            },
          };
      }
    } catch (error) {
      return {
        code: 1,
        msg: `FFmpeg operation failed: ${error.message}`,
        data: {
          action,
          params,
          result: 'failed',
          timestamp: new Date().toISOString(),
        },
      };
    }
  });

  // 媒体嗅探 API 端点
  fastify.post('/api/v1/webbridge/sniffer/media', async (request, reply) => {
    const params = request.body as any;

    // 处理媒体嗅探
    try {
      // 这里应该实现实际的媒体嗅探逻辑
      // 目前返回模拟响应
      return {
        code: 0,
        msg: 'ok',
        data: {
          params,
          result: {
            url: params.url,
            title: 'Sniffed Media Title',
            duration: 3600,
            quality: '1080p',
            format: 'mp4',
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        code: 1,
        msg: `Media sniffing failed: ${error.message}`,
        data: {
          params,
          result: null,
          timestamp: new Date().toISOString(),
        },
      };
    }
  });

  // 会话管理 API 端点
  fastify.post('/api/v1/webbridge/session/:action', async (request, reply) => {
    const { action } = request.params as { action: string };
    const params = request.body as any;

    // 处理会话管理操作
    try {
      switch (action) {
        case 'size':
          // 获取会话大小
          // 这里应该返回实际的会话数据大小
          // 目前返回模拟响应
          return {
            code: 0,
            msg: 'ok',
            data: {
              action,
              params,
              result: 102400, // 100KB 模拟大小
              timestamp: new Date().toISOString(),
            },
          };

        case 'clearCache':
          // 清除缓存
          // 这里应该实现实际的缓存清除逻辑
          // 目前返回模拟响应
          return {
            code: 0,
            msg: 'ok',
            data: {
              action,
              params,
              result: 'Cache cleared successfully',
              timestamp: new Date().toISOString(),
            },
          };

        default:
          return {
            code: 1,
            msg: `Unsupported session action: ${action}`,
            data: {
              action,
              params,
              result: 'failed',
              timestamp: new Date().toISOString(),
            },
          };
      }
    } catch (error) {
      return {
        code: 1,
        msg: `Session operation failed: ${error.message}`,
        data: {
          action,
          params,
          result: 'failed',
          timestamp: new Date().toISOString(),
        },
      };
    }
  });

  // 老板键管理 API 端点
  fastify.post('/api/v1/webbridge/boss/shortcut', async (request, reply) => {
    const params = request.body as any;

    // 处理老板键管理
    try {
      // 这里应该实现实际的老板键管理逻辑
      // 目前返回模拟响应
      return {
        code: 0,
        msg: 'ok',
        data: {
          params,
          result: {
            status: 'Boss key shortcut processed',
            action: params.action || 'hide',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        code: 1,
        msg: `Boss shortcut operation failed: ${error.message}`,
        data: {
          params,
          result: null,
          timestamp: new Date().toISOString(),
        },
      };
    }
  });
};
