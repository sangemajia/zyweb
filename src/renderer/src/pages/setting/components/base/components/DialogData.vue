<template>
  <t-dialog
    v-model:visible="formVisible"
    :header="$t('pages.setting.data.title')"
    attach="#main-component"
    placement="center"
    width="50%"
    destroy-on-close
    :footer="false"
  >
    <template #body>
      <div class="data-dialog-container dialog-container-padding">
        <div class="data-item top">
          <p class="title-label mg-b-s">{{ $t('pages.setting.data.config') }}</p>
          <p class="content">{{ $t('pages.setting.data.configTip') }}</p>
          <div class="config mg-t">
            <t-collapse expand-mutex>
              <t-collapse-panel value="easyConfig" :header="$t('pages.setting.data.easyConfig.title')">
                <t-radio-group v-model="formData.easyConfig.type" class="input-item">
                  <t-radio value="drpy">{{ $t('pages.setting.data.easyConfig.drpy') }}</t-radio>
                  <t-radio value="tvbox">{{ $t('pages.setting.data.easyConfig.tvbox') }}</t-radio>
                  <t-radio value="catvod">{{ $t('pages.setting.data.easyConfig.catvod') }}</t-radio>
                </t-radio-group>
                <p v-if="formData.easyConfig.type === 'drpy'" class="tip">
                  {{ $t('pages.setting.data.easyConfig.drpyTip') }}
                </p>
                <p v-else-if="formData.easyConfig.type === 'tvbox'" class="tip">
                  {{ $t('pages.setting.data.easyConfig.tvboxTip') }}
                </p>
                <p v-else-if="formData.easyConfig.type === 'catvod'" class="tip">
                  {{ $t('pages.setting.data.easyConfig.catvodTip') }}
                </p>
                <t-input
                  :label="$t('pages.setting.data.easyConfig.address')"
                  v-model="formData.easyConfig.url"
                  class="input-item"
                  :placeholder="$t('pages.setting.placeholder.general')"
                ></t-input>
                <div class="button-group-item">
                  <t-popconfirm
                    :content="$t('pages.setting.data.additionalTip')"
                    placement="bottom"
                    @confirm="handleImportData('easyConfig', 'additional')"
                  >
                    <t-button block variant="outline">{{ $t('pages.setting.data.additional') }}</t-button>
                  </t-popconfirm>
                  <t-popconfirm
                    :content="$t('pages.setting.data.overrideTip')"
                    placement="bottom"
                    @confirm="handleImportData('easyConfig', 'override')"
                  >
                    <t-button block>{{ $t('pages.setting.data.override') }}</t-button>
                  </t-popconfirm>
                  <t-dropdown>
                    <t-button block variant="text">{{ $t('pages.setting.data.history') }}</t-button>
                    <t-dropdown-menu>
                      <t-dropdown-item
                        v-for="item in historyList.easyConfig"
                        :key="item.id"
                        :value="item.id"
                        @click="handleHistoryFill('easyConfig', item.id)"
                      >
                        <t-popup :content="item.videoId">{{ item.videoName }}</t-popup>
                      </t-dropdown-item>
                    </t-dropdown-menu>
                  </t-dropdown>
                </div>
              </t-collapse-panel>
              <t-collapse-panel value="remoteImport" :header="$t('pages.setting.data.configImport.title')">
                <t-radio-group v-model="formData.completeConfig.type" class="input-item">
                  <t-radio value="remote">{{ $t('pages.setting.data.configImport.remote') }}</t-radio>
                  <t-radio value="local">{{ $t('pages.setting.data.configImport.local') }}</t-radio>
                </t-radio-group>
                <p class="tip">{{ $t('pages.setting.data.configImport.tip') }}</p>
                <div class="input-group-item">
                  <t-input
                    :label="$t('pages.setting.data.configImport.address')"
                    v-model="formData.completeConfig.url"
                    :placeholder="$t('pages.setting.placeholder.general')"
                  />
                  <t-button
                    v-if="formData.completeConfig.type === 'local'"
                    class="upload-item"
                    theme="default"
                    @click="handleUploadFileEvent"
                  >
                    {{ $t('pages.setting.upload') }}
                  </t-button>
                </div>
                <div class="button-group-item">
                  <t-popconfirm
                    :content="$t('pages.setting.data.additionalTip')"
                    placement="bottom"
                    @confirm="handleImportData('completeConfig', 'additional')"
                  >
                    <t-button block variant="outline">{{ $t('pages.setting.data.additional') }}</t-button>
                  </t-popconfirm>
                  <t-popconfirm
                    :content="$t('pages.setting.data.overrideTip')"
                    placement="bottom"
                    @confirm="handleImportData('completeConfig', 'override')"
                  >
                    <t-button block>{{ $t('pages.setting.data.override') }}</t-button>
                  </t-popconfirm>
                  <t-dropdown>
                    <t-button block variant="text">{{ $t('pages.setting.data.history') }}</t-button>
                    <t-dropdown-menu>
                      <t-dropdown-item
                        v-for="item in historyList.completeConfig"
                        :key="item.id"
                        :value="item.id"
                        @click="handleHistoryFill('completeConfig', item.id)"
                      >
                        <t-popup :content="item.videoId">{{ item.videoName }}</t-popup>
                      </t-dropdown-item>
                    </t-dropdown-menu>
                  </t-dropdown>
                </div>
              </t-collapse-panel>
              <t-collapse-panel value="exportData" :header="$t('pages.setting.data.configExport.title')">
                <div class="t-radio-group">
                  <t-radio v-model="active.export.site" allow-uncheck>{{
                    $t('pages.setting.data.table.site')
                  }}</t-radio>
                  <t-radio v-model="active.export.iptv" allow-uncheck>{{
                    $t('pages.setting.data.table.iptv')
                  }}</t-radio>
                  <t-radio v-model="active.export.channel" allow-uncheck>{{
                    $t('pages.setting.data.table.channel')
                  }}</t-radio>
                  <t-radio v-model="active.export.analyze" allow-uncheck>{{
                    $t('pages.setting.data.table.analyze')
                  }}</t-radio>
                  <t-radio v-model="active.export.drive" allow-uncheck>{{
                    $t('pages.setting.data.table.drive')
                  }}</t-radio>
                  <t-radio v-model="active.export.history" allow-uncheck>{{
                    $t('pages.setting.data.table.history')
                  }}</t-radio>
                  <t-radio v-model="active.export.star" allow-uncheck>{{
                    $t('pages.setting.data.table.star')
                  }}</t-radio>
                  <t-radio v-model="active.export.setting" allow-uncheck>{{
                    $t('pages.setting.data.table.setting')
                  }}</t-radio>
                </div>
                <t-popconfirm
                  :content="$t('pages.setting.data.configExport.exportTip')"
                  placement="bottom"
                  @confirm="handleExportData"
                >
                  <t-button block style="margin-top: var(--td-comp-margin-s)">{{
                    $t('pages.setting.data.configExport.export')
                  }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
              <t-collapse-panel value="clearData" :header="$t('pages.setting.data.clearData.title')">
                <div class="t-radio-group">
                  <t-radio v-model="active.clear.site" allow-uncheck>{{ $t('pages.setting.data.table.site') }}</t-radio>
                  <t-radio v-model="active.clear.iptv" allow-uncheck>{{ $t('pages.setting.data.table.iptv') }}</t-radio>
                  <t-radio v-model="active.clear.channel" allow-uncheck>{{
                    $t('pages.setting.data.table.channel')
                  }}</t-radio>
                  <t-radio v-model="active.clear.analyze" allow-uncheck>{{
                    $t('pages.setting.data.table.analyze')
                  }}</t-radio>
                  <t-radio v-model="active.clear.drive" allow-uncheck>{{
                    $t('pages.setting.data.table.drive')
                  }}</t-radio>
                  <t-radio v-model="active.clear.history" allow-uncheck>{{
                    $t('pages.setting.data.table.history')
                  }}</t-radio>
                  <t-radio v-model="active.clear.star" allow-uncheck>{{ $t('pages.setting.data.table.star') }}</t-radio>
                  <t-radio v-model="active.clear.thumbnail" allow-uncheck>
                    {{ $t('pages.setting.data.clearData.thumbnail') }}
                    <span class="">[{{ formData.size.thumbnail }}MB]</span>
                  </t-radio>
                  <t-radio v-model="active.clear.cache" allow-uncheck>
                    {{ $t('pages.setting.data.clearData.cache') }}
                    <span class="">[{{ formData.size.cache }}MB]</span>
                  </t-radio>
                </div>
                <t-popconfirm
                  :content="$t('pages.setting.data.clearData.clearTip')"
                  placement="bottom"
                  @confirm="handleClearData"
                >
                  <t-button block style="margin-top: var(--td-comp-margin-s)">{{
                    $t('pages.setting.data.clearData.clear')
                  }}</t-button>
                </t-popconfirm>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item"></div>
          </div>
        </div>
        <div class="data-item">
          <p class="title-label mg-b-s">{{ $t('pages.setting.data.syncDisk') }}</p>
          <p class="content">1.{{ $t('pages.setting.data.content1') }}</p>
          <p class="content">2.{{ $t('pages.setting.data.content2') }}</p>
          <p class="content">3.{{ $t('pages.setting.data.content3') }}</p>
          <div class="config mg-t">
            <t-collapse>
              <t-collapse-panel value="0" :header="$t('pages.setting.data.webdev.title')">
                <t-input
                  :label="$t('pages.setting.data.webdev.url')"
                  v-model="formData.webdev.data.url"
                  class="input-item"
                ></t-input>
                <t-input
                  :label="$t('pages.setting.data.webdev.username')"
                  v-model="formData.webdev.data.username"
                  class="input-item"
                ></t-input>
                <t-input
                  :label="$t('pages.setting.data.webdev.password')"
                  v-model="formData.webdev.data.password"
                  type="password"
                  class="input-item"
                ></t-input>
                <div class="sync-switch">
                  <span class="sync-switch-text">{{ $t('pages.setting.data.webdev.sync') }}</span>
                  <t-switch v-model="formData.webdev.sync" />
                </div>
                <t-button block @click="saveWebdev" style="margin-top: var(--td-comp-margin-s)">
                  {{ $t('pages.setting.data.webdev.save') }}
                </t-button>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <div class="action">
            <div class="action-item">
              <t-popconfirm
                :content="$t('pages.setting.data.syncToCloudTip')"
                placement="bottom"
                @confirm="handleRsyncRemoteEvent"
              >
                <t-button theme="default" class="btn-2">{{ $t('pages.setting.data.syncToCloud') }}</t-button>
              </t-popconfirm>
              <t-popconfirm
                :content="$t('pages.setting.data.syncToLocalTip')"
                placement="bottom"
                @confirm="handleRsyncLocalEvent"
              >
                <t-button theme="default" class="btn-2">{{ $t('pages.setting.data.syncToLocal') }}</t-button>
              </t-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useDialogDataSetup } from './dialogDataSetup';

