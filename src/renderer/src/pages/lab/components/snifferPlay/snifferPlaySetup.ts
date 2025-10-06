import { ref, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import JSON5 from 'json5';
import sniffer from '@/utils/sniffer';
import { t } from '@/locales';
import { usePlayStore } from '@/store';
import { ZwPlayer } from '@/components/player/src/core/zwplayer/zwplayer';

// 初始化组件状态
export const useSnifferPlaySetup = () => {
  const storePlayer = usePlayStore();

  const formData = ref({
    sniffer: {
      url: '',
      ua: '',
      snifferExclude: '',
      customRegex: '',
      initScript: '',
      runScript: '',
      result: '',
    },
    player: {
      url: '',
      headers: '',
      type: 'auto',
    },
  });
  const playerRef = useTemplateRef('playerRef');
  const zwPlayer = ref<any>(null);

  const sniiferEvent = async () => {
    const { url, runScript, initScript, customRegex, snifferExclude } = formData.value.sniffer;
    if (!url) {
      MessagePlugin.warning(t('pages.lab.snifferPlay.message.snifferNoUrl'));
      return;
    }
    const res = await sniffer(url, runScript, initScript, customRegex, snifferExclude);
    if (res?.url) {
      formData.value.sniffer.result = JSON5.stringify(res);
      MessagePlugin.success(t('pages.setting.form.success'));
    } else {
      MessagePlugin.success(t('pages.setting.form.fail'));
    }
  };

  const playerPlayEvent = async () => {
    let { url, headers = '{}', type } = formData.value.player;
    if (!headers) headers = '{}';
    headers = Function('return (' + headers + ')')();

    if (!url || !(/^(http:\/\/|https:\/\/)/.test(url) || url.includes('magnet:'))) {
      MessagePlugin.warning(t('pages.lab.snifferPlay.message.playerNoUrl'));
      return;
    }

    const playerMode = storePlayer.setting.playerMode;

    if (playerMode.type === 'custom') {
      window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url });
    } else {
      let mediaType = type;
      if (mediaType === 'auto') {
        // 这里可以添加媒体类型检查逻辑
        // 为简化起见，我们直接使用传入的类型
      }

      // 销毁现有的播放器实例
      if (zwPlayer.value) {
        zwPlayer.value.destroy();
        zwPlayer.value = null;
      }

      // 创建新的ZwPlayer实例
      if (playerRef.value) {
        zwPlayer.value = new ZwPlayer({
          container: playerRef.value,
          url: url,
          type: mediaType,
          isLive: false,
          headers: headers,
        });
      }
    }

    MessagePlugin.success(t('pages.setting.form.success'));
  };

  const playerClearEvent = async () => {
    // 销毁播放器实例
    if (zwPlayer.value) {
      zwPlayer.value.destroy();
      zwPlayer.value = null;
    }
  };

  return {
    formData,
    playerRef,
    zwPlayer,
    sniiferEvent,
    playerPlayEvent,
    playerClearEvent,
  };
};
