import { MessagePlugin } from 'tdesign-vue-next';
import { t } from '@/locales';
import { fetchAiChat, fetchAiStream, delAiCache, addAiCache, createAiCache, putAiCache } from '@/api/lab';
import { fetchSettingDetail, putSetting } from '@/api/setting';
import { platform as AI_PLATFORM } from '@/config/ai';
import { useLocale } from '@/locales/useLocale';

// 获取AI配置
const fetchAiConf = async (
  formData: any,
  setConfig: Function,
  setRawConfig: Function,
  handleAiModel: Function,
  setChatList: Function,
) => {
  const res = await fetchSettingDetail('ai');
  if (res) {
    setConfig(res);
    setRawConfig(res);
    const model = res.model || 'gpt-3.5-turbo';
    handleAiModel(model, formData);
    setChatList((prev: any[]) => {
      const newList = [...prev];
      newList.unshift({
        content: t('pages.lab.aiBrain.chat.modelChange', { model }),
        role: 'model-change',
      });
      return newList;
    });
  }
};

// 处理AI模型
const handleAiModel = (val: string, formData: any) => {
  const AI_MODELS = formData.AI_MODELS || [
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
  ];

  const targetIndex = AI_MODELS.findIndex((obj: any) => obj.label === val);
  if (targetIndex === -1) {
    AI_MODELS.push({ value: val, label: val });
    return AI_MODELS;
  }
  return AI_MODELS;
};

// 打开URL
const handleOpenUrl = (url: string) => {
  if (!/^(https?:\/\/)/.test(url)) return;
  window.electron.ipcRenderer.send('open-url', url);
};

// 提交表单
const onSubmit = async (formData: any, setRawConfig: Function, setChatList: Function) => {
  try {
    await putSetting({ key: 'ai', doc: formData.config });
    if (formData.config.model !== formData.rawConfig.model) {
      setChatList((prev: any[]) => {
        const newList = [...prev];
        newList.unshift({
          content: t('pages.lab.aiBrain.chat.modelChange', { model: formData.config.model }),
          role: 'model-change',
        });
        return newList;
      });
    }
    setRawConfig(formData.config);
    MessagePlugin.success(t('pages.setting.data.success'));
    return true;
  } catch (err) {
    MessagePlugin.error(`${t('pages.setting.data.fail')}:${err}`);
    return false;
  }
};

// 获取AI回复
const fetchAiReply = async (
  prompt: string,
  formData: any,
  setChatList: Function,
  setActive: Function,
  chatList: any[],
) => {
  setActive((prev: any) => ({ ...prev, loading: true, isStreamLoad: true }));

  setChatList((prev: any[]) => {
    const newList = [...prev];
    newList.unshift({
      avatar: '', // openaiIcon会在组件中处理
      role: 'assistant',
      content: '',
      reasoning: '',
      duration: 0,
    });
    return newList;
  });

  try {
    const startTime = Date.now();
    const ctrl = new AbortController();
    const {
      config: { model },
      sessionId,
    } = formData;

    fetchAiStream({
      data: { prompt, model, sessionId },
      ctrl: ctrl,
      options: {
        success(result) {
          if (!result) return;
          setChatList((prev: any[]) => {
            const newList = [...prev];
            const lastItem = newList[0];
            if (lastItem) {
              lastItem.reasoning += result.delta?.reasoning_content || '';
              lastItem.content += result.delta?.content || '';
            }
            return newList;
          });
        },
        fail(err) {
          setChatList((prev: any[]) => {
            const newList = [...prev];
            const lastItem = newList[0];
            if (lastItem) {
              lastItem.role = 'error';
              lastItem.content = err.message;
              lastItem.reasoning = err.message;
              // 显示用时
              lastItem.duration = Math.floor((Date.now() - startTime) / 1000);
            }
            return newList;
          });
          setActive((prev: any) => ({ ...prev, isStreamLoad: false, loading: false }));
        },
        complete(isOk, msg) {
          setChatList((prev: any[]) => {
            const newList = [...prev];
            const lastItem = newList[0];
            if (lastItem) {
              if (!isOk) {
                lastItem.role = 'error';
                lastItem.content = msg;
                lastItem.reasoning = msg;
              }
              // 显示用时
              lastItem.duration = Math.floor((Date.now() - startTime) / 1000);
            }
            return newList;
          });
          setActive((prev: any) => ({ ...prev, isStreamLoad: false, loading: false }));
        },
      },
    });

    return ctrl;
  } catch (err: any) {
    console.error(err);
    setChatList((prev: any[]) => {
      const newList = [...prev];
      const lastItem = newList[0];
      if (lastItem) {
        lastItem.role = 'error';
        lastItem.content = err.message;
        lastItem.reasoning = err.message;
      }
      return newList;
    });
    setActive((prev: any) => ({ ...prev, loading: false, isStreamLoad: false }));
    return null;
  }
};

// 处理操作
const handleOperation = async (
  type: string,
  options: { e: MouseEvent; index: number },
  chatList: any[],
  setChatList: Function,
  setActionStatus: Function,
  formData: any,
  handleInputEnter: Function,
) => {
  const { index } = options;
  if (type === 'good') {
    const position = chatList.length - index;
    setActionStatus((prev: any) => ({
      ...prev,
      [position]: {
        good: !prev[position]?.good,
        bad: false,
      },
    }));
  } else if (type === 'bad') {
    const position = chatList.length - index;
    setActionStatus((prev: any) => ({
      ...prev,
      [position]: {
        good: false,
        bad: !prev[position]?.bad,
      },
    }));
  } else if (type === 'replay') {
    const userQuery = chatList[index + 1]?.content; // 获取用户输入

    // 删除当前机器回复和用户输入 第一次机器回复 第二次用户输入
    setChatList((prev: any[]) => {
      const newList = [...prev];
      for (let i = 1; i <= 2; i++) {
        newList.shift();
      }
      return newList;
    });

    // 删除缓存
    await delAiCache({ ids: formData.sessionId, metadata: [-1] });

    await handleInputEnter(userQuery);
  } else if (type === 'copy') {
    // 复制操作
    const content = chatList[index]?.content;
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        MessagePlugin.success(t('pages.lab.aiBrain.message.copySuccess'));
      } catch (err) {
        MessagePlugin.error(t('pages.lab.aiBrain.message.copyFail'));
      }
    }
  }
};

// 清除确认
const clearConfirm = async (formData: any, setChatList: Function, setActionStatus: Function) => {
  setChatList([]);
  setActionStatus({});

  const { sessionId } = formData;
  if (sessionId) {
    await delAiCache({ ids: sessionId, metadata: [] });
    return '';
  }
  return sessionId;
};

// 处理输入停止
const handleInputStop = (ctrl: any, setActive: Function, setChatList: Function) => {
  if (ctrl) {
    ctrl.abort();
  }
  setActive((prev: any) => ({ ...prev, loading: false, isStreamLoad: false }));

  setChatList((prev: any[]) => {
    const newList = [...prev];
    const lastItem = newList[0];
    if (lastItem && lastItem.content.length === 0) {
      lastItem.content = '用户已停止内容生成';
    }
    return newList;
  });
};

export {
  fetchAiConf,
  handleAiModel,
  handleOpenUrl,
  onSubmit,
  fetchAiReply,
  handleOperation,
  clearConfirm,
  handleInputStop,
};
