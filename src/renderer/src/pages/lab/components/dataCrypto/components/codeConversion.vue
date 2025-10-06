<template>
  <div class="code-conversion view-container">
    <div class="header">
      <title-menu :list="navList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <t-textarea
          v-model="formData.input"
          :autosize="{ minRows: 3, maxRows: 5 }"
          :placeholder="$t('pages.setting.placeholder.general')"
        />
      </div>
      <div class="action">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.action') }}</p>
        <div class="btn">
          <t-button theme="primary" block @click="codeConversionEvent('encode')">{{
            $t('pages.lab.dataCrypto.encode')
          }}</t-button>
          <t-button variant="outline" block @click="codeConversionEvent('decode')">{{
            $t('pages.lab.dataCrypto.decode')
          }}</t-button>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.output') }}</p>
        <t-textarea
          v-model="formData.output"
          :autosize="{ minRows: 3, maxRows: 5 }"
          readonly
          @click="copyStrEvent(formData.output)"
        ></t-textarea>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCodeConversionSetup } from './codeConversion/codeConversionSetup';
import TitleMenu from '@/components/title-menu/index.vue';

const { formData, active, navList, changeNavEvent, codeConversionEvent, copyStrEvent } = useCodeConversionSetup();
</script>

<style lang="less" scoped>
.view-container {
  padding: 0;
  gap: var(--td-size-4);

  .header {
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0 var(--td-comp-paddingLR-xxs);
    flex: 1;
  }

  .input,
  .output,
  .action {
    display: flex;
    flex-direction: column;
    grid-gap: 16px;

    :deep(textarea),
    :deep(.t-input) {
      border-color: transparent;
      background-color: var(--td-bg-content-input-2);
      border-radius: var(--td-radius-medium);
    }
  }

  .action {
    .btn {
      display: flex;
    }
  }
}
</style>
