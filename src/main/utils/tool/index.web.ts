// Web 环境下的 tool 模块模拟

const toggleWinVisable = (status: boolean | undefined = undefined) => {
  console.log('[TOOL] toggleWinVisable called with status:', status);
};

const parseCustomUrl = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url.trim());

    const [redirectURL, ...headerParts] = decodedUrl.split('@');

    if (headerParts.length === 0) {
      return { redirectURL, headers: {} };
    }

    const headers = headerParts.reduce<Record<string, string>>((acc, part) => {
      const [rawKey, rawValue] = part.split('=');

      if (rawKey && rawValue) {
        const key = rawKey
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-');

        const value = rawValue.replace(/\$*&/g, '=');
        acc[key] = value;
      }

      return acc;
    }, {});

    return { redirectURL, headers };
  } catch {
    return { redirectURL: url, headers: {} };
  }
};

const isLocalhostRef = (url: string): boolean => `${url}`.includes('//localhost') || `${url}`.includes('//127.0.0.1');

const isUrlScheme = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const BROWER = ['http:', 'https:', 'file:', 'data:', 'blob:', 'about:', 'javascript:', 'mailto:', 'tel:', 'sms:', 'ftp:'];
    const CHROME = ['chrome:', 'chrome-extension:', 'chrome-untrusted:', 'chrome-search:', 'chrome-devtools:', 'devtools:'];
    const SPECIAL  = ['magnet:', 'webtorrent:'];
    const SAFE = [...BROWER, ...CHROME, ...SPECIAL];
    return !SAFE.includes(parsed.protocol);
  } catch (err) {
    return true;
  }
};

const getIP = async () => {
  // 在 Web 环境中模拟 IP 获取
  return {
    ip: '127.0.0.1',
    version: 4,
  };
};

const getConfig = async (options) => {
  // 在 Web 环境中模拟配置获取
  console.log('[TOOL] getConfig called with options:', options);
  return {};
};

const singleton = <T extends new (...args: any[]) => any>(className: T): T => {
  let instance: InstanceType<T> | null = null;
  const proxy = new Proxy(className, {
    construct(target, args) {
      if (!instance) {
        instance = Reflect.construct(target, args);
      }
      return instance as InstanceType<T>;
    },
  });
  proxy.prototype.construct = proxy;
  return proxy;
};

const findWinByName = async (name: string) => {
  // 在 Web 环境中模拟窗口查找
  console.log('[TOOL] findWinByName called with name:', name);
  return null;
};

export { isLocalhostRef, isUrlScheme, parseCustomUrl, toggleWinVisable, getIP, getConfig, singleton, findWinByName };