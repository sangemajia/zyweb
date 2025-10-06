<template>
  <div class="encode-decode view-container">
    <div class="header">
      <title-menu :list="navList" :active="active.action" class="nav" @change-key="changeNavEvent" />
    </div>
    <div class="content">
      <div class="input">
        <p class="title-label">{{ $t('pages.lab.dataCrypto.input') }}</p>
        <div class="rc4 input-method" v-if="active.action === 'rc4'">
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.rc4.key')"
            color="var(--td-success-color)"
            shape="round"
          >
            <div class="input-groups">
              <t-select auto-width v-model="formData.crypto.keyEncode" style="width: auto">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.crypto.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.content')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('pages.setting.placeholder.general')"
            />
          </t-badge>
          <div class="input-groups">
            <t-badge
              :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.inputEncode')"
              color="var(--td-success-color)"
              shape="round"
            >
              <t-radio-group variant="default-filled" v-model="formData.crypto.encode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
            <t-badge
              :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.outputEncode')"
              color="var(--td-success-color)"
              shape="round"
            >
              <t-radio-group variant="default-filled" v-model="formData.crypto.outputEncode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
          </div>
        </div>
        <div class="rsa input-method" v-else-if="active.action === 'rsa'">
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.rsa.padding')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-radio-group variant="default-filled" v-model="formData.rsa.padding">
              <t-radio-button value="PKCS1">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.pkcs1') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.rsa.encode')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-radio-group variant="default-filled" v-model="formData.rsa.encode">
              <t-radio-button value="base64">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.base64') }}</t-radio-button>
              <t-radio-button value="hex">{{ $t('pages.lab.dataCrypto.encodeDecode.rsa.hex') }}</t-radio-button>
            </t-radio-group>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.rsa.key')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-textarea
              v-model="formData.rsa.key"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('pages.setting.placeholder.general')"
            />
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.content')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('pages.setting.placeholder.general')"
            />
          </t-badge>
        </div>
        <div
          class="aes input-method"
          v-else-if="['aes', 'des', 'tripleDES', 'rabbit', 'rabbitLegacy'].includes(active.action)"
        >
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.key')"
            color="var(--td-success-color)"
            shape="round"
          >
            <div class="input-groups">
              <t-select auto-width v-model="formData.crypto.keyEncode" style="width: auto">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.crypto.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.iv')"
            color="var(--td-success-color)"
            shape="round"
          >
            <div class="input-groups">
              <t-select auto-width v-model="formData.crypto.ivEncode" style="width: auto">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.crypto.iv" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.mode')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-radio-group variant="default-filled" v-model="formData.crypto.mode">
              <t-radio-button v-for="item in modeList" :key="item.value" :value="item.value" :label="item.label" />
            </t-radio-group>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.padding')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-radio-group variant="default-filled" v-model="formData.crypto.padding">
              <t-radio-button v-for="item in padList" :key="item.value" :value="item.value" :label="item.label" />
            </t-radio-group>
          </t-badge>
          <div class="input-groups">
            <t-badge
              :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.inputEncode')"
              color="var(--td-success-color)"
              shape="round"
            >
              <t-radio-group variant="default-filled" v-model="formData.crypto.encode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
            <t-badge
              :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.outputEncode')"
              color="var(--td-success-color)"
              shape="round"
            >
              <t-radio-group variant="default-filled" v-model="formData.crypto.outputEncode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
          </div>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.content')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('pages.setting.placeholder.general')"
            />
          </t-badge>
        </div>
        <div class="sm4 input-method" v-else-if="active.action === 'sm4'">
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.key')"
            color="var(--td-success-color)"
            shape="round"
          >
            <div class="input-groups">
              <t-select auto-width v-model="formData.sm4.keyEncode" style="width: auto">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.sm4.key" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.iv')"
            color="var(--td-success-color)"
            shape="round"
          >
            <div class="input-groups">
              <t-select auto-width v-model="formData.sm4.ivEncode" style="width: auto">
                <t-option v-for="item in keyEncodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-select>
              <t-input v-model="formData.sm4.iv" :placeholder="$t('pages.setting.placeholder.general')" />
            </div>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.mode')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-radio-group variant="default-filled" v-model="formData.sm4.mode">
              <t-radio-button value="cbc" label="CBC" />
              <t-radio-button value="ecb" label="ECB" />
            </t-radio-group>
          </t-badge>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.padding')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-radio-group variant="default-filled" v-model="formData.sm4.padding">
              <t-radio-button value="Pkcs7Padding" label="PKCS7" />
              <t-radio-button value="NoPadding" label="NoPadding" />
            </t-radio-group>
          </t-badge>
          <div class="input-groups">
            <t-badge
              :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.inputEncode')"
              color="var(--td-success-color)"
              shape="round"
            >
              <t-radio-group variant="default-filled" v-model="formData.sm4.encode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
            <t-badge
              :count="$t('pages.lab.dataCrypto.encodeDecode.crypto.outputEncode')"
              color="var(--td-success-color)"
              shape="round"
            >
              <t-radio-group variant="default-filled" v-model="formData.sm4.outputEncode">
                <t-radio-button v-for="item in encodeList" :key="item.value" :value="item.value" :label="item.label" />
              </t-radio-group>
            </t-badge>
          </div>
          <t-badge
            :count="$t('pages.lab.dataCrypto.encodeDecode.content')"
            color="var(--td-success-color)"
            shape="round"
          >
            <t-textarea
              v-model="formData.input"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('pages.setting.placeholder.general')"
            />
          </t-badge>
        </div>
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
import { useEncodeDecodeSetup } from './encodeDecode/encodeDecodeSetup';
import TitleMenu from '@/components/title-menu/index.vue';

const {
  formData,
  active,
  navList,
  padList,
  modeList,
  keyEncodeList,
  encodeList,
  changeNavEvent,
  codeConversionEvent,
  copyStrEvent,
} = useEncodeDecodeSetup();
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
  }

  .input,
  .output,
  .action {
    display: flex;
    flex-direction: column;
    grid-gap: 16px;

    .input-method {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .input-groups {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 16px;
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
