import { cloneDeep } from 'lodash-es';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { platform as AI_PLATFORM } from '@/config/ai';
import openaiIcon from '@/assets/ai/openai_kimi.png';
import userIcon from '@/assets/ai/user.png';
import {
  fetchAiConf,
  handleAiModel,
  handleOpenUrl,
  onSubmit,
  fetchAiReply,
  handleOperation,
  clearConfirm,
  handleInputStop,
} from './utils/aiBrainUtils';

export const useAiBrainSetup = () => {
  const AI_MODELS = ref([
    {
      label: 'gpt-3.5-turbo',
      value: 'gpt-3.5-turbo',
    },
    {
      label: 'gpt-4o',
      value: 'gpt-4o',
    },
    {
      label: 'gpt-4o-mini',
      value: 'gpt-4o-mini',
    },
  ]);

  const formData = ref({
    AI_MODELS: AI_MODELS.value,
    config: {
      server: '',
      key: '',
      model: 'gpt-3.5-turbo',
    },
    rawConfig: {
      server: '',
      key: '',
      model: 'gpt-3.5-turbo',
    },
    result: '',
    prompt: '',
    sessionId: '',
  });

  const chatRef = useTemplateRef<any>('chatRef');
  const active = ref({
    nav: '',
    setting: false,
    loading: false,
    isStreamLoad: false,
    isShowToBottom: false,
    good: false,
    bad: false,
  });
  const chatList = ref<any[]>([]);
  const actionStatus = ref({});
  const ctrl = ref();

  // 滚动到底部
  const backBottom = () => {
    chatRef.value?.scrollToBottom({
      behavior: 'smooth',
    });
  };

  const handleChatScroll = ({ e }: { e: Event }) => {
    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    active.value.isShowToBottom = scrollTop < 0;
  };

  // 初始化
  const init = () => {
    onMounted(() => {
      fetchAiConf(
        formData.value,
        (config: any) => {
          formData.value.config = config;
        },
        (rawConfig: any) => {
          formData.value.rawConfig = rawConfig;
        },
        (model: string, formData: any) => {
          const updatedModels = handleAiModel(model, formData);
          AI_MODELS.value = updatedModels;
          formData.value.AI_MODELS = updatedModels;
        },
        (callback: Function) => {
          setChatList(callback);
        },
      );
    });
  };

  // 设置聊天列表
  const setChatList = (callback: Function) => {
    chatList.value = callback(chatList.value);
  };

  // 设置活动状态
  const setActive = (callback: Function) => {
    active.value = callback(active.value);
  };

  // 设置操作状态
  const setActionStatus = (callback: Function) => {
    actionStatus.value = callback(actionStatus.value);
  };

  // 处理操作变更
  const handleOpChange = (type: string) => {
    active.value.nav = '';

    switch (type) {
      case 'setting':
        formData.value.config = cloneDeep(formData.value.rawConfig);
        active.value.setting = true;
        break;
    }
  };

  // 取消设置
  const onCancel = () => {
    active.value.setting = false;
  };

  // 规则
  const RULES = {
    server: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    model: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  };

  // 处理输入回车
  const handleInputEnter = async (val: string) => {
    if (!formData.value.config.server || !formData.value.config.key || !formData.value.config.model) {
      MessagePlugin.warning(t('pages.lab.aiBrain.message.aiParmsEmpty'));
      return;
    }
    if (!val) {
      MessagePlugin.warning(t('pages.lab.aiBrain.message.contentEmpty'));
      return;
    }
    if (active.value.isStreamLoad) {
      return;
    }

    setChatList((prev: any[]) => {
      const newList = [...prev];
      newList.unshift({
        // avatar: userIcon,
        content: val,
        role: 'user',
      });
      return newList;
    });

    if (!formData.value.sessionId) {
      // 这里需要实现createAiCache函数
      // const res = await createAiCache();
      // formData.value.sessionId = res.id;
    }

    const newCtrl = await fetchAiReply(val, formData.value, setChatList, setActive, chatList.value);

    if (newCtrl) {
      ctrl.value = newCtrl;
    }
  };

  return {
    AI_MODELS,
    AI_PLATFORM,
    formData,
    chatRef,
    active,
    chatList,
    actionStatus,
    ctrl,
    backBottom,
    handleChatScroll,
    init,
    handleOpChange,
    handleOpenUrl,
    handleAiModel: (val: string) => {
      const updatedModels = handleAiModel(val, formData.value);
      AI_MODELS.value = updatedModels;
      formData.value.AI_MODELS = updatedModels;
    },
    onCancel,
    onSubmit: async () => {
      const success = await onSubmit(
        formData.value,
        (rawConfig: any) => {
          formData.value.rawConfig = rawConfig;
        },
        setChatList,
      );
      if (success) {
        active.value.setting = false;
      }
    },
    handleInputEnter,
    handleInputStop: () => {
      handleInputStop(ctrl.value, setActive, setChatList);
    },
    handleOperation: async (type: string, options: { e: MouseEvent; index: number }) => {
      await handleOperation(
        type,
        options,
        chatList.value,
        setChatList,
        setActionStatus,
        formData.value,
        handleInputEnter,
      );
    },
    clearConfirm: async () => {
      const newSessionId = await clearConfirm(formData.value, setChatList, setActionStatus);
      if (newSessionId !== undefined) {
        formData.value.sessionId = newSessionId;
      }
    },
    RULES,
  };
};
