<template>
  <div class="setting-page">
    <h2>设置页面</h2>
    <p>这是设置功能模块的Web版本。</p>
    
    <div class="component-info">
      <h3>组件信息</h3>
      <p><strong>名称:</strong> 设置组件</p>
      <p><strong>描述:</strong> 用于配置应用参数</p>
      <p><strong>版本:</strong> 1.0.0</p>
    </div>
    
    <div class="features">
      <h3>功能特性</h3>
      <ul>
        <li>系统设置</li>
        <li>用户偏好</li>
        <li>网络配置</li>
        <li>存储管理</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 设置页面组件
</script>

<style lang="less" scoped>
.setting-page {
  padding: 20px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.component-info, .features {
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