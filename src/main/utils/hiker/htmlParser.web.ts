// Web 环境下的 htmlParser 模块模拟

class Jsoup {
  MY_URL: string = '';

  constructor(MY_URL: string = '') {
    this.MY_URL = MY_URL;
  }

  // 测试
  test(text: string, string: string): boolean {
    const searchObj = new RegExp(text, 'mi').exec(string);
    return searchObj ? true : false;
  }

  // 包含
  contains(text: string, match: string): boolean {
    return text.indexOf(match) !== -1;
  }

  parseText(text: string) {
    // 使用正则表达式替换所有空白字符序列为单个换行符
    text = text.replace(/[\s]+/gm, '\n');
    // 压缩连续的换行符为单个换行符
    text = text.replace(/\n+/g, '\n').replace(/^\s+/, '');
    // 前面两步执行完结果和py的一致。剩下的就是把换行符替换成空格就和java的一致了
    text = text.replace(/\n/g, ' ');
    return text;
  }

  pdfa(html: string, parse: string): string[] {
    console.log('[HTML_PARSER] pdfa called with html length:', html?.length, 'parse:', parse);
    // 在 Web 环境中模拟返回空数组
    return [];
  }

  pdfl(html: string, parse: string, list_text: string, list_url: string, url_key: string): string[] {
    console.log('[HTML_PARSER] pdfl called with html length:', html?.length, 'parse:', parse);
    // 在 Web 环境中模拟返回空数组
    return [];
  }

  pdfh(html: string, parse: string, baseUrl: string = ''): string {
    console.log('[HTML_PARSER] pdfh called with html length:', html?.length, 'parse:', parse);
    // 在 Web 环境中模拟返回空字符串
    return '';
  }

  pd(html: string, parse: string, baseUrl: string = ''): string {
    console.log('[HTML_PARSER] pd called with html length:', html?.length, 'parse:', parse);
    // 在 Web 环境中模拟返回空字符串
    return '';
  }

  pjfh(html: any, parse: string, addUrl = false): string {
    console.log('[HTML_PARSER] pjfh called with parse:', parse);
    // 在 Web 环境中模拟返回空字符串
    return '';
  }

  pj(html: any, parse: string): string {
    console.log('[HTML_PARSER] pj called with parse:', parse);
    // 在 Web 环境中模拟返回空字符串
    return '';
  }

  pjfa(html: any, parse: string): any[] {
    console.log('[HTML_PARSER] pjfa called with parse:', parse);
    // 在 Web 环境中模拟返回空数组
    return [];
  }
}

const pdfh = (html: string, parse: string, base_url: string = ''): string => {
  const jsp = new Jsoup(base_url);
  return jsp.pdfh(html, parse, base_url);
};

const pd = (html: string, parse: string, base_url: string = ''): string => {
  const jsp = new Jsoup(base_url);
  return jsp.pd(html, parse);
};

const pdfa = (html: string, parse: string): string[] => {
  const jsp = new Jsoup();
  return jsp.pdfa(html, parse);
};

const pdfl = (html: string, parse: string, list_text: string, list_url: string, url_key: string): string[] => {
  const jsp = new Jsoup();
  return jsp.pdfl(html, parse, list_text, list_url, url_key);
};

export { Jsoup as default, pd, pdfa, pdfh, pdfl };
