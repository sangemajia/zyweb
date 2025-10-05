import PlayerAdapter from './PlayerAdapter';

// 按需导入适配器
const loadAdapter = async (adapterName: string): Promise<typeof PlayerAdapter | null> => {
  try {
    switch (adapterName) {
      // 可以在这里添加其他播放器适配器
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load adapter: ${adapterName}`, error);
    return null;
  }
};

export { loadAdapter };