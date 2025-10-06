import PlayerAdapter from './PlayerAdapter';
import ZwPlayerAdapter from './zwplayer/adapter';

// 按需导入适配器
const loadAdapter = async (adapterName: string): Promise<typeof PlayerAdapter | null> => {
  try {
    switch (adapterName) {
      case 'zwplayer':
        return ZwPlayerAdapter;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load adapter: ${adapterName}`, error);
    return null;
  }
};

export { loadAdapter, ZwPlayerAdapter };
