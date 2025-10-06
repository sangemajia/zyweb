<template>
  <t-dialog
    v-model:visible="formVisible"
    show-in-attached-element
    attach=".zy-component"
    width="70%"
    placement="center"
    :footer="false"
  >
    <template #body>
      <div class="detail view-container">
        <div class="plist-body">
          <div class="intro-wrap">
            <div class="left">
              <t-image
                class="card-main-item"
                :src="infoConf.vod_pic"
                fit="cover"
                shape="round"
                :style="{ width: '120px', height: '100%' }"
                :lazy="true"
                :loading="renderLoading"
                :error="renderError"
              />
            </div>
            <div class="right">
              <div class="info">
                <p class="title txthide">{{ infoConf.vod_name }}</p>
                <p class="info-item txthide">
                  <span class="name">{{ $t('pages.film.info.release') }}: </span>
                  <span class="role">{{ formatContent(infoConf?.vod_year) || $t('pages.film.info.unknown') }}</span>
                </p>
                <p class="info-item txthide">
                  <span class="name">{{ $t('pages.film.info.type') }}: </span>
                  <span class="role">{{ formatContent(infoConf?.type_name) || $t('pages.film.info.unknown') }}</span>
                </p>
                <p class="info-item txthide">
                  <span class="name">{{ $t('pages.film.info.area') }}: </span>
                  <span class="role">{{ formatContent(infoConf?.vod_area) || $t('pages.film.info.unknown') }}</span>
                </p>
              </div>
              <div class="add-box" @click="handlePutBinge">
                <div class="add">
                  <heart-filled-icon class="icon" v-if="active.binge" />
                  <heart-icon class="icon" v-else />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="plist-listbox">
          <div class="box-anthology-header">
            <div class="left">
              <h4 class="box-anthology-title">{{ $t('pages.player.film.anthology') }}</h4>
              <div class="box-anthology-analyze" v-show="active.official">
                <t-dropdown placement="bottom" :max-height="250">
                  <t-button size="small" theme="default" variant="text" auto-width>
                    <span>{{ $t('pages.player.film.analyze') }}</span>
                    <template #suffix>
                      <chevron-down-icon size="16" />
                    </template>
                  </t-button>
                  <t-dropdown-menu>
                    <t-dropdown-item
                      v-for="item in analyzeData.list"
                      :key="item.id"
                      :active="item.id === active.analyzeId"
                      @click="handleSwitchAnalyze(item.id)"
                    >
                      <span>{{ item.name }}</span>
                    </t-dropdown-item>
                    <t-dropdown-item v-if="analyzeData.list.length === 0">{{
                      $t('pages.player.noApi')
                    }}</t-dropdown-item>
                  </t-dropdown-menu>
                </t-dropdown>
              </div>
            </div>
            <div class="right">
              <div class="box-anthology-reverse-order" @click="handleReverseOrder">
                <order-descending-icon v-if="active.reverseOrder" size="1.2em" />
                <order-ascending-icon v-else size="1.2em" />
              </div>
            </div>
          </div>
          <div class="listbox">
            <title-menu
              v-if="lineList.length > 1"
              :list="lineList"
              :active="active.flimSource"
              class="nav"
              @change-key="handleSwitchLine"
            />
            <div class="tag-container">
              <div
                v-for="(item, index) in seasonData?.[active.flimSource]"
                :key="item"
                :class="['mainVideo-num', item === active.filmIndex ? 'mainVideo-selected' : '']"
                @click="handleSwitchSeason(item)"
              >
                <t-tooltip :content="formatName(item)">
                  <div class="mainVideo_inner">
                    {{
                      formatReverseOrder(
                        active.reverseOrder ? 'positive' : 'negative',
                        index,
                        seasonData?.[active.flimSource]?.length,
                      )
                    }}
                    <div class="playing"></div>
                  </div>
                </t-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </t-dialog>
</template>

<script setup lang="tsx">
import {
  ChevronDownIcon,
  HeartIcon,
  HeartFilledIcon,
  OrderAscendingIcon,
  OrderDescendingIcon,
} from 'tdesign-icons-vue-next';
import TitleMenu from '@/components/title-menu/index.vue';
import { useDetailSetup } from './detailSetup';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  info: {
    type: Object,
    default: {},
  },
  ext: {
    type: Object,
    default: { site: {}, setting: {} },
  },
});

const emit = defineEmits(['update:visible']);

const {
  formVisible,
  infoConf,
  bingeData,
  historyData,
  seasonData,
  lineList,
  analyzeData,
  active,
  renderError,
  renderLoading,
  formatName,
  formatReverseOrder,
  formatContent,
  handlePutBinge,
  handleReverseOrder,
  handleSwitchLine,
  handleSwitchAnalyze,
  handleSwitchSeason,
} = useDetailSetup(props, emit);
</script>

