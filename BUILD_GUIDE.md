# ZYWeb分步构建指南

由于构建过程可能因资源限制而超时，本指南提供手动分步构建的详细步骤。

## 构建步骤

### 1. 完整构建（推荐）
```bash
cd /workspace/zyweb
npm run build
```

这将执行以下步骤：
1. 清理构建环境
2. 构建所有组件（使用simple-build.sh）
3. 组装UI（simple-build.sh调用assemble-ui.sh）
4. 集成应用（simple-build.sh调用integrate-app.sh）

### 2. 分步构建
如果完整构建失败，可以分步执行：

#### 2.1 构建组件
```bash
./build/scripts/build-cleanup.sh && ./build/scripts/simple-build.sh
```

#### 2.2 单独构建指定组件
```bash
./build/scripts/simple-build.sh -c film  # 构建film组件
./build/scripts/simple-build.sh -c home  # 构建home组件
```

#### 2.3 单独执行UI组装
```bash
./build/scripts/assemble-ui.sh
```

#### 2.4 单独执行应用集成
```bash
./build/scripts/integrate-app.sh
```

### 3. 手动分步构建（如果自动构建超时）
按以下顺序执行：
```bash
cd /workspace/zyweb
./build/scripts/build-shared-components.sh
./build/scripts/build-home.sh
./build/scripts/build-film.sh
./build/scripts/build-iptv.sh
./build/scripts/build-drive.sh
./build/scripts/build-play.sh
./build/scripts/build-analyze.sh
./build/scripts/build-chase.sh
./build/scripts/build-lab.sh
./build/scripts/build-setting.sh
./build/scripts/assemble-ui.sh
./build/scripts/integrate-app.sh
```

## 错误诊断指南

### 构建失败常见原因

1. **内存不足**
   - 错误信息：`JavaScript heap out of memory`
   - 解决方案：执行`./build/scripts/build-cleanup.sh`清理内存后重试

2. **依赖缺失**
   - 错误信息：`Cannot find module`或`Cannot find package`
   - 解决方案：检查package.json确保所有依赖都已安装

3. **文件权限问题**
   - 错误信息：`Permission denied`
   - 解决方案：检查文件权限，必要时使用`chmod`命令修改

4. **路径问题**
   - 错误信息：`No such file or directory`
   - 解决方案：检查文件路径是否正确，确保所有必需文件都存在

### 检查构建产物

1. **检查共享组件**
   ```bash
   ls -la /workspace/zyweb/dist/zyweb/shared-components/
   ```

2. **检查页面构建产物**
   ```bash
   ls -la /workspace/zyweb/dist/zyweb/home/
   ls -la /workspace/zyweb/dist/zyweb/film/
   # 检查其他页面目录
   ```

3. **检查UI组装结果**
   ```bash
   ls -la /workspace/zyweb/dist/ui/
   ls -la /workspace/zyweb/dist/ui/js/
   ls -la /workspace/zyweb/dist/ui/css/
   ls -la /workspace/zyweb/dist/ui/images/
   ls -la /workspace/zyweb/dist/ui/resources/
   ```

4. **检查应用集成结果**
   ```bash
   ls -la /workspace/zyweb/dist/app/
   ls -la /workspace/zyweb/dist/app/ui/
   ls -la /workspace/zyweb/dist/app/server/
   ls -la /workspace/zyweb/dist/app/resources/
   ```

### 重新构建特定组件

如果某个组件构建失败，可以单独重新构建：
```bash
# 重新构建共享组件
./build/scripts/build-shared-components.sh

# 重新构建特定页面
./build/scripts/build-film.sh
```

### 清理和重试

如果遇到问题，可以清理后重新构建：
```bash
# 清理构建产物
rm -rf /workspace/zyweb/dist/*

# 清理内存
./build/scripts/build-cleanup.sh

# 重新开始构建
./build/scripts/build-shared-components.sh
```

## 环境变量配置

构建完成后，确保正确配置环境变量：
- 检查`/workspace/zyweb/dist/server/.env`文件
- 确保数据库配置正确
- 确保端口配置正确

## 启动服务

构建完成后，启动服务验证：
```bash
cd /workspace/zyweb/dist/server
node index.js
```

或者启动集成应用：
```bash
cd /workspace/zyweb/dist/app
./start.sh
```

## 目录结构说明

集成后的应用程序具有以下目录结构：
- server/: 后端服务文件
- ui/: 前端UI文件
  - js/: JavaScript文件
  - css/: CSS样式文件
  - images/: 图片资源文件
  - resources/: 公共资源文件
- resources/: 项目公共资源文件（在集成时复制到ui/resources/）
- .env: 环境变量配置文件
- start.sh: 启动脚本