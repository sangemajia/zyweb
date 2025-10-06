<template>
  <div class="play-page">
    <h2>播放页面</h2>
    <p>这是播放功能模块的Web版本。</p>

    <div class="component-info">
      <h3>组件信息</h3>
      <p><strong>名称:</strong> 播放组件</p>
      <p><strong>描述:</strong> 用于播放视频内容</p>
      <p><strong>版本:</strong> 1.0.0</p>
    </div>

    <div class="features">
      <h3>功能特性</h3>
      <ul>
        <li>视频播放</li>
        <li>播放控制</li>
        <li>字幕支持</li>
        <li>播放记录</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 播放页面组件
</script>

<style lang="less" scoped>
.play-page {
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