defineOptions({
  name: 'SettingBaseDialogData',
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: {
      data: {
        sync: false,
        data: { url: '', username: '', password: '' },
      },
      type: 'data',
    },
  },
});

const emits = defineEmits(['update:visible', 'submit']);

const {
  formVisible,
  formData,
  active,
  historyList,
  handleHistoryFill,
  handleImportData,
  handleUploadFileEvent,
  handleExportData,
  handleClearData,
  saveWebdev,
  handleRsyncRemoteEvent,
  handleRsyncLocalEvent,
} = useDialogDataSetup(props, emits);
</script>

<style lang="less" scoped>
.data-dialog-container {
  max-height: 430px;

  .data-item {
    .content {
      font: var(--td-font-link-small);
    }

    .config {
      .input-item {
        margin-bottom: var(--td-comp-margin-s);
      }
      .input-group-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--td-comp-margin-m);
        gap: 10px;
        align-items: center;

        :deep(.t-button) {
          background-color: var(--td-bg-content-input-1);
          border-color: transparent;
          &:hover {
            background-color: var(--td-bg-color-component-hover);
          }
        }
      }
      .button-group-item {
        display: flex;
        gap: 6px;
      }
    }

    .action {
      .action-item {
        margin-top: var(--td-comp-margin-s);
        display: flex;
        justify-content: space-between;

        .btn-2 {
          width: 49%;
        }

        .btn-3 {
          width: 33%;
        }
      }
    }

    .sync-switch {
      background-color: var(--td-bg-content-input-1);
      border-color: transparent;
      margin: 0;
      padding: 0;
      list-style: none;
      position: relative;
      height: var(--td-comp-size-m);
      border-width: 1px;
      border-style: solid;
      border-radius: var(--td-radius-default);
      padding: 0 var(--td-comp-paddingLR-s);
      outline: none;
      color: var(--td-text-color-primary);
      font: var(--td-font-body-medium);
      width: 100%;
      box-sizing: border-box;
      transition:
        border cubic-bezier(0.38, 0, 0.24, 1) 0.2s,
        box-shadow cubic-bezier(0.38, 0, 0.24, 1) 0.2s,
        background-color cubic-bezier(0.38, 0, 0.24, 1) 0.2s;
      display: flex;
      align-items: center;
      overflow: hidden;
      .sync-switch-text {
        margin-right: var(--td-comp-margin-s);
        z-index: 2;
        height: 100%;
        text-align: center;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
