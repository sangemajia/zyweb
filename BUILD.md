# zyweb 构建指南

## 简介

zyweb 采用分层构建架构，将前端应用拆分为多个层次，以提高构建效率和组件复用性：

1. **基础组件层** - 共享的基础UI组件
2. **中型组件层** - 功能模块组件（如Film页面组件）
3. **大型组件层** - 完整功能页面组件
4. **功能页面层** - 特定功能页面
5. **前端毛坯层** - 前端框架和基础结构
6. **完整应用层** - 完整的Web应用

## 构建方式

### 1. 智能构建（推荐）

使用统一的构建入口，自动管理内存限制和推荐方案：

```bash
# 首次构建（生成推荐内存方案）
npm run build

# 使用推荐方案构建（更快）
npm run build --use-recommended
```

### 2. 分层构建

可以单独构建特定层次：

```bash
# 构建基础组件层
./build/scripts/build-shared.sh

# 构建Film中型组件层
./build/scripts/build-film-medium.sh

# 构建Film大型组件层
./build/scripts/build-film-large.sh

# 构建Film功能页面层
./build/scripts/build-film-feature.sh

# 构建前端毛坯层
./build/scripts/build-frontend-shell.sh

# 构建完整应用层
./build/scripts/build-complete-app.sh
```

### 3. 完整构建

按顺序构建所有层次：

```bash
./build/scripts/build-all-layers.sh
```

## 内存优化

### 智能内存管理

构建系统会自动检测系统可用内存并动态调整Node.js内存限制：

1. **首次构建** - 自动生成推荐内存方案
2. **后续构建** - 可使用推荐方案加速构建

### 推荐方案

构建完成后会在 `build/recommendations/` 目录下生成推荐内存方案文件：

- `shared_recommendation.txt` - 基础组件层推荐方案
- `film-medium_recommendation.txt` - Film中型组件层推荐方案
- `film-large_recommendation.txt` - Film大型组件层推荐方案
- `film-feature_recommendation.txt` - Film功能页面层推荐方案
- `frontend-shell_recommendation.txt` - 前端毛坯层推荐方案
- `complete-app_recommendation.txt` - 完整应用层推荐方案

## 开发模式

```bash
# 启动开发服务器
npm run dev:web

# 启动后端服务
npm run dev:server
```

## 构建优化措施

1. **分层构建** - 减少重复构建，提高效率
2. **智能内存管理** - 动态调整内存限制
3. **推荐方案** - 基于历史构建数据优化内存分配
4. **资源清理** - 构建前后自动清理资源
5. **代码分割** - 合理分割代码块
6. **依赖优化** - 对大型依赖进行单独打包

## 故障排除

### 内存不足

如果遇到内存不足错误，可以：

1. 使用推荐内存方案构建
2. 手动调整Node.js内存限制：
   ```bash
   export NODE_OPTIONS="--max-old-space-size=800"
   npm run build
   ```

### 构建失败

1. 检查错误日志
2. 执行资源清理：
   ```bash
   ./build/scripts/build-cleanup.sh
   ```
3. 重新构建