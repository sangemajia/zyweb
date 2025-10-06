<template>
  <div class="file-diff view-container">
    <div class="header">
      <div class="left-operation-container">
        <h3 class="title">{{ $t('pages.lab.nav.fileDiff') }}</h3>
      </div>
      <div class="right-operation-container">
        <t-radio-group variant="default-filled" v-model="active.nav" @change="handleOpChange">
          <t-radio-button value="origin">{{ $t('pages.lab.fileDiff.origin') }}</t-radio-button>
          <t-radio-button value="target">{{ $t('pages.lab.fileDiff.target') }}</t-radio-button>
        </t-radio-group>
      </div>
    </div>
    <div class="content">
      <code-editor
        v-model="form.target"
        v-model:original-text="form.origin"
        mode="diff"
        :options="diffEditConf"
        class="diff-box"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CodeEditor } from '@/components/code-editor';
import { useFileDiffSetup } from './fileDiffSetup';

const { form, active, diffEditConf, handleOpChange } = useFileDiffSetup();
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
    height: 100%;

    .diff-box {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
