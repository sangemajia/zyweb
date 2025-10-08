import { requestComplete } from '@/utils/request';

const mediaUtils = (() => {
  /**
   * 获取文件扩展名
   * @param t
   * @returns
   */
  const getFileExtension = (t: string) => {
    if (t && 'string' == typeof t) {
      if (t.startsWith('magnet:')) return 'magnet';

      const e = /(?:\.([^.]+))?$/;
      return e.exec(t)?.[1] ? e.exec(t)![1].split('?')[0].toLowerCase() : '';
    }
    return '';
  };

  /**
   * 获取文件类型
   * @param t
   * @returns
   */
  const getMimetype = (t: string) => {
    const EXT_MIME = {
      m3u8: 'application/x-mpegURL',
      flv: 'video/flv',
      mp4: 'video/mp4',
      webm: 'video/webm',
      rtmp: 'rtmp/flv',
      mpd: 'application/dash+xml',
      mp3: 'audio/mpeg',
      m4a: 'audio/mp4',
    };

    const e = getFileExtension(t);
    return EXT_MIME[e.toLowerCase()] || '';
  };

  const formatUrlHeaders = (url: string, headers: { [key: string]: string } = {}) => {
    if (headers && Object.keys(headers).length > 0) {
      for (const key in headers) {
        let value = headers[key].toString();
        if (value.includes('=')) value = value.replaceAll('=', '$*&');
        url += `@${key}=${value}`;
      }
    }
    return url;
  };

  const formatRemoveUnSafeHeaders = (headers: { [key: string]: string }) => {
    const unsafeHeads = ['host', 'referer', 'origin', 'user-agent', 'content-length', 'set-cookie', 'cookie'];

    for (const header in headers) {
      if (unsafeHeads.includes(header.toLowerCase())) delete headers[header];
    }

    return headers;
  };

  // Empty function as we are removing Electron-specific code in web version
  const formatWeb2electronHeaders = (headers: { [key: string]: string }) => {
    return headers;
  };

  // 支持的媒体格式映射
  const supportedFormats: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/x-flv': 'flv',
    'video/ogg': 'ogx',
    'application/vnd.apple.mpegurl': 'm3u8',
    'application/x-mpegURL': 'm3u8',
    'application/octet-stream': 'm3u8',
    'application/dash+xml': 'mpd',
    'video/avi': 'avi',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'video/quicktime': 'mov',
    'video/x-ms-wmv': 'wmv',
    'video/3gpp': '3gp',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/aac': 'aac',
    'audio/ogg': 'oga',
  };

  // 视频类型与播放器映射
  const videoTypeMap: Record<string, string> = {
    mp4: 'customMpegts',
    flv: 'customFlv',
    m3u8: 'customHls',
    mpd: 'customDash',
    magnet: 'customWebTorrent',
    mp3: 'customMpegts',
    mkv: 'customMpegts',
    m4a: 'customMpegts',
    wav: 'customMpegts',
    flac: 'customMpegts',
    aac: 'customMpegts',
    ogg: 'customMpegts',
    wma: 'customMpegts',
  };

  // 根据URL直接匹配文件格式
  const supportedFormatsLookup = (url: string): string | undefined => {
    if (url.startsWith('magnet:')) return 'magnet';
    else if (/^(https?:\/\/)/.test(url)) {
      try {
        const { pathname } = new URL(url);
        const parts = pathname.split('.');
        const suffix = parts.length > 1 ? parts.slice(-1)[0] : '';
        return Object.values(supportedFormats).find((format) => suffix.includes(format));
      } catch (err) {
        return undefined;
      }
    }
    return undefined;
  };

  // 映射 Content-Type 到具体格式
  const mapContentTypeToFormat = (contentType: string): string | undefined => {
    const entry = Object.entries(supportedFormats).find(([type]) => contentType.includes(type));
    return entry ? entry[1] : undefined;
  };

  // 使用 fetch 获取媒体类型
  const getMediaType = async (url: string, headers: { [key: string]: any }): Promise<string | undefined> => {
    const methods = ['HEAD', 'GET'];
    const timeout = 5000;

    for (const method of methods) {
      try {
        const response = await requestComplete({
          url,
          method,
          timeout,
          headers: {
            ...formatRemoveUnSafeHeaders(headers),
            Range: 'bytes=0-7',
          },
        });

        if (response.status === 200) {
          const contentType = response.headers['content-type'] || '';
          return mapContentTypeToFormat(contentType);
        }
      } catch (err: any) {
        console.log(`[mediaUtils][getMediaType][error] (${method}): ${err.message}`);
      }
    }

    return undefined; // 如果所有方法都失败，返回 undefined
  };

  // 检查媒体类型
  const checkMediaType = async (url: string, headers: { [key: string]: any }): Promise<string | undefined> => {
    if (!url || !(/^(https?:\/\/)/.test(url) || url.startsWith('magnet:'))) return undefined;
    console.log(`[mediaUtils][checkMediaType][url]: ${url}`);
    const fileType = supportedFormatsLookup(url);
    return fileType || (await getMediaType(url, headers));
  };

  // 映射视频类型到播放器类型
  const mediaType2PlayerType = (videoType: string): string => {
    return videoTypeMap[videoType] || 'customHls'; // 默认播放器类型为 customHls
  };

  // 导出函数
  return {
    checkMediaType,
    mediaType2PlayerType,
    formatRemoveUnSafeHeaders,
    formatUrlHeaders,
    // formatWeb2electronHeaders is removed for web version
    // formatWeb2electronHeaders,
  };
})();

export { mediaUtils };
