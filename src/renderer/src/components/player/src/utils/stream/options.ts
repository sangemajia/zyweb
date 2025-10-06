const publicOptions = {
  hls: {
    maxBufferLength: 600, // 缓冲区最大长度
    liveSyncDurationCount: 10, // 直播同步持续时间计数
  },
  flv: {
    mediaDataSource: {
      type: 'flv',
      isLive: false,
    },
    optionalConfig: {
      enableWorker: false, // 启用分离线程
      enableStashBuffer: false, //关闭IO隐藏缓冲区
      autoCleanupSourceBuffer: true, //自动清除缓存
      reuseRedirectedURL: true, //允许重定向请求
      fixAudioTimestampGap: false, // 音视频同步
      deferLoadAfterSourceOpen: false, // 允许延迟加载
      // referrerPolicy: 'no-referrer',
      headers: {},
    },
  },
  webtorrent: {},
  dash: {},
  shaka: {},
};

export { publicOptions };
