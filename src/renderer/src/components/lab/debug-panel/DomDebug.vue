<template>
  <div class="dom_debug">
    <div class="item">
      <reqHtml class="item source" v-model:data="reqData" @source="handleSourceFetch" />
    </div>
    <div class="item">
      <DebugInput
        v-model="pdfaRule"
        :label="$t('pages.lab.jsEdit.rule.pdfa')"
        :placeholder="$t('pages.setting.placeholder.pdfaTip')"
        :button-text="$t('pages.lab.jsEdit.rule.try')"
        input-class="w-100%"
        @click="handlePdfaDebug"
      />
    </div>
    <div class="item">
      <DebugInput
        v-model="pdfhRule"
        :label="$t('pages.lab.jsEdit.rule.pdfh')"
        :placeholder="$t('pages.setting.placeholder.pdfaTip')"
        :button-text="$t('pages.lab.jsEdit.rule.try')"
        input-class="w-100%"
        @click="handlePdfhDebug"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import reqHtml from '@/pages/lab/components/reqHtml/index.vue';
import DebugInput from './components/DebugInput.vue';

const props = defineProps({
  reqData: {
    type: Object,
    default: () => ({}),
  },
  pdfaRule: {
    type: String,
    default: '',
  },
  pdfhRule: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['source', 'pdfa-debug', 'pdfh-debug']);

const handleSourceFetch = (source: any) => {
  emit('source', source);
};

const handlePdfaDebug = () => {
  emit('pdfa-debug');
};

const handlePdfhDebug = () => {
  emit('pdfh-debug');
};
</script>
