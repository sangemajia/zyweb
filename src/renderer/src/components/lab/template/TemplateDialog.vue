<template>
  <t-dialog
    v-model:visible="visible"
    :header="$t('pages.lab.jsEdit.template')"
    show-in-attached-element
    attach="#main-component"
    @confirm="handleConfirm"
  >
    <t-form ref="formRef" :data="formData" :rules="rules" :label-width="60">
      <t-form-item name="template" label-width="0px">
        <t-select v-model="formData.template">
          <t-option v-for="(item, index) in templateOptions" :key="index" :value="item" :label="item" />
        </t-select>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  templateOptions: {
    type: Array,
    default: () => [],
  },
  initialValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:visible', 'confirm']);

const formRef = ref(null);
const formData = ref({
  template: props.initialValue,
});

const rules = {
  template: [{ required: true, message: '请选择模板', type: 'error' }],
};

const handleConfirm = () => {
  emit('confirm', formData.value.template);
};
</script>
