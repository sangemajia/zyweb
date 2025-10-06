<template>
  <t-col :md="3" :lg="3" :xl="2" :xxl="1" class="card" @click="playEvent(item)">
    <div class="card-main">
      <div v-if="item.vod_remarks || item.vod_remark" class="card-tag card-tag-orange">
        <span class="card-tag-text text-hide">{{ item.vod_remarks || item.vod_remark }}</span>
      </div>
      <t-image
        class="card-main-item"
        :src="item.vod_pic"
        :style="{ height: '100%', background: 'none', overflow: 'hidden' }"
        :lazy="true"
        fit="cover"
        :loading="renderLoading"
        :error="renderError"
      >
        <template #overlayContent>
          <div class="op" v-if="item.relateSite">
            <div class="op-box">
              <span>{{ item.relateSite.name }}</span>
            </div>
          </div>
        </template>
      </t-image>
    </div>
    <div class="card-footer">
      <p class="card-footer-title text-hide">{{ item.vod_name }}</p>
      <p class="card-footer-desc text-hide">
        <span v-if="item.vod_blurb">{{ item.vod_blurb }}</span>
        <span v-else-if="item.vod_content">{{ item.vod_content }}</span>
        <span v-else-if="item.vod_remarks">{{ item.vod_remarks }}</span>
        <span v-else>{{ $t('pages.film.noDesc') }}</span>
      </p>
    </div>
  </t-col>
</template>

<script setup lang="tsx">
// 定义组件属性
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  renderLoading: {
    type: Function,
    required: true,
  },
  renderError: {
    type: Function,
    required: true,
  },
});

// 定义事件发射器
const emit = defineEmits(['playEvent']);

// 播放事件处理函数
const playEvent = (item: any) => {
  emit('playEvent', item);
};
</script>

<style lang="less" scoped>
.card {
  box-sizing: border-box;
  width: inherit;
  position: relative;
  cursor: pointer;

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
    padding-top: 139.9%;

    .card-tag-orange {
      background: #ffdd9a;
      color: #4e2d03;
    }

    .card-tag {
      z-index: 15;
      position: absolute;
      left: 0;
      top: 0;
      border-radius: 6px 0 6px 0;
      padding: 1px 6px;
      max-width: 60%;

      .card-tag-text {
        font-size: 12px;
        height: 18px;
        line-height: 18px;
      }
    }

    .card-main-item {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      width: 100%;
      height: 100%;

      .op {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(to bottom, rgba(22, 24, 35, 0.4) 0%, rgba(22, 24, 35, 0.8) 100%);

        .op-box {
          padding: var(--td-comp-paddingTB-xs) 0;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.4) 30%,
            rgba(255, 255, 255, 0.4) 70%,
            rgba(255, 255, 255, 0)
          );
          span {
            text-align: center;
            display: inline-block;
            width: 100%;
            color: #fdfdfd;
            font-weight: 500;
          }
        }
      }
    }
  }

  .card-main:hover {
    .card-main-item {
      :deep(img) {
        transition: all 0.25s ease-in-out;
        transform: scale(1.05);
      }
    }
  }

  .card-footer {
    position: relative;
    padding-top: var(--td-comp-paddingTB-s);

    .card-footer-title {
      font-weight: 700;
      line-height: var(--td-line-height-title-medium);
      height: 22px;
    }

    .card-footer-desc {
      font-size: 13px;
      line-height: var(--td-line-height-body-large);
      color: var(--td-text-color-placeholder);
    }
  }

  &:hover {
    .card-footer-title {
      color: var(--td-brand-color);
    }
  }
}
</style>
