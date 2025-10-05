<template>
  <header class="header" v-if="breadcrumb.length > 0">
    <div class="page-title">
      <div class="title">
        <t-breadcrumb :max-item-width="'80%'">
          <t-breadcrumbItem @click="gotoBreadcrumbPath(item.path)" v-for="item in breadcrumb">
            {{ item.name }}
          </t-breadcrumbItem>
        </t-breadcrumb>
      </div>
    </div>
    <div class="actions">
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  breadcrumb: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['gotoBreadcrumbPath']);

const gotoBreadcrumbPath = (path: string) => {
  emit('gotoBreadcrumbPath', path);
};
</script>

<style lang="less" scoped>
.header {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  flex-shrink: 0;

  .page-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
    position: relative;

    .title {
      font-size: 18px;
      font-weight: 600;
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  .actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
}
</style>