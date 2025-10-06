<template>
  <div class="js-edit view-container" id="main-component">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.jsEdit.title') }}</h3>
      </div>
      <div class="right-operation-container">
        <ModeToggle :mode="form.init.mode" @click="handleModeToggle" />

        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="template">{{ $t('pages.lab.jsEdit.template') }}</t-radio-button>
          <FileOperation v-model="tmp.file" :options="fileOptions" @change="handleOpFileChange" />
          <t-radio-button value="debug">{{ $t('pages.lab.jsEdit.bug') }}</t-radio-button>
        </t-radio-group>

        <t-dialog
          v-model:visible="active.template"
          :header="$t('pages.lab.jsEdit.template')"
          show-in-attached-element
          attach="#main-component"
          @confirm="confirmTemplate()"
        >
          <t-form ref="formRef" :data="form" :rules="TEMPLATE_RULES" :label-width="60">
            <t-form-item name="template" label-width="0px">
              <t-select v-model="form.template">
                <t-option v-for="(item, index) in Object.keys(mubanData)" :key="index" :value="item" :label="item" />
              </t-select>
            </t-form-item>
          </t-form>
        </t-dialog>
      </div>
    </div>
    <div class="content">
      <splitpanes class="default-theme split-pane" horizontal>
        <pane size="70">
          <splitpanes class="default-theme split-pane">
            <pane>
              <CodeEditors
                v-model:js-content="form.content.js"
                v-model:html-content="form.content.html"
                :js-edit-conf="jsEditConf"
                :html-edit-conf="htmlEditConf"
                @drop="handleMonacoDrop"
                @monaco-object="handleMonacoObject"
              />
            </pane>
            <pane>
              <DebugPanel
                v-model:activeTab="active.action"
                :req-data="form.req"
                :pdfa-rule="form.rule.pdfa"
                :pdfh-rule="form.rule.pdfh"
                :is-auto-mode="form.init.auto"
                :category="form.category"
                :detail="form.detail"
                :search="form.search"
                :play="form.play"
                :proxy="form.proxy"
                :webview-url="controlText"
                :is-webview-visible="isWebviewVisible"
                @source="handleSourceFetch"
                @pdfa-debug="handleDomDebugPdfa"
                @pdfh-debug="handleDomDebugPdfh"
                @init-debug="handleDataDebugInit"
                @log-debug="handleDataDebugLog"
                @home-debug="handleDataDebugHome"
                @home-vod-debug="handleDataDebugHomeVod"
                @category-debug="handleDataDebugCategory"
                @detail-debug="handleDataDebugDetail"
                @search-debug="handleDataDebugSearch"
                @play-debug="handleDataDebugPlay"
                @proxy-debug="handleDataDebugProxy"
                @proxy-upload-debug="handleDataDebugProxyUpload"
                @toggle-auto-mode="form.init.auto = !form.init.auto"
                @webview-control="handleWebviewControl"
                @webview-load="handleWebviewLoad"
              />
            </pane>
          </splitpanes>
        </pane>
        <pane>
          <ConsolePanel :options="termConf" ref="logRef" class="console-pane" @clear="handleConsoleClear" />
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css';

