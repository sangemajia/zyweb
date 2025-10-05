import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { pathToFileURL } from 'url';

const execAsync = promisify(exec);

const server = fastify({ logger: true });

server.register(fastifyCors, {
  origin: '*',
});

// 简单的测试端点
server.get('/', async (request, reply) => {
  return { message: 'Hello from WebBridge API!' };
});

// IPC消息处理端点
server.post('/api/v1/webbridge/ipc/:channel', async (request, reply) => {
  const { channel } = request.params as { channel: string };
  const args = request.body as any;
  
  console.log(`[WebBridge][IPC] channel: ${channel}, args: ${JSON.stringify(args)}`);
  
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
    console.error(`[WebBridge][IPC] Error processing channel ${channel}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 文件管理端点
server.post('/api/v1/webbridge/file/manage', async (request, reply) => {
  const { action, config } = request.body as { action: string; config: any };
  
  console.log(`[WebBridge][File] action: ${action}, config: ${JSON.stringify(config)}`);
  
  try {
    const rm = async (config: any) => {
      // 模拟删除文件或目录
      console.log(`[WebBridge][File] Deleting path: ${config.path}`);
      return true;
    }

    const mk = async (config: any) => {
      // 模拟创建目录
      console.log(`[WebBridge][File] Creating directory: ${config.path}`);
      return true;
    }

    const write = async (config: any) => {
      // 模拟写入文件
      console.log(`[WebBridge][File] Writing to path: ${config.path}`);
      return true;
    }

    const read = async (config: any) => {
      // 模拟读取文件
      console.log(`[WebBridge][File] Reading from path: ${config.path}`);
      return 'file content';
    }

    const size = async (config: any) => {
      // 模拟获取文件大小
      console.log(`[WebBridge][File] Getting size of path: ${config.path}`);
      return '1.23';
    }

    const state = async (config: any) => {
      // 模拟获取文件状态
      console.log(`[WebBridge][File] Getting state of path: ${config.path}`);
      return 'file';
    }

    const exist = async (config: any) => {
      // 模拟检查文件是否存在
      console.log(`[WebBridge][File] Checking existence of path: ${config.path}`);
      return true;
    }

    const methodMap: any = { rm, mk, write, read, size, state, exist };
    if (!methodMap[action]) {
      return { code: -1, msg: 'Unknown action', data: null };
    }
    
    const result = await methodMap[action](config);
    return { code: 0, msg: 'ok', data: result };
  } catch (error: any) {
    console.error(`[WebBridge][File] Error processing action ${action}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 文件读取端点
server.get('/api/v1/webbridge/file/read', async (request, reply) => {
  const { path } = request.query as { path: string };
  
  try {
    // 模拟读取文件
    console.log(`[WebBridge][File] Reading file: ${path}`);
    return { code: 0, msg: 'ok', data: 'file content' };
  } catch (error: any) {
    console.error(`[WebBridge][File] Error reading file ${path}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 文件写入端点
server.post('/api/v1/webbridge/file/write', async (request, reply) => {
  const { path, content } = request.body as { path: string; content: string };
  
  try {
    // 模拟写入文件
    console.log(`[WebBridge][File] Writing file: ${path}`);
    return { code: 0, msg: 'ok', data: true };
  } catch (error: any) {
    console.error(`[WebBridge][File] Error writing file ${path}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 文件大小端点
server.get('/api/v1/webbridge/file/size', async (request, reply) => {
  const { path } = request.query as { path: string };
  
  try {
    // 模拟获取文件大小
    console.log(`[WebBridge][File] Getting size of file: ${path}`);
    return { code: 0, msg: 'ok', data: '1.23' };
  } catch (error: any) {
    console.error(`[WebBridge][File] Error getting file size for ${path}:`, error);
    return { code: -1, msg: error.message, data: '0' };
  }
});

// FFmpeg检查端点
server.get('/api/v1/webbridge/ffmpeg/check', async (request, reply) => {
  try {
    const { stdout, stderr } = await execAsync('ffmpeg -version');
    if (stdout.includes('version')) {
      console.log(`[WebBridge][FFmpeg] info output:`, stdout);
      return { code: 0, msg: 'ok', data: true };
    }

    if (stderr) {
      console.error(`[WebBridge][FFmpeg] err output:`, stderr);
    }

    return { code: 0, msg: 'ok', data: false };
  } catch (err: any) {
    console.error(`[WebBridge][FFmpeg] err:`, err);
    return { code: -1, msg: err.message, data: false };
  }
});

// FFmpeg缩略图生成端点
server.post('/api/v1/webbridge/ffmpeg/thumbnail', async (request, reply) => {
  const { url, id } = request.body as { url: string; id: string };
  const ua = 'Mozilla/5.0';
  const timeout = 5000;
  const basePath = join('/tmp', 'thumbnail');

  try {
    // 模拟创建目录
    console.log(`[WebBridge][FFmpeg] Creating directory: ${basePath}`);
    
    const formatPath = join(basePath, `${id}.jpg`);
    
    // 模拟执行命令
    const ffmpegCommand = 'ffmpeg';
    const inputOptions = ['-user_agent', `"${ua}"`, '-i', `"${url}"`];
    const outputOptions = ['-y', '-frames:v', '1', '-q:v', '20', '-update', '1'];
    const command = [ffmpegCommand, ...inputOptions, ...outputOptions, `"${formatPath}"`].join(' ');
    console.log(`[WebBridge][FFmpeg] command: ${command}`);

    // 模拟执行命令
    console.log(`[WebBridge][FFmpeg] output: Simulated output`);

    // 模拟文件存在
    return { code: 0, msg: 'ok', data: { id, url: `file://${formatPath}` } };
  } catch (err: any) {
    console.error(`[WebBridge][FFmpeg] err:`, err);
    return { code: -1, msg: err.message, data: { id, url: '' } };
  }
});

// 媒体嗅探端点
server.post('/api/v1/webbridge/sniffer/media', async (request, reply) => {
  const { url, run_script, init_script, custom_regex, sniffer_exclude, headers = {} } = request.body as any;
  
  try {
    // 模拟媒体嗅探
    console.log(`[WebBridge][Sniffer] Sniffing media from ${url}`);
    return { code: 0, msg: 'ok', data: { url, mediaUrl: 'sniffed-media-url' } };
  } catch (error: any) {
    console.error(`[WebBridge][Sniffer] Error sniffing media from ${url}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 会话管理端点
server.post('/api/v1/webbridge/session/manage', async (request, reply) => {
  const { action } = request.body as { action: string };
  
  try {
    // 模拟会话管理
    switch (action) {
      case 'clearCache':
        console.log(`[WebBridge][Session] Clearing cache`);
        return { code: 0, msg: 'ok', data: true };
      case 'clearStorage':
        console.log(`[WebBridge][Session] Clearing storage`);
        return { code: 0, msg: 'ok', data: true };
      case 'clearAll':
        console.log(`[WebBridge][Session] Clearing all`);
        return { code: 0, msg: 'ok', data: true };
      case 'getSize':
        console.log(`[WebBridge][Session] Getting size`);
        return { code: 0, msg: 'ok', data: 1024 };
      default:
        return { code: -1, msg: 'Unknown session action', data: null };
    }
  } catch (error: any) {
    console.error(`[WebBridge][Session] Error processing action ${action}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 老板键管理端点
server.post('/api/v1/webbridge/boss/shortcut', async (request, reply) => {
  const { action, config } = request.body as { action: string; config: any };
  
  try {
    // 模拟老板键管理
    switch (action) {
      case 'register':
        console.log(`[WebBridge][BossShortcut] Registering shortcut: ${JSON.stringify(config)}`);
        return { code: 0, msg: 'ok', data: true };
      case 'unRegister':
        console.log(`[WebBridge][BossShortcut] Unregistering shortcut: ${JSON.stringify(config)}`);
        return { code: 0, msg: 'ok', data: true };
      case 'isRegistered':
        console.log(`[WebBridge][BossShortcut] Checking if shortcut is registered: ${JSON.stringify(config)}`);
        return { code: 0, msg: 'ok', data: false };
      default:
        return { code: -1, msg: 'Unknown boss shortcut action', data: null };
    }
  } catch (error: any) {
    console.error(`[WebBridge][BossShortcut] Error processing action ${action}:`, error);
    return { code: -1, msg: error.message, data: null };
  }
});

// 测试端点
server.get('/api/v1/webbridge/test', async (request, reply) => {
  return { 
    code: 0, 
    msg: 'ok', 
    data: { 
      message: 'WebBridge API is working!',
      timestamp: new Date().toISOString()
    } 
  };
});

const start = async () => {
  try {
    await server.listen({ port: 9978, host: '0.0.0.0' });
    console.log('WebBridge API server listening on http://0.0.0.0:9978');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();