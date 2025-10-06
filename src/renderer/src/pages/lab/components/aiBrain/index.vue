<template>
  <div class="ai-brain view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.aiBrain') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="setting">{{ $t('pages.lab.aiBrain.setting') }}</t-radio-button>
        </t-radio-group>

        <t-dialog
          v-model:visible="active.setting"
          show-in-attached-element
          attach="#main-component"
          placement="center"
          width="50%"
        >
          <template #header>
            {{ $t('pages.lab.aiBrain.setting') }}
          </template>
          <template #body>
            <t-form ref="formRef" :data="formData" :rules="RULES" :label-width="60">
              <div class="data-item">
                <p class="title-label mg-b">{{ $t('pages.lab.aiBrain.platform.title') }}</p>
                <t-space>
                  <template v-for="item in AI_PLATFORM_REF">
                    <t-link theme="default" @click="handleOpenUrl(item.url)">{{ item.name }}</t-link>
                  </template>
                </t-space>
              </div>
              <div class="data-item">
                <p class="title-label mg-tb">{{ $t('pages.lab.aiBrain.params') }}</p>
                <t-form-item :label="$t('pages.lab.aiBrain.server')" name="server">
                  <t-input
                    v-model="formData.config.server"
                    :placeholder="$t('pages.setting.placeholder.general')"
                  ></t-input>
                </t-form-item>
                <t-form-item :label="$t('pages.lab.aiBrain.key')" name="key">
                  <t-input
                    v-model="formData.config.key"
                    type="password"
                    :placeholder="$t('pages.setting.placeholder.general')"
                  ></t-input>
                </t-form-item>
                <t-form-item :label="$t('pages.lab.aiBrain.model')" name="model">
                  <t-select v-model="formData.config.model" creatable filterable>
                    <t-option
                      v-for="item in AI_MODELS"
                      :key="item.label"
                      :value="item.value"
                      :label="item.label"
                      @create="handleAiModel"
                    />
                  </t-select>
                </t-form-item>
              </div>
            </t-form>
          </template>
          <template #footer>
            <t-button variant="outline" @click="onCancel">{{ $t('pages.setting.dialog.cancel') }}</t-button>
            <t-button theme="primary" @click="onSubmit">{{ $t('pages.setting.dialog.confirm') }}</t-button>
          </template>
        </t-dialog>
      </div>
    </div>
    <div class="content">
      <t-chat
        ref="chatRef"
        :data="chatList"
        :clear-history="chatList.length > 0 && !active.isStreamLoad"
        :is-stream-load="active.isStreamLoad"
        @scroll="handleChatScroll"
        @clear="clearConfirm"
      >
        <!-- eslint-disable vue/no-unused-vars -->
        <template #content="{ item, index }">
          <t-chat-reasoning v-if="item.reasoning?.length > 0" expand-icon-placement="right">
            <template #header>
              <t-chat-loading v-if="active.isStreamLoad" :text="$t('pages.lab.aiBrain.reasoning')" />
              <div v-else style="display: flex; align-items: center">
                <CheckCircleIcon style="color: var(--td-success-color-5); font-size: 20px; margin-right: 8px" />
                <span>{{ $t('pages.lab.aiBrain.reasoned') }}</span>
              </div>
            </template>
            <t-chat-content v-if="item.reasoning.length > 0" :content="item.reasoning" />
          </t-chat-reasoning>
          <t-chat-loading
            v-if="active.isStreamLoad && item.content.length === 0"
            animation="gradient"
            class="t-chat__text--loading"
          />
          <t-chat-content v-if="item.content.length > 0" :content="item.content" />
          <!-- <t-chat-item
            v-if="item.content.length > 0"
            :avatar="item.avatar"
            :role="item.role"
            :content="item.content"
            :text-loading="index === 0 && active.loading"
          /> -->
        </template>
        <template #actions="{ item, index }">
          <t-chat-action
            :disabled="active.isStreamLoad && index === 0"
            :content="item.content"
            :is-good="actionStatus[chatList.length - index]?.good"
            :is-bad="actionStatus[chatList.length - index]?.bad"
            :operation-btn="index === 0 ? ['good', 'bad', 'replay', 'copy'] : ['good', 'bad', 'copy']"
            @operation="(type: string, { e }) => handleOperation(type, { e, index })"
          />
        </template>
        <template #footer>
          <t-chat-sender
            :stop-disabled="active.isStreamLoad"
            :textarea-props="{
              placeholder: $t('pages.lab.aiBrain.placeholder.input'),
            }"
            @send="handleInputEnter"
            @stop="handleInputStop"
          >
            <!-- 自定义操作区域的内容，默认支持图片上传、附件上传和发送按钮 -->
            <template #suffix="{ renderPresets }">
              <!-- 在这里可以进行自由的组合使用，或者新增预设 -->
              <!-- 不需要附件操作的使用方式 -->
              <component :is="renderPresets([])" />
              <!-- 只需要附件上传的使用方式-->
              <!-- <component :is="renderPresets([{ name: 'uploadAttachment' }])" /> -->
              <!-- 只需要图片上传的使用方式-->
              <!-- <component :is="renderPresets([{ name: 'uploadImage' }])" /> -->
              <!-- 任意配置顺序-->
              <!-- <component :is="renderPresets([{ name: 'uploadAttachment' }, { name: 'uploadImage' }])" /> -->
            </template>
          </t-chat-sender>
        </template>
      </t-chat>
      <t-button v-show="active.isShowToBottom" variant="text" class="bottomBtn" @click="backBottom">
        <div class="to-bottom">
          <ArrowDownIcon />
        </div>
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash-es';
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { ArrowDownIcon, CheckCircleIcon } from 'tdesign-icons-vue-next';
import {
  Chat as TChat,
  ChatAction as TChatAction,
  ChatContent as TChatContent,
  ChatInput as TChatInput,
  ChatItem as TChatItem,
  ChatLoading as TChatLoading,
  ChatReasoning as TChatReasoning,
  ChatSender as TChatSender,
} from '@tdesign-vue-next/chat';