import { computed, nextTick, onActivated, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { GestureClickIcon, ArrowLeftIcon, ArrowRightIcon, ClearIcon, RotateIcon } from 'tdesign-icons-vue-next';
import { t } from '@/locales';
import { useSettingStore } from '@/store';
import emitter from '@/utils/emitter';
import CodeEditors from '@/components/lab/code-editors/CodeEditors.vue';
import DebugPanel from '@/components/lab/debug-panel/DebugPanel.vue';
import ConsolePanel from '@/components/lab/console/ConsolePanel.vue';
import ModeToggle from '@/components/lab/mode/ModeToggle.vue';
import FileOperation from '@/components/lab/file/FileOperation.vue';
import reqHtml from '../reqHtml/index.vue';
import TerminalView from '@/components/terminal/index.vue';

// Import setup module
import { useJsEditSetup } from './jsEditSetup';

// Import utility modules
import {
  utilsRead,
  utilsWrite,
  utilsPutSite,
  utilsGetLog,
  utilsClearLog,
  utilsBasePath,
  setupData,
} from './utils/fileUtils';

import {
  getTemplate,
  confirmTemplate,
  handleImportFile,
  handleExportFile,
  handleDebug,
  handleDecode,
  handleOpChange,
  handleOpFileChange,
  handleDomDebugPdfa,
  handleDomDebugPdfh,
  handleDomDebug,
  handleModeToggle,
  handleDataDebugLog,
  handleDataDebugInit,
  handleDataDebugHome,
  handleDataDebugHomeVod,
  handleDataDebugCategory,
  handleDataDebugDetail,
  handleDataDebugSearch,
  handleDataDebugPlay,
  handleDataDebugProxy,
  handleDataDebugProxyUpload,
  handleDataDebug,
} from './utils/opUtils';

import { handleMonacoDrop, handleMonacoObject } from './utils/monacoUtils';

import {
  validateAndRecoverWebview,
  bindDomReady,
  resetWebview,
  handleWebviewLoad,
  handleWebviewControl,
} from './utils/webviewUtils';

const TEMPLATE_RULES = {};

const router = useRouter();
const storeSetting = useSettingStore();

// 使用setup模块
const {
  theme,
  tmp,
  form,
  active,
  mubanData,
  debugId,
  termConf,
  jsEditConf,
  htmlEditConf,
  controlText,
  isWebviewVisible,
  webviewRef,
  logRef,
  setupWatchers,
  setupLifecycle,
  setupConsole,
  handleConsoleClear,
  validateAndRecoverWebview: validateAndRecoverWebviewFn,
} = useJsEditSetup();

const fileOptions = [
  { label: t('pages.lab.jsEdit.file'), value: 'file' },
  { label: t('pages.lab.jsEdit.import'), value: 'import' },
  { label: t('pages.lab.jsEdit.export'), value: 'export' },
  { label: t('pages.lab.jsEdit.decode'), value: 'decode' },
];

// Setup watchers
setupWatchers(logRef);

// Setup lifecycle
setupLifecycle(logRef, webviewRef);

// 导出函数供模板使用
// op functions
const handleSourceFetch = (data: string) => {
  active.value.editor = 'html';
  form.value.content.html = data;
};

// dom functions
const handleDomDebugPdfaFn = async () => {
  await handleDomDebugPdfa(form.value.rule.pdfa, form.value.content.html, logRef);
};

const handleDomDebugPdfhFn = async () => {
  await handleDomDebugPdfh(form.value.rule.pdfh, form.value.content.html, logRef);
};

// btn functions
const handleModeToggleFn = async () => {
  await handleModeToggle(
    form.value.init.mode,
    (mode) => {
      form.value.init.mode = mode;
    },
    (js) => {
      form.value.content.js = js;
    },
    debugId.value,
  );
};

const handleDataDebugLogFn = async () => {
  await handleDataDebugLog(form.value.init.mode, debugId.value, logRef);
};

// data functions
const handleDataDebugInitFn = async () => {
  await handleDataDebugInit(
    true,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    form.value.init.mode,
    form.value.content.js,
    debugId.value,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugHomeFn = async () => {
  await handleDataDebugHome(
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugHomeVodFn = async () => {
  await handleDataDebugHomeVod(
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugCategoryFn = async () => {
  await handleDataDebugCategory(
    form.value.category.t,
    form.value.category.f,
    form.value.category.pg,
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugDetailFn = async () => {
  await handleDataDebugDetail(
    form.value.detail.ids,
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugSearchFn = async () => {
  await handleDataDebugSearch(
    form.value.search.wd,
    form.value.search.pg,
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugPlayFn = async () => {
  await handleDataDebugPlay(
    form.value.play.flag,
    form.value.play.play,
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugProxyFn = async () => {
  await handleDataDebugProxy(
    form.value.proxy.url,
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

const handleDataDebugProxyUploadFn = async () => {
  await handleDataDebugProxyUpload(form.value.proxy.upload, form.value.proxy.url);
};

const handleDataDebugFn = async (type: string, data: { [key: string]: any } = {}) => {
  await handleDataDebug(
    type,
    data,
    debugId.value,
    form.value.init.mode,
    form.value.content.js,
    form.value.lastEditTime.edit,
    form.value.lastEditTime.init,
    form.value.init.auto,
    (js) => {
      form.value.content.js = js;
    },
  );
};

// console functions
const handleConsoleClearFn = () => {
  handleConsoleClear(logRef);
};

// webview functions
const validateAndRecoverWebviewFn2 = async () => {
  await validateAndRecoverWebview(
    webviewRef,
    controlText.value,
    isWebviewVisible.value,
    (visible) => {
      isWebviewVisible.value = visible;
    },
    async () => {
      await resetWebview(isWebviewVisible.value, (visible) => {
        isWebviewVisible.value = visible;
      });
    },
    () => {
      bindDomReady(webviewRef, controlText.value, (url) => {
        handleWebviewLoad(
          url,
          (text) => {
            controlText.value = text;
          },
          webviewRef,
        );
      });
    },
    (url) => {
      handleWebviewLoad(
        url,
        (text) => {
          controlText.value = text;
        },
        webviewRef,
      );
    },
  );
};

const bindDomReadyFn = () => {
  bindDomReady(webviewRef, controlText.value, (url) => {
    handleWebviewLoad(
      url,
      (text) => {
        controlText.value = text;
      },
      webviewRef,
    );
  });
};

const resetWebviewFn = async () => {
  await resetWebview(isWebviewVisible.value, (visible) => {
    isWebviewVisible.value = visible;
  });
};

const handleWebviewLoadFn = (url: string) => {
  handleWebviewLoad(
    url,
    (text) => {
      controlText.value = text;
    },
    webviewRef,
  );
};

const handleWebviewControlFn = async (action: 'back' | 'forward' | 'devtools' | 'refresh' | 'clearHistory') => {
  await handleWebviewControl(action, webviewRef);
};
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
      display: flex;
      align-items: center;
      gap: var(--td-size-4);

      .mode-toogle {
        height: 36px;
        min-width: 80px;
        font: var(--td-font-body-medium);
        color: var(--td-text-color-secondary);
        --ripple-color: transparent;
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;

        &:hover {
          color: var(--td-text-color-primary);
        }

        .status {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          line-height: 16px;
          justify-content: center;

          .title {
            font-weight: 500;
            text-align: left;
          }

          .desc {
            font-size: 10px;
            text-align: left;
          }
        }
      }

      :deep(.t-radio-group.t-size-m) {
        background-color: var(--td-bg-content-input-2);
        border-color: transparent;

        .t-radio-button {
          padding: var(--td-comp-paddingTB-xs) var(--td-comp-paddingLR-s);
          background-color: var(--td-bg-content-input-2);
          border-color: transparent;
        }
        .t-select__wrap {
          width: fit-content;
          position: relative;
          height: calc(var(--td-comp-size-m) -(var(--td-comp-paddingTB-xxs) * 2));

          .t-input--auto-width {
            min-width: 44px;
          }
          &:hover {
            .t-input__inner {
              color: var(--td-text-color-primary);
            }
          }
          .t-input__inner {
            color: var(--td-text-color-secondary);
            font: var(--td-font-body-medium);
          }
          .t-input {
            .t-input__suffix:not(:empty) {
              display: none;
            }
          }
        }
        .t-select__wrap::before {
          content: '';
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: calc(100% - 24px);
          background-color: var(--td-component-border);
          transition: opacity 0.2s cubic-bezier(0, 0, 0.15, 1);
          z-index: 2;
        }
      }

      .component-op {
        display: flex;
        height: var(--td-comp-size-m);
        padding: 0 var(--td-comp-paddingLR-xs);
        background-color: var(--td-bg-content-input-2);
        border-radius: var(--td-radius-default);
        align-items: center;

        .item-pad-select {
          padding: 0 4px !important;
        }

        .item {
          color: var(--td-text-color-placeholder);
          border-radius: var(--td-radius-default);
          display: flex;
          align-items: center;
          padding: 2px 4px;
          height: 22px;
          cursor: pointer;
          text-decoration: none;

          :deep(.t-input) {
            padding: 0;
            border: none;
            width: 46px;
            height: var(--td-comp-size-s);
            font: var(--td-font-body-medium);
            background-color: transparent !important;

            .t-input__suffix:not(:empty) {
              margin-left: var(--td-comp-margin-xxs);
            }

            &:hover:not(.t-input--focused) {
              border-color: transparent;
              height: 24px;
            }
          }

          :deep(.t-input__inner) {
            color: var(--td-text-color-placeholder);
          }

          &:hover {
            transition: all 0.2s ease 0s;
            color: var(--td-text-color-primary);
            background-color: var(--td-bg-color-container-hover);
          }
        }
      }
    }
  }

  .content {
    flex: 1;
    width: 100%;
    height: calc(100% - 36px - var(--td-size-4));
    border-radius: var(--td-radius-default);
    overflow: hidden;

    :deep(.splitpanes) {
      &.default-theme {
        .splitpanes__splitter {
          background-color: var(--td-border-level-1-color);

          &::before {
            background-color: var(--td-border-level-2-color);
          }

          &::after {
            background-color: var(--td-border-level-2-color);
          }
        }

        &.splitpanes--horizontal > .splitpanes__splitter,
        .splitpanes--horizontal > .splitpanes__splitter {
          border-color: var(--td-border-level-1-color);
        }

        &.splitpanes--vertical > .splitpanes__splitter,
        .splitpanes--vertical > .splitpanes__splitter {
          border-color: var(--td-border-level-1-color);
        }
      }
    }

    .editor-pane {
      height: 100%;
    }

    .console-pane {
      height: 100%;
      background-color: var(--td-bg-content-input-1);
      // padding: var(--td-comp-paddingLR-s) var(--td-comp-paddingLR-s);

      .console-root {
        display: flex;
        justify-content: space-between;
        padding: var(--td-comp-paddingLR-xxs) var(--td-comp-paddingLR-s);

        .header-clear {
          cursor: pointer;
        }
      }

      .log-pane-content {
        height: calc(100% - 26px);
        border-radius: var(--td-radius-default);
        overflow: hidden;

        .log-box {
          height: 100%;

          :deep(.xterm) {
            height: 100%;

            .xterm-viewport {
              background-color: var(--td-bg-content-input-1) !important;
            }

            .xterm-screen {
              padding: 0 var(--td-comp-paddingLR-s);
            }
          }
        }
      }
    }
  }
}

:deep(.t-input),
:deep(.t-input-number__increase),
:deep(.t-input-number__decrease),
:deep(.t-input-adornment__text),
:deep(.t-textarea__inner) {
  background-color: var(--td-bg-content-input-2) !important;
  border-color: transparent;
  box-shadow: none;
}

:deep(.monaco-editor) {
  --vscode-editorGutter-background: var(--td-bg-content-input-2);
  --vscode-editor-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-background: var(--td-bg-content-input-2);
  --vscode-editorStickyScroll-shadow: var(--td-bg-content-input-1);
  --vscode-scrollbar-shadow: var(--td-bg-content-input-1);
}

:deep(.t-tabs) {
  height: 100%;

  .t-tabs__header {
    .t-tabs__nav-container.t-is-top {
      background-color: var(--td-bg-content-input-1);
    }
  }

  .t-tabs__nav--card.t-tabs__nav-item.t-is-active {
    background-color: var(--td-bg-content-input-2);
    border-bottom-color: transparent;
  }

  .t-tabs__content {
    padding: var(--td-pop-padding-s);
    background-color: var(--td-bg-content-input-2);
    height: calc(100% - var(--td-comp-size-l));
    width: 100%;
    overflow: auto;

    .t-tab-panel {
      height: 100%;
      width: 100%;
    }
  }

  .t-tabs__nav-item.t-size-m {
    height: var(--td-comp-size-l);
    line-height: var(--td-comp-size-l);
    background-color: var(--td-bg-content-input-1);
    border-color: transparent;
  }

  .t-tabs__nav-item-text-wrapper {
    color: var(--td-text-color-secondary);
    font-size: var(--td-font-size-link-small);
    font-weight: normal;
  }
}

.data_debug,
.dom_debug {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  grid-gap: var(--td-comp-margin-s);
  overflow-y: auto;

  .item {
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    overflow: hidden;
    position: relative;

    .init {
      width: auto !important;

      :deep(.t-button__text) {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .click {
        margin-left: var(--td-comp-margin-s);
        border: 2px solid rgba(132, 133, 141, 0.7);
        border-radius: var(--td-radius-circle);
        width: 24px;
        height: 24px;
      }

      .status {
        display: flex;
        flex-direction: column;
        font-size: 12px;
        line-height: 14px;
        align-content: flex-start;

        .title {
          font-weight: 500;
          text-align: left;
        }

        .desc {
          font-size: 10px;
          text-align: left;
        }
      }
    }

    .source {
      :deep(.input-group) {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
        overflow: hidden;
        gap: 0;

        .input {
          flex: 1;
          width: 100%;
          margin-right: var(--td-comp-margin-s);

          .t-input {
            background-color: var(--td-bg-content-input-1) !important;
          }
        }

        .w-btn {
          width: 50px !important;
          background-color: var(--td-bg-content-input-1);
        }
      }
    }

    .input {
      width: 100%;
      margin-right: var(--td-comp-margin-s);

      :deep(.t-input),
      :deep(.t-textarea__inner) {
        background-color: var(--td-bg-content-input-1) !important;
      }
    }

    .proxy-upload-textarea {
      margin-right: 0;

      :deep(.t-textarea__inner) {
        padding-bottom: calc(var(--td-size-3) + var(--td-comp-size-m));
      }
    }

    .proxy-upload-btn {
      position: absolute;
      right: var(--td-size-4);
      bottom: var(--td-size-3);
    }

    .w-btn {
      width: 50px;
      background-color: var(--td-bg-content-input-1);
    }

    .w-100\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s))));
    }

    .w-50\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 2);
    }

    .w-50-30\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 3);
    }

    .w-50-70\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 7);
    }

    .w-33-30\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 3);
    }

    .w-33-40\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s) * 2)) / 10 * 4);
    }

    .w-33\% {
      width: calc((100% - 50px - (var(--td-comp-margin-s) * 3)) / 3);
    }
  }
}

