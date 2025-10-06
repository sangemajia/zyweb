<template>
  <t-button class="mode-toggle" theme="default" @click="handleClick">
    <div class="status">
      <span class="title">{{ $t('pages.lab.jsEdit.action.mode') }}</span>
      <span class="desc">
        {{ $t('pages.lab.jsEdit.action.status') }}:
        {{ mode }}
      </span>
    </div>
  </t-button>
</template>

<script setup lang="ts">
const props = defineProps({
  mode: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style lang="less" scoped>
.mode-toggle {
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
</style>
