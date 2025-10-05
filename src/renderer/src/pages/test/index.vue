<template>
  <div class="test-page">
    <h2>测试页面</h2>
    <p>这是测试功能模块的Web版本。</p>
    
    <div class="component-info">
      <h3>组件信息</h3>
      <p><strong>名称:</strong> 测试组件</p>
      <p><strong>描述:</strong> 用于系统功能测试</p>
      <p><strong>版本:</strong> 1.0.0</p>
    </div>
    
    <div class="features">
      <h3>功能特性</h3>
      <ul>
        <li>功能测试</li>
        <li>性能检测</li>
        <li>兼容性验证</li>
        <li>错误诊断</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// 测试页面组件
</script>

<style lang="less" scoped>
.test-page {
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