.html_preview {
  display: flex;
  flex-direction: column;
  gap: var(--td-comp-margin-s);
  height: 100%;

  .urlbar-root {
    display: flex;
    gap: var(--td-comp-margin-s);

    .urlbar-control {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background-color: var(--td-bg-content-input-1);
      border-radius: var(--td-radius-default);
      height: 100%;
      width: 100px;

      :deep(.t-button) {
        &:not(.t-is-disabled):not(.t-button--ghost) {
          --ripple-color: transparent;
        }
      }

      :deep(.t-button__text) {
        svg {
          color: var(--td-text-color-placeholder);
        }
      }

      :deep(.t-button--variant-text) {
        &:hover {
          border-color: transparent;
          background-color: transparent;

          .t-button__text {
            svg {
              color: var(--td-primary-color);
            }
          }
        }
      }
    }

    .urlbar-url {
      :deep(.t-input) {
        background-color: var(--td-bg-content-input-1) !important;
      }
    }

    .urlbar-devtool {
      background-color: var(--td-bg-content-input-1);
      --ripple-color: transparent;
      color: var(--td-text-color-placeholder);

      &:hover {
        color: var(--td-primary-color);
      }
    }
  }

  .webview-box {
    flex: 1;
    height: 100%;
    width: 100%;
    background-color: var(--td-bg-content-input-1);
    border-radius: var(--td-radius-default);
    overflow: hidden;
  }
}
</style>
