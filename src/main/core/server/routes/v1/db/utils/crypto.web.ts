// Web 环境下的 crypto 工具
import crypto from 'crypto-js';

const base64 = (() => {
  const b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const base64DecodeChars = new Array(
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    62,
    -1,
    -1,
    -1,
    63,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    -1,
    -1,
    -1,
    -1,
    -1,
  );
  return {
    decode: (val: string) => crypto.enc.Utf8.stringify(crypto.enc.Base64.parse(val)),
    encode: (val: string) => crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(val)),
    btoa: (val: string) => {
      var out, i, len;
      var c1, c2, c3;
      len = val.length;
      i = 0;
      out = '';
      while (i < len) {
        c1 = val.charCodeAt(i++) & 0xff;
        if (i == len) {
          out += b64map.charAt(c1 >> 2);
          out += b64map.charAt((c1 & 0x3) << 4);
          out += '==';
          break;
        }
        c2 = val.charCodeAt(i++);
        if (i == len) {
          out += b64map.charAt(c1 >> 2);
          out += b64map.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
          out += b64map.charAt((c2 & 0xf) << 2);
          out += '=';
          break;
        }
        c3 = val.charCodeAt(i++);
        out += b64map.charAt(c1 >> 2);
        out += b64map.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
        out += b64map.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
        out += b64map.charAt(c3 & 0x3f);
      }
      return out;
    },
    atob: (val: string) => {
      var c1, c2, c3, c4;
      var i, len, out;
      len = val.length;
      i = 0;
      out = '';
      while (i < len) {
        do {
          c1 = base64DecodeChars[val.charCodeAt(i++) & 0xff];
        } while (i < len && c1 == -1);
        if (c1 == -1) break;
        do {
          c2 = base64DecodeChars[val.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1) break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        do {
          c3 = val.charCodeAt(i++) & 0xff;
          if (c3 == 61) return out;
          c3 = base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1) break;
        out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));
        do {
          c4 = val.charCodeAt(i++) & 0xff;
          if (c4 == 61) return out;
          c4 = base64DecodeChars[c4];
        } while (i < len && c4 == -1);
        if (c4 == -1) break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
      }
      return out;
    },
  };
})();

const hash = {
  'md5-16': (val: string) => crypto.MD5(val).toString().slice(8, 24),
  'md5-32': (val: string) => crypto.MD5(val).toString(),
  sha1: (val: string) => crypto.SHA1(val).toString(),
  sha224: (val: string) => crypto.SHA224(val).toString(),
  sha256: (val: string) => crypto.SHA256(val).toString(),
  sha3: (val: string) => crypto.SHA3(val).toString(),
  sha384: (val: string) => crypto.SHA384(val).toString(),
  sha512: (val: string) => crypto.SHA512(val).toString(),
};

const hmac = {
  'md5-16': (val: string, key: string) => crypto.HmacMD5(val, key).toString().slice(8, 24),
  'md5-32': (val: string, key: string) => crypto.HmacMD5(val, key).toString(),
  sha1: (val: string, key: string) => crypto.HmacSHA1(val, key).toString(),
  sha224: (val: string, key: string) => crypto.HmacSHA224(val, key).toString(),
  sha256: (val: string, key: string) => crypto.HmacSHA256(val, key).toString(),
  sha3: (val: string, key: string) => crypto.HmacSHA3(val, key).toString(),
  sha384: (val: string, key: string) => crypto.HmacSHA384(val, key).toString(),
  sha512: (val: string, key: string) => crypto.HmacSHA512(val, key).toString(),
  ripemd160: (val: string, key: string) => crypto.HmacRIPEMD160(val, key).toString(),
};

const html = {
  encode: (val: string) => {
    // 简单实现 HTML 编码
    return val.replace(/&/g, '&')
              .replace(/</g, '<')
              .replace(/>/g, '>')
              .replace(/"/g, '"')
              .replace(/'/g, '\\'');
  },
  decode: (val: string) => {
    // 简单实现 HTML 解码
    return val.replace(/</g, '<')
              .replace(/>/g, '>')
              .replace(/"/g, '"')
              .replace(/'/g, "'")
              .replace(/&/g, '&');
  },
};

const unicode = {
  encode: (val: string) => {
    const encodeUnicode = (val: string) => {
      const res: any[] = [];
      for (let i = 0; i < val.length; i++) {
        res[i] = ('00' + val.charCodeAt(i).toString(16)).slice(-4);
      }
      return '\\u' + res.join('\\u');
    };
    return encodeUnicode(val);
  },
  decode: (val: string) => {
    const decodeUnicode = (val: string) => {
      val = val.replace(/\\/g, '%');
      return unescape(val);
    };
    return decodeUnicode(val);
  },
};

const url = {
  encode: (val: string) => encodeURIComponent(val),
  decode: (val: string) => decodeURIComponent(val),
};

const hex = {
  decode: (val: string) => {
    // 简单实现 hex 解码
    let result = '';
    for (let i = 0; i < val.length; i += 2) {
      result += String.fromCharCode(parseInt(val.substr(i, 2), 16));
    }
    return result;
  },
  encode: (val: string) => {
    // 简单实现 hex 编码
    let result = '';
    for (let i = 0; i < val.length; i++) {
      result += val.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return result;
  },
};

// 添加gzip对象
const gzip = {
  encode: (val: string) => {
    // 在Web环境中，我们不实现实际的gzip压缩，只是返回原始值
    return val;
  },
  decode: (val: string) => {
    // 在Web环境中，我们不实现实际的gzip解压缩，只是返回原始值
    return val;
  },
};

export { base64, crypto, hash, hmac, html, unicode, url, hex, gzip };