// Web 环境下的 webdev 模拟类
class webdev {
  url: string = '';
  username: string = '';
  password: string = '';
  clientWebdev: any | null = null;

  constructor({ url, username, password }) {
    this.url = url;
    this.username = username;
    this.password = password;
  }

  isWebdevConfigValid(url: string, username: string, password: string) {
    const protocolRegex = /^https?:\/\//i;
    const hasValidProtocol = protocolRegex.test(url);
    return Boolean(hasValidProtocol && password && username);
  }

  async initializeWebdavClient() {
    try {
      if (!this.isWebdevConfigValid(this.url, this.username, this.password)) return false;

      // 在 Web 环境中，我们不实际连接到 WebDAV 服务器
      // 而是简单地返回 true 来模拟连接成功
      this.clientWebdev = {
        exists: async (path: string) => true,
        createDirectory: async (path: string) => {},
        putFileContents: async (path: string, content: string, options: any) => {},
        getFileContents: async (path: string, options: any) => '{}',
      };

      return true;
    } catch (err) {
      this.clientWebdev = null;
      console.error(`[webdev][initialize][error]${err}`);
      return false;
    }
  }

  async rsyncRemote(doc) {
    try {
      if (!this.clientWebdev) {
        const status = await this.initializeWebdavClient();
        if (!status) return false;
      }
      const formattedJson = JSON.stringify(doc);
      await this.clientWebdev.putFileContents('/zyfun/config.json', formattedJson, { overwrite: false });
      return true;
    } catch (err) {
      console.error(`[webdev][sync][error]${err}`);
      return false;
    }
  }

  async rsyncLocal() {
    try {
      if (!this.clientWebdev) {
        const status = await this.initializeWebdavClient();
        if (!status) return false;
      }
      const str = (await this.clientWebdev.getFileContents('/zyfun/config.json', {
        format: 'text',
      })) as unknown as string;
      const formattedJson = JSON.parse(str);
      return formattedJson;
    } catch (err) {
      console.error(`[webdev][sync][error]${err}`);
      return false;
    }
  }
}

export default webdev;
