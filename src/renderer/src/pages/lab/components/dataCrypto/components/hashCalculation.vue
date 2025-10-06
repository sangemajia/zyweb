<template>
  <div class="hash-calculation view-container">
    <div class="header">
      <title-menu :list="navList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <div class="input-method" v-if="active.action === 'hmac'">
          <t-badge
            :count="$t('pages.lab.dataCrypto.hashCalculation.key')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-input
              v-model="formData.key"
              :placeholder="$t('pages.setting.placeholder.general')"
              @change="inputChangeEvent(formData.input)"
            />
          </t-badge>
        </div>
        <div class="input-method">
          <t-badge
            :count="$t('pages.lab.dataCrypto.hashCalculation.content')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('pages.setting.placeholder.general')"
              @change="inputChangeEvent"
            />
          </t-badge>
        </div>
      </div>
      <div class="output">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.output') }}</p>
        <t-input
          v-model="formData.output.md516"
          label="MD5-16"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.md516)"
        />
        <t-input
          v-model="formData.output.md532"
          label="MD5-32"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.md532)"
        />
        <t-input
          v-model="formData.output.sha1"
          label="SHA1"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.sha1)"
        />
        <t-input
          v-model="formData.output.sha224"
          label="SHA224"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.sha224)"
        />
        <t-input
          v-model="formData.output.sha256"
          label="SHA256"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.sha256)"
        />
        <t-input
          v-model="formData.output.sha3"
          label="SHA3"
          readonly
          placeholder
          @click="copyStrEvent(formData.output.sha3)"
        />
        <t-input
          v-model="formData.output.sha384"
          label="SHA384"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.sha384)"
        />
        <t-input
          v-model="formData.output.sha512"
          label="SHA512"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.sha512)"
        />
        <t-input
          v-model="formData.output.ripemd160"
          label="RIPEMD160"
          readonly
          placeholder=""
          @click="copyStrEvent(formData.output.ripemd160)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useHashCalculationSetup } from './hashCalculation/hashCalculationSetup';
import TitleMenu from '@/components/title-menu/index.vue';

const { formData, active, navList, changeNavEvent, inputChangeEvent, copyStrEvent } = useHashCalculationSetup();
</script>

<style lang="less" scoped>
.view-container {
  padding: 0;
  gap: var(--td-size-4);

  .header {
  }

  .content {
    padding: 0 var(--td-comp-paddingLR-xxs);
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex: 1;

    .input,
    .output {
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

    :deep(.t-badge) {
      width: 100%;

      .t-badge--round {
        right: auto;
        left: 10px !important;
        top: -10px !important;
        transform: none !important;
        z-index: 9;
      }
    }
  }
}
</style>
