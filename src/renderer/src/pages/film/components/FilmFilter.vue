<template>
  <div v-show="isVisible.toolbar" class="filter header-wrapper">
    <div class="tags">
      <div v-for="filterItem in filterData[active.class]" :key="filterItem.key" class="tags-list">
        <div class="item title">{{ filterItem.name }}</div>
        <div class="wp">
          <div
            v-for="item in filterItem.value"
            :key="item"
            class="item"
            :class="{ active: active.filter[filterItem.key] === item.v }"
            :label="item.n"
            :value="item.v"
            @click="changeFilterEvent(filterItem.key, item.v)"
          >
            {{ item.n }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 定义组件属性
defineProps({
  filterData: {
    type: Object,
    required: true,
  },
  active: {
    type: Object,
    required: true,
  },
  isVisible: {
    type: Object,
    required: true,
  },
});

// 定义事件发射器
const emit = defineEmits(['changeFilterEvent']);

// 筛选条件切换事件处理函数
const changeFilterEvent = (key: string, item: any) => {
  emit('changeFilterEvent', key, item);
};
</script>

<style lang="less" scoped>
.filter {
  position: relative;
  height: auto;
  transition: height 0.3s;
  width: 100%;

  .tags {
    width: 100%;

    .tags-list {
      padding-top: var(--td-comp-paddingTB-xs);
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;

      &:after {
        clear: both;
        display: block;
        height: 0;
        visibility: hidden;
        content: '';
      }

      .title {
        // float: left;
        width: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        cursor: auto;
        box-sizing: border-box;
        height: 30px;
        font-weight: 400;
        font-size: 15px;
        line-height: 30px;
      }

      .wp {
        // float: left;
        // width: calc(100% - 50px);
        width: 100%;
        overflow-y: auto;
        white-space: nowrap;
        flex-wrap: nowrap;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        align-content: center;

        &::-webkit-scrollbar {
          height: 8px;
          background: transparent;
        }

        .item {
          display: block;
          padding: 0 14px;
          margin-right: 5px;
          box-sizing: border-box;
          height: 30px;
          font-weight: 400;
          font-size: 13px;
          line-height: 30px;
          text-align: center;
          cursor: pointer;
        }

        .active {
          height: 30px;
          border-radius: 20px;
          background: var(--td-bg-color-component);
        }
      }
    }
  }
}
</style>
