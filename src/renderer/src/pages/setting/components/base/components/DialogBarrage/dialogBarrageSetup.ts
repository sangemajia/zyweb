import { ref, watch, useTemplateRef } from 'vue';
import { FormInstanceFunctions, FormProps, MessagePlugin } from 'tdesign-vue-next';
import { cloneDeep, uniq } from 'lodash-es';
import { t } from '@/locales';

// 初始化组件状态
export const useDialogBarrageSetup = (props: any, emits: any) => {
  const formVisible = ref(false);
  const formData = ref({
    data: cloneDeep(props.data),
    raw: cloneDeep(props.data),
  });
  const formRef = useTemplateRef<FormInstanceFunctions>('formRef');

  watch(
    () => formVisible.value,
    (val) => {
      emits('update:visible', val);
    },
  );

  watch(
    () => props.visible,
    (val) => {
      formVisible.value = val;
    },
  );

  watch(
    () => props.data,
    (val) => {
      formData.value = { data: cloneDeep(val), raw: cloneDeep(val) };
    },
  );

  const handleFlagFilter = (value: string[]) => {
    formData.value.data.support = uniq(value);
  };

  const onSubmit: FormProps['onSubmit'] = async () => {
    formRef.value?.validate().then((validateResult) => {
      if (validateResult && Object.keys(validateResult).length) {
        const firstError = Object.values(validateResult)[0]?.[0]?.message;
        MessagePlugin.warning(firstError);
      } else {
        const { data, type } = formData.value.data;
        emits('submit', { data, type });
        formVisible.value = false;
      }
    });
  };

  const onReset: FormProps['onReset'] = () => {
    formData.value.data = { ...formData.value.raw };
  };

  const RULES = {
    url: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    id: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    key: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    support: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    start: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    mode: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    color: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
    content: [{ required: true, message: t('pages.setting.dialog.rule.message'), type: 'error' }],
  };

  return {
    formVisible,
    formData,
    formRef,
    handleFlagFilter,
    onSubmit,
    onReset,
    RULES,
  };
};