<style lang="less" scoped>
.view-container {
  height: calc(100% - 48px);

  .nowrap {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    height: auto;
    width: auto;
    font-weight: normal;
  }

  .plist-body {
    height: 165px;

    .detail-title {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .detail-info {
        max-width: 80%;

        .title {
          display: flex;
          align-items: baseline;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: flex-start;

          .name {
            position: relative;
            font-weight: 700;
            font-size: 28px;
            line-height: 28px;
            max-width: 200px;
            word-break: keep-all;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rate {
            color: var(--td-brand-color);
            font-weight: 700;
            font-size: 14px;
            margin-right: 12px;
          }
        }

        .desc {
          margin-top: 10px;

          .tag-items {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: inherit;
            overflow: visible;
            position: relative;

            .tag-item {
              margin-right: var(--td-comp-margin-xs);
              max-width: 30%;
            }
          }
        }
      }

      .binge {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--td-text-color-primary);
        background-color: var(--td-bg-color-component);
        border-radius: 36px;
        width: 84px;
        height: 42px;
        z-index: 14;

        .tip {
          vertical-align: top;
          line-height: 25px;
          text-align: center;
          margin-left: 4px;
        }
      }
    }

    .intro-wrap {
      // padding: 10px 0 5px 0;
      position: relative;
      width: 100%;
      height: 100%;
      font-size: 14px;
      line-height: 20px;
      display: flex;
      flex-direction: row;
      gap: 12px;

      .left {
        width: 120px;
        display: block;
        position: relative;
        height: 100%;
      }

      .right {
        width: calc(100% - 120px - 12px);
        flex: 1;
      }

      .info {
        .title {
          margin-bottom: var(--td-comp-margin-s);
          color: var(--td-text-color-primary);
          font-weight: 700;
          font-size: 26px;
          line-height: 36px;
        }
        .info-item {
          overflow: hidden;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          line-height: 24px;
          color: var(--td-text-color-secondary);
        }
      }
      .add-box {
        position: absolute;
        bottom: 0;
        .add {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--td-text-color-secondary);
          background-color: var(--td-bg-color-component);
          border-radius: 20px;
          width: 40px;
          height: 36px;
          text-align: center;
          &:hover {
            color: var(--td-text-color-primary);
          }
          .icon {
            width: 20px;
            height: 20px;
          }
        }
      }

      .content-wrap {
        width: 80%;
        height: 150px;
        overflow-x: hidden;
        overflow-y: scroll;

        .introduce-items {
          overflow: hidden;

          .introduce-item {
            margin-bottom: 12px;

            .title {
              display: block;
              float: left;
              line-height: 22px;
              height: 22px;
            }

            .info {
              line-height: 22px;
              margin-right: 12px;
              cursor: default;
            }
          }
        }
      }
    }
  }

  .plist-listbox {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: var(--td-comp-margin-s);

    .box-anthology-header {
      font-size: 16px;
      line-height: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--td-text-color-primary);

      .left {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: flex-end;

        .mg-left {
          margin-left: var(--td-comp-margin-xs);
        }

        .box-anthology-title {
          white-space: nowrap;
          position: relative;
          font-size: 18px;
          line-height: 25px;
          font-weight: 600;
        }

        .box-anthology-line,
        .box-anthology-analyze {
          :deep(.t-button) {
            padding: 0;
          }

          :deep(.t-button:not(.t-is-disabled):not(.t-button--ghost)) {
            --ripple-color: transparent;
          }

          :deep(.t-button--variant-text) {
            .t-button__suffix {
              margin-left: var(--td-comp-margin-xxs);
            }

            .t-button__text {
              &:before {
                content: '';
                width: 1px;
                margin: 0 var(--td-comp-margin-xs);
                background: linear-gradient(180deg, transparent, var(--td-border-level-1-color), transparent);
              }
            }

            &:hover,
            &:focus-visible {
              background-color: transparent !important;
              border-color: transparent !important;
              color: var(--td-brand-color);
            }
          }
        }
      }

      .right {
        .box-anthology-reverse-order {
          cursor: pointer;
        }
      }
    }

    .listbox {
      overflow: hidden;

      .nav {
        margin-top: var(--td-comp-margin-s);
      }

      .tag-container {
        display: flex;
        flex-wrap: wrap;
        margin-top: var(--td-comp-margin-s);

        .mainVideo-num {
          position: relative;
          width: 41px;
          font-size: 18px;
          height: 41px;
          line-height: 41px;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          margin-bottom: 4px;
          margin-right: 4px;
          box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);

          &:hover {
            background-image: linear-gradient(var(--td-brand-color-2), var(--td-brand-color-3));
          }

          &:before {
            content: '';
            display: block;
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 1px;
            border-radius: 8px;
            background-color: var(--td-bg-container);
            z-index: 2;
          }

          .mainVideo_inner {
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 1px;
            border-radius: 8px;
            z-index: 3;
            overflow: hidden;
            background-image: linear-gradient(hsla(0, 0%, 100%, 0.04), hsla(0, 0%, 100%, 0.06));

            .playing {
              display: none;
              min-width: 10px;
              height: 8px;
              background: url(@/assets/player/playon-green.gif) no-repeat;
            }
          }
        }

        .mainVideo-selected {
          color: var(--td-brand-color);
          background-image: linear-gradient(hsla(0, 0%, 100%, 0.1), hsla(0, 0%, 100%, 0.06));

          // box-shadow: 0 2px 8px 0 rgba(0,0,0,.08), inset 0 4px 10px 0 rgba(0,0,0,.14);
          .playing {
            display: inline-block !important;
            position: absolute;
            left: 6px;
            bottom: 6px;
          }
        }
      }
    }
  }
}

.select {
  color: var(--td-brand-color) !important;
  cursor: pointer;
}

.t-tabs {
  background-color: transparent;
}

:deep(.t-tabs__content) {
  max-height: 150px;
  padding: 10px 0 0 0;
  overflow-y: auto;
}

.active {
  color: var(--td-brand-color);
}
</style>
