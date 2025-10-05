import { defineComponent, onUnmounted, ref, shallowRef, toRaw } from 'vue';
import type { SetupContext } from 'vue';
import { loadAdapter } from './core';
import { singleton, mediaUtils } from './utils/tool';
import { ZwPlayer } from './core/zwplayer/zwplayer';
import './assets/css/index.less';

const MultiPlayer = defineComponent({
  name: 'MultiPlayer',
  emits: ['updateTime'],
  setup(_props, ctx: SetupContext) {
    const adapter = shallowRef<any>();
    const zwPlayer = shallowRef<any>();
    const mseRef = ref<HTMLDivElement | null>();

    const create = async (doc: { [key: string]: any }, type: string = 'zwplayer') => {
      if (!doc?.url) return;

      // 如果是使用自定义播放器zwplayer
      if (type === 'zwplayer') {
        if (zwPlayer.value) await destroy();
        if (mseRef.value) mseRef.value.id = doc.container;
        
        // 创建ZwPlayer实例
        zwPlayer.value = new ZwPlayer({
          container: mseRef.value || doc.container,
          url: doc.url,
          type: doc.type,
          isLive: doc.isLive,
          headers: doc.headers,
          autoplay: true,
          volume: 1,
          muted: false,
          playbackRate: 1,
          startTime: 0
        });
        
        // 监听时间更新事件
        zwPlayer.value.on('timeupdate', ({ currentTime, duration }) => {
          ctx.emit('updateTime', { currentTime, duration });
        });
        
        return zwPlayer.value;
      }

      // 按需加载适配器（保持原有逻辑）
      const AdapterClass = await loadAdapter(type);
      if (!AdapterClass) {
        console.error(`Adapter ${type} not found`);
        return;
      }

      if (adapter.value) await destroy();
      const singleAdapter = singleton(AdapterClass);
      adapter.value = new singleAdapter();

      if (mseRef.value) mseRef.value.id = doc.container;
      if (!doc.headers) doc.headers = {};
      if (!doc.type) {
        const checkType = await mediaUtils.checkMediaType(doc.url, doc.headers);
        if (checkType === 'unknown' && !checkType) return;
        doc.type = checkType;
      }
      doc.type = mediaUtils.mediaType2PlayerType(doc.type);
      // hls 使用 Electron标识 拦截 其他 使用 url @kay 拦截
      if (doc.type !== 'customHls') {
        doc.url = mediaUtils.formatUrlHeaders(doc.url, doc.headers);
        doc.headers = mediaUtils.formatRemoveUnSafeHeaders(doc.headers);
      } else {
        doc.headers = mediaUtils.formatWeb2electronHeaders(doc.headers);
      }
      await adapter.value.create(toRaw(doc));
    };

    const destroy = async () => {
      // 销毁ZwPlayer实例
      if (zwPlayer.value) {
        zwPlayer.value.destroy();
        zwPlayer.value = null;
      }
      
      // 销毁适配器实例
      if (adapter.value) {
        await adapter.value.destroy();
        adapter.value = null;
      }
    };

    const play = async () => {
      if (zwPlayer.value) {
        await zwPlayer.value.play();
      } else if (adapter.value) {
        await adapter.value.play();
      }
    };

    const pause = async () => {
      if (zwPlayer.value) {
        await zwPlayer.value.pause();
      } else if (adapter.value) {
        await adapter.value.pause();
      }
    };

    const barrage = async (comments: string[], url: string, id: string) => {
      if (zwPlayer.value) {
        // ZwPlayer的弹幕功能实现
        // 这里可以根据需要实现弹幕功能
      } else if (adapter.value) {
        await adapter.value.barrage(toRaw(comments), url, id);
      }
    };

    const onTimeUpdate = async () => {
      if (zwPlayer.value) {
        // ZwPlayer已经自动监听了时间更新事件
        // 这里可以添加额外的处理逻辑
      } else if (adapter.value) {
        await adapter.value.onTimeUpdate(({ currentTime, duration }) => {
          ctx.emit('updateTime', { currentTime, duration });
        });
      }
    };

    onUnmounted(() => {
      destroy();
    });

    ctx.expose({
      barrage,
      create,
      destroy,
      play,
      pause,
      onTimeUpdate
    });

    return () => (
      <div class="multi-player">
        <div ref={mseRef} id="multi-mse" class="multi-mse"></div>
      </div>
    );
  },
});

export default MultiPlayer;
export type MultiPlayerInstance = InstanceType<typeof MultiPlayer>;