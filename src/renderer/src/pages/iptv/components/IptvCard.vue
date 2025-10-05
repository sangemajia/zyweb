<template>
  <t-col :md="3" :lg="3" :xl="2" :xxl="1" class="card"
    @click="playEvent(item)" @contextmenu="conButtonClick(item, $event)" @contextmenu.prevent>
    <div class="card-main">
      <div v-show="iptvConfig.ext.delay && item.delay" class="card-delay-tag">
        <span v-if="item.delay < 500" class="status-item success">{{ item.delay }}ms</span>
        <span v-else class="status-item error">
          {{ item.delay ? `${item.delay}ms` : $t('pages.iptv.delay') }}
        </span>
      </div>
      <div v-show="iptvConfig.ext.markIp && item.ipVersion" class="card-ip-tag">
        <span v-if="item.ipVersion === -1" class="status-item error">{{ $t('pages.iptv.unknown') }}</span>
        <span v-else class="status-item success">IPV{{ item.ipVersion }}</span>
      </div>
      <t-image class="card-main-item"
        :src="iptvConfig.ext.thumbnail ? item.thumbnail : item.logo"
        :style="{
          width: '100%',
          background: 'none',
          overflow: 'hidden',
          padding: iptvConfig.ext.thumbnail
            ? 'none'
            : '35px 30px'
        }"
        :lazy="true"
        :loading="renderLoading"
        :error="renderError"
      />
    </div>
    <div class="card-footer">
      <span class="card-footer-title text-hide">{{ item.name }}</span>
    </div>
  </t-col>
</template>

<script setup lang="tsx">
import lazyImg from '@/assets/lazy.png';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  iptvConfig: {
    type: Object,
    required: true
  },
  renderLoading: {
    type: Function,
    required: true
  },
  renderError: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['playEvent', 'conButtonClick']);

const playEvent = (item: any) => {
  emit('playEvent', item);
};

const conButtonClick = (item: any, event: any) => {
  emit('conButtonClick', item, event);
};

const renderError = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};
const renderLoading = () => {
  return (
    <div class="renderIcon" style="width: 100%;">
      <img src={lazyImg} style="width: 100%; object-fit: cover;" />
    </div>
  );
};
</script>

<style lang="less" scoped>
.card {
  box-sizing: border-box;
  width: inherit;
  position: relative;
  cursor: pointer;
  border-radius: var(--td-radius-default);


  &:hover {
    .card-main {
      border-color: var(--td-brand-color);
    }

    .card-footer {
      .card-footer-title {
        color: var(--td-brand-color);
      }
    }
  }

  .text-hide {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }

  .card-main {
    position: relative;
    width: 100%;
    height: 0;
    overflow: hidden;
    border-radius: var(--td-radius-default);
    padding-top: 62%;
    box-shadow: var(--td-shadow-1);
    border: var(--td-size-1) solid #211f20;
    background-color: #373536;
    transition: all 0.2s linear;

    .card-delay-tag {
      z-index: 15;
      display: flex;
      align-content: center;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 15px;
      background-color: rgb(0 0 0 / 60%);
      border-radius: var(--td-radius-default);
      box-shadow: var(--td-shadow-1);
      position: absolute;
      top: 5px;
      right: 5px;

      .status-item {
        font-size: 10px;
      }

      .error {
        color: var(--td-error-color);
      }

      .success {
        color: var(--td-success-color);
      }
    }

    .card-ip-tag {
      z-index: 15;
      display: flex;
      align-content: center;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 15px;
      background-color: rgb(0 0 0 / 60%);
      border-radius: var(--td-radius-default);
      box-shadow: var(--td-shadow-1);
      position: absolute;
      bottom: 5px;
      left: 5px;

      .status-item {
        font-size: 10px;
      }

      .error {
        color: var(--td-error-color);
      }

      .success {
        color: var(--td-success-color);
      }
    }

    .card-main-item {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      height: 100%;
      border-radius: var(--td-radius-default);
    }
  }

  .card-footer {
    position: relative;
    padding: 0 var(--td-comp-paddingLR-xs);

    .card-footer-title {
      font-weight: 700;
      line-height: var(--td-line-height-title-medium);
      height: 22px;
      transition: all 0.2s linear;
    }
  }
}
</style>