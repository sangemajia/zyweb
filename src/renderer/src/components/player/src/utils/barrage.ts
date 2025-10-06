import { requestComplete } from '@/utils/request';

const publicBarrageSend = (url: string, options: any) => {
  const removeEmptyParams = (url: string) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search.slice(1));
    params.forEach((value, key) => {
      if (!value) params.delete(key);
    });
    urlObj.search = params.toString();
    return urlObj.toString();
  };

  const data = {
    player: options.player,
    text: options.text,
    time: options.time,
    color: options.color,
    type: options.type,
  };

  requestComplete({ url: removeEmptyParams(url), method: 'POST', data });
};

export { publicBarrageSend };
