<template>
  <div class="get-html">
    <div class="input-group">
      <t-input v-model="formData.url" :placeholder="$t('pages.setting.placeholder.general')" class="input w-100%">
        <template #label>
          <t-select v-model="formData.method" auto-width>
            <t-option v-for="item in reqMethods" :key="item.value" :value="item.value" :label="item.label" />
          </t-select>
        </template>
        <template #suffix>
          <t-button theme="default" size="small" @click="active.reqDialog = true">
            <transform-icon />
          </t-button>
        </template>
      </t-input>
      <t-button class="button w-btn" theme="default" @click="onSubmit()">
        {{ $t('pages.lab.staticFilter.action.source') }}
      </t-button>
    </div>

    <t-dialog
      v-model:visible="active.reqDialog"
      show-in-attached-element
      attach="#main-component"
      placement="center"
      width="50%"
    >
      <template #header>
        {{ $t('pages.lab.req.title') }}
      </template>
      <template #body>
        <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="80">
          <t-form-item :label="$t('pages.lab.req.reqEncode')" name="encode">
            <t-select v-model="formData.encode" :options="reqEncode" />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.req.reqHeader')" name="header">
            <t-textarea v-model="formData.header" placeholder='{ "User-Agent": "Mozilla/5.0" }' />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.req.contentType')" name="contentType" v-if="formData.method !== 'GET'">
            <t-select v-model="formData.contentType" :options="reqContentTypes" />
          </t-form-item>
          <t-form-item :label="$t('pages.lab.req.reqBody')" name="body" v-if="formData.method !== 'GET'">
            <t-textarea v-model="formData.body" placeholder='{ "key": "01b9b7" }' />
          </t-form-item>
        </t-form>
      </template>
      <template #footer>
        <t-button variant="outline" @click="onReset">{{ $t('pages.setting.dialog.reset') }}</t-button>
        <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script lang="ts" setup>
import { TransformIcon } from 'tdesign-icons-vue-next';
import { useReqHtmlSetup } from './reqHtmlSetup';

const props = defineProps({
  data: {
    type: Object,
    default: {
      method: 'GET',
      url: '',
      encode: 'UTF-8',
      header: '{}',
      contentType: 'application/json',
      body: '{}',
    },
  },
});

const emits = defineEmits(['update:data', 'source']);

const { formData, active, reqMethods, reqEncode, reqContentTypes, onSubmit, onReset, RULES } = useReqHtmlSetup(
  props,
  emits,
);
</script>

<style lang="less" scoped>
.get-html {
  .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    grid-gap: var(--td-comp-margin-s);
  }

  :deep(.t-input) {
    .t-input__prefix:not(:empty) {
      margin-right: 0;
    }

    .t-input__suffix:not(:empty) {
      margin-left: 0;
    }
  }
}
</style>