import { t } from '@/locales';
import { platform as AI_PLATFORM } from '@/config/ai';
import openaiIcon from '@/assets/ai/openai_kimi.png';
import userIcon from '@/assets/ai/user.png';
import { useAiBrainSetup } from './aiBrainSetup';

const {
  AI_MODELS,
  AI_PLATFORM: AI_PLATFORM_REF,
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
  handleAiModel,
  onCancel,
  onSubmit,
  handleInputEnter,
  handleInputStop,
  handleOperation,
  clearConfirm,
  RULES,
} = useAiBrainSetup();

init();
</script>

<style lang="less" scoped>
.view-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--td-size-4);

  .header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 36px;

    .left-operation-container {
      display: flex;
      flex-direction: row;
      align-items: center;

      .title {
        margin-right: 5px;
      }
    }

    .right-operation-container {
      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;
        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
      }
    }
  }

  .content {
    flex: 1;
    width: 100%;
    max-width: 734px;
    margin: 0 auto;
    height: auto;
    overflow: hidden;

    :deep(.t-chat__inner) {
      .t-chat__notice {
        color: var(--td-text-color-secondary);
        background-color: var(--td-bg-content-input-2);
      }
    }

    :deep(.t-chat__text--loading) {
      padding: var(--td-comp-paddingTB-m) var(--td-comp-paddingLR-l);
    }

    :deep(.t-chat__text) {
      .t-chat__text__user,
      .t-chat__text--user {
        background: var(--td-bg-color-secondarycontainer);
        color: var(--td-text-color-primary);
        border-radius: var(--td-radius-default);
        padding: var(--td-comp-paddingTB-xxs) var(--td-comp-paddingLR-s);

        pre {
          background-color: transparent;
          color: var(--td-text-color-primary);
        }
      }

      .t-chat__text__assistant,
      .t-chat__text--assistant {
        a {
          color: var(--td-text-color-primary);
          pointer-events: none;
        }
      }
    }

    :deep(.t-chat__actions) {
      border: none;
      background-color: transparent;

      .t-button {
        background-color: transparent;

        &:hover {
          background-color: var(--td-bg-content-input-2);
        }
      }
    }

    :deep(.t-chat__refresh-line) {
      display: none;
    }

    :deep(.t-chat__list) {
      padding-right: var(--td-comp-paddingTB-s);
    }

    :deep(.t-chat__footer) {
      padding: 2px;

      .t-chat__footer__textarea {
        border-radius: var(--td-radius-default);

        .t-textarea {
          .t-textarea__inner {
            border-radius: var(--td-radius-default);
            background-color: var(--td-bg-content-input-2);

            &:hover {
              box-shadow: none;
            }
          }
        }

        .t-chat__footer__textarea__icon {
          .t-chat__footer__textarea__icon__default {
            border-radius: var(--td-radius-default);
          }
        }
      }

      .t-chat__footer__stopbtn {
        .t-button {
          border-radius: var(--td-radius-default);
          background-color: var(--td-bg-content-input-2);
          // border-color: transparent;
        }
      }

      .chat-action-footer {
        text-align: center;
        font-size: 12px;
        color: var(--td-text-color-secondary);
      }
    }

    .bottomBtn {
      position: absolute;
      left: 50%;
      margin-left: -20px;
      bottom: 200px;
      padding: 0;
      border: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      box-shadow: var(--td-shadow-3);
    }

    .to-bottom {
      width: 40px;
      height: 40px;
      border: 2px solid var(--td-font-white-1);
      box-sizing: border-box;
      background: var(--td-bg-color-container);
      border-radius: 50%;
      font-size: 24px;
      line-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      .t-icon {
        font-size: 24px;
      }
    }
  }
}
</style>

<style lang="less">
@import '@/style/theme/index.less';
@import '@/style/layout.less';
</style>
