<template>
  <div class="static-filter view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.staticFilter') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="demo">{{ $t('pages.lab.staticFilter.demo') }}</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <div class="edit">
          <div class="code-op">
            <div class="code-op-item card">
              <reqHtml class="item source" v-model:data="reqFormData" @source="htmlSourceEvent" />
            </div>
            <div class="code-op-item card">
              <t-input
                v-model="form.class_name"
                :label="$t('pages.lab.staticFilter.rule.className')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.classNameTip')"
                class="input w-100%"
              />
              <t-input
                v-model="form.class_url"
                :label="$t('pages.lab.staticFilter.rule.classUrl')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.classUrlTip')"
                class="input w-100%"
              />
              <t-input
                v-model="form.class_parse"
                :label="$t('pages.lab.staticFilter.rule.class')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.classParseTip')"
                class="input w-100%"
              />
              <t-input
                v-model="form.cate_exclude"
                :label="$t('pages.lab.staticFilter.rule.cateExclude')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.cateExcludeTip')"
                class="input w-100%"
              />
              <t-input
                v-model="form.reurl"
                :label="$t('pages.lab.staticFilter.rule.link')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.linkTip')"
                class="input w-100%"
              />
              <t-button block @click="actionClass">{{ $t('pages.lab.staticFilter.rule.ctry') }}</t-button>
            </div>
            <div class="code-op-item card">
              <t-textarea
                v-model="form.filter"
                :label="$t('pages.lab.staticFilter.rule.filter')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.filterTip')"
                class="input w-100%"
                :autosize="{ minRows: 1 }"
              />
              <t-textarea
                t
                v-model="form.filterInfo"
                :label="$t('pages.lab.staticFilter.rule.filterInfo')"
                :placeholder="$t('pages.lab.staticFilter.placeholder.filterInfoTip')"
                class="input w-100%"
                :autosize="{ minRows: 1 }"
              />
              <t-button block @click="getMatchs">{{ $t('pages.lab.staticFilter.rule.ms') }}</t-button>

              <t-input
                v-model="form.exclude_keys"
                :label="$t('pages.lab.staticFilter.rule.excludeKeys')"
                :placeholder="$t('pages.setting.placeholder.splitForVerticalLine')"
                class="input w-100%"
              />

              <!-- 动态创建的输入框列表 -->
              <t-input
                v-for="(_, key, index) in form.matchs"
                v-model="form.matchs[key]"
                :label="key"
                :key="index"
                :placeholder="$t('pages.lab.staticFilter.rule.reg')"
                class="input w-100%"
              />
              <t-button block @click="actionFilter">{{ $t('pages.lab.staticFilter.rule.tf') }}</t-button>
            </div>
            <div class="code-op-item card">
              <t-button block :loading="active.batchFetchLoading" @click="batchResults">{{
                $t('pages.lab.staticFilter.rule.br')
              }}</t-button>
            </div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="log-container">
          <div class="log-nav">
            <div class="nav-left">
              <t-radio-group variant="default-filled" size="small" v-model="form.nav" @change="changeNav()">
                <t-radio-button value="debug">{{ $t('pages.lab.staticFilter.select.debug') }}</t-radio-button>
                <t-radio-button value="source">{{ $t('pages.lab.staticFilter.select.source') }}</t-radio-button>
              </t-radio-group>
            </div>
            <div class="nav-right">
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.debug"
                @change="debugEvent()"
                v-if="form.nav === 'debug'"
              >
                <t-radio-button value="copy">{{ $t('pages.lab.staticFilter.select.copy') }}</t-radio-button>
                <t-radio-button value="encode">{{ $t('pages.lab.staticFilter.select.encode') }}</t-radio-button>
              </t-radio-group>
              <t-radio-group
                variant="default-filled"
                size="small"
                v-model="form.clickType.source"
                @change="sourceEvent()"
                v-if="form.nav === 'source'"
              >
                <t-radio-button value="format">{{ $t('pages.lab.staticFilter.select.format') }}</t-radio-button>
                <t-radio-button value="reset">{{ $t('pages.lab.staticFilter.select.reset') }}</t-radio-button>
              </t-radio-group>
            </div>
          </div>
          <div class="log-text">
            <code-editor v-model="form.content.text" :options="codeEditConf" class="log-box" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CodeEditor } from '@/components/code-editor';
import reqHtml from '../reqHtml/index.vue';

// Import setup module
import { useStaticFilterSetup } from './staticFilterSetup';

// Import utility modules
import {
  demoConfEvent,
  changeNav,
  getMatchs,
  uniqueObjectsByProperty,
  concatenateObjects,
  actionClass,
  batchResults,
  prepareRequestOptions,
  batchFetch,
  actionFilter,
  debugEvent,
  sourceEvent,
  handleOpChange,
  htmlSourceEvent,
} from './utils/filterUtils';

const { form, reqFormData, active, codeEditConf, setupWatchers } = useStaticFilterSetup();

// Setup watchers
setupWatchers((conf) => {
  codeEditConf.value = conf;
});
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    grid-gap: var(--td-comp-margin-s);
    width: 100%;
    height: 100%;
    overflow: hidden;

    .left {
      height: 100%;
      width: calc((100% - var(--td-comp-margin-s)) / 2);
      overflow-y: auto;

      .edit {
        display: flex;
        flex-direction: column;
        grid-gap: var(--td-comp-margin-s);
        height: 100%;

        .code-op {
          display: flex;
          flex-direction: column;
          grid-gap: var(--td-comp-margin-s);

          .code-op-item {
            display: flex;
            grid-gap: var(--td-comp-margin-xs);
          }

          .card {
            padding: 6px 4px;
            border-radius: var(--td-radius-medium);
            border: 1px solid rgba(132, 133, 141, 0.2);
            display: flex;
            flex-direction: column;
          }

          .item {
            display: flex;
            grid-gap: var(--td-comp-margin-s);
          }

          .source,
          .sniffer {
            display: flex;
            grid-gap: var(--td-comp-margin-s);
            flex: 1;
          }
        }
      }
    }

    .right {
      height: 100%;
      width: calc((100% - var(--td-comp-margin-s)) / 2);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      grid-gap: var(--td-comp-margin-s);

      .action {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        grid-gap: var(--td-comp-margin-s);

        .item {
          display: flex;
          flex-wrap: nowrap;
          width: 100%;
          overflow: hidden;

          .init {
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

          .input {
            width: 100%;
            margin-right: var(--td-comp-margin-s);
          }

          .button {
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

      .log-container {
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        margin-top: var(--td-comp-paddingTB-m);
        border-radius: var(--td-radius-default);
        background-color: var(--td-bg-content-input-2);

        .log-nav {
          position: absolute;
          width: calc(100% - 30px);
          z-index: 100;
          top: -15px;
          left: 15px;
          display: flex;
          justify-content: space-between;

          :deep(.t-radio-group) {
            box-shadow: var(--td-shadow-3);
          }
        }

        .log-text {
          height: 100%;
          width: 100%;
          position: absolute;
          top: 0;
          bottom: 0;
          border-radius: var(--td-radius-default);
          padding: var(--td-comp-paddingTB-xs) 0 var(--td-comp-paddingTB-m);

          .log-box {
            position: relative;
            width: 100%;
            height: 100%;
            margin-top: var(--td-comp-paddingTB-m);
            border-radius: 0 0 var(--td-radius-default) var(--td-radius-default);
            overflow: hidden;
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
</style>
