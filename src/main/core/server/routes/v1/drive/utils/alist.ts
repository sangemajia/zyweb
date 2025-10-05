// Web 环境下的 AList 适配器模拟
class AListAdapter {
  private config: any;

  constructor(config: any) {
    this.config = config;
    console.log('[AList] Initializing adapter with config:', config);
  }

  async dir(params: { path: string; pg: number }) {
    console.log('[AList] Getting directory:', params);
    // 模拟返回数据
    return {
      page: params.pg,
      pagecount: 1,
      list: [],
    };
  }

  async file(path: string) {
    console.log('[AList] Getting file:', path);
    // 模拟返回数据
    return {
      name: path.split('/').pop(),
      url: `https://example.com/file${path}`,
      size: 1024,
      type: 'file',
    };
  }

  async search(params: { kw: string; pg: number }) {
    console.log('[AList] Searching:', params);
    // 模拟返回数据
    return {
      page: params.pg,
      pagecount: 1,
      list: [],
    };
  }
}

export default AListAdapter;