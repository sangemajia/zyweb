<template>
  <div class="chase-page">
    <h2>过刻页面</h2>
    <p>这是过刻功能模块的Web版本。</p>

    <div class="component-info">
      <h3>组件信息</h3>
      <p><strong>名称:</strong> 过刻组件</p>
      <p><strong>描述:</strong> 用于记录和分享精彩时刻</p>
      <p><strong>版本:</strong> 1.0.0</p>
    </div>

    <div class="features">
      <h3>功能特性</h3>
      <ul>
        <li>时刻记录</li>
        <li>内容分享</li>
        <li>时间线浏览</li>
        <li>标签管理</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 过刻页面组件
</script>

<style lang="less" scoped>
.chase-page {
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.component-info,
.features {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 3px;
}

.features ul {
  list-style-type: disc;
  padding-left: 20px;
}
</style>
