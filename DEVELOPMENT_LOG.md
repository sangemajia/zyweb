# ZyWeb 开发日志

## 项目概述
基于 ZyPlayer 桌面应用源码，衍生出一个功能一致、界面一致的 Web 应用 ZyWeb。实现资源通用，确保 ZyPlayer 和 ZyWeb 的前后端可以混用。

## 技术架构设计

### 1. 整体架构
- 前端框架：Vue 3 + TypeScript
- UI 组件库：TDesign Vue Next
- 路由管理：Vue Router
- 状态管理：Pinia
- 构建工具：Vite
- 后端服务：Fastify (与 ZyPlayer 共享)
- 数据库：与 ZyPlayer 共享

### 2. 目录结构
```
zyweb/
├── build/                  # 构建相关文件
├── desgin/                 # 设计资源
├── resources/              # 资源文件
├── src/                    # 源代码
│   ├── main/               # Electron 主进程代码
│   ├── preload/            # Electron 预载脚本
│   ├── renderer/           # Electron 渲染进程代码
│   │   └── src/            # 实际的前端代码
│   └── web-adaptor/        # Web 适配层
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
└── package.json            # 项目配置
```

### 3. 与 ZyPlayer 的关系
ZyPlayer 采用 Electron 应用的标准结构，ZyWeb 项目在保留原有结构的基础上增加 Web 适配层，以支持 Web 部署。

### 4. Web 适配层架构
Web 适配层是 ZyWeb 项目的核心组件，用于替代 Electron 预加载脚本的功能，为 Web 环境提供与 Electron 环境相似的 API。该适配层包含以下组件：

- **electronAPI 模拟**: 模拟 Electron 的 ipcRenderer 对象，提供 send、invoke、on 和 removeAllListeners 方法
- **removeLoading 函数**: 模拟 Electron 预加载脚本中的 removeLoading 函数
- **本地存储工具类**: 用于在 Web 环境中模拟 Electron 的一些功能
- **HTTP 客户端**: 用于在 Web 环境中与后端通信
- **WebSocket 客户端**: 用于在 Web 环境中处理实时通信
- **平台工具类**: 用于处理 Electron 和 Web 之间的差异
- **文件系统工具类**: 用于处理 Electron 和 Web 之间的文件系统差异

### 5. WebBridge API 架构
WebBridge API 是 ZyWeb 项目的后端组件，用于处理 Web 环境中无法直接实现的 Electron 特定功能。该 API 包含以下端点：

- **IPC 消息处理端点**: 处理来自 Web 适配层的 IPC 消息
- **文件管理 API 端点**: 处理文件操作请求
- **FFmpeg 相关 API 端点**: 处理 FFmpeg 相关请求
- **媒体嗅探 API 端点**: 处理媒体嗅探请求
- **会话管理 API 端点**: 处理会话管理请求
- **老板键管理 API 端点**: 处理老板键管理请求

## 开发计划

### 阶段一：项目框架搭建
- [x] 分析 ZyPlayer 项目结构
- [x] 设计 ZyWeb 项目架构
- [x] 复制 ZyPlayer 完整项目结构
- [x] 配置 Web 构建工具 (Vite)
- [x] 添加 Web 构建和开发脚本
- [x] 创建 Web 适配层

### 阶段二：功能实现
- [x] 实现资源通用性设计
- [x] 确保与 ZyPlayer 前后端混用兼容性
- [x] 调整入口文件以适配 Web 环境
- [x] 实现平台差异的适配层
- [x] 处理 Electron 特定功能的替代方案

### 阶段三：后端 API 支持
- [x] 创建 Web 桥接 API 路由
- [x] 实现 IPC 消息处理端点
- [x] 实现文件管理 API 端点
- [x] 实现 FFmpeg 相关 API 端点
- [x] 实现媒体嗅探 API 端点
- [x] 实现会话管理 API 端点
- [x] 实现老板键管理 API 端点

### 阶段四：测试与优化
- [x] 功能测试
- [x] 验证核心功能是否正常工作
- [x] 测试 WebBridge API 端点
- [x] 测试 IPC 消息处理端点
- [x] 测试文件操作端点
- [ ] 检查 UI 渲染是否正确
- [ ] 性能优化
- [ ] 兼容性测试
- [ ] 文档完善

## 已完成的改造工作

### 1. 构建配置
- 创建了适用于 Web 的 Vite 配置文件 (vite.config.ts)
- 修改了 package.json，添加了 Web 相关的构建和开发脚本：
  - `dev:web`: 启动 Web 开发服务器
  - `build:web`: 构建 Web 应用
  - `preview:web`: 预览构建后的 Web 应用

### 2. 入口文件
- 创建了 Web 应用的入口文件 index.html
- 修改了 main.ts，移除了 Electron 特定的代码并引入了 Web 适配层

### 3. Web 适配层
- 创建了 web-adaptor 目录，用于替代 Electron 预加载脚本的功能
- 实现了 removeLoading 函数的 Web 版本
- 创建了 electronAPI 对象的完整模拟实现，包括 ipcRenderer 的 send、invoke、on 和 removeAllListeners 方法
- 为所有已识别的 Electron 特定功能提供了 Web 兼容的替代方案
- 添加了本地存储工具类，用于在 Web 环境中模拟 Electron 的一些功能
- 添加了 HTTP 客户端，用于在 Web 环境中与后端通信
- 添加了 WebSocket 客户端，用于在 Web 环境中处理实时通信
- 添加了平台工具类，用于处理 Electron 和 Web 之间的差异
- 添加了文件系统工具类，用于处理 Electron 和 Web 之间的文件系统差异

### 4. WebBridge API
- 创建了 Web 桥接 API 路由，用于处理 Web 环境中无法直接实现的 Electron 特定功能
- 实现了 IPC 消息处理端点，处理来自 Web 适配层的 IPC 消息
- 实现了文件管理 API 端点，处理文件操作请求
- 实现了 FFmpeg 相关 API 端点，处理 FFmpeg 相关请求
- 实现了媒体嗅探 API 端点，处理媒体嗅探请求
- 实现了会话管理 API 端点，处理会话管理请求
- 实现了老板键管理 API 端点，处理老板键管理请求

## 已识别的 Electron 特定功能

通过代码分析，我们识别出以下 Electron 特定的 API 调用：

### 1. IPC 通信
- `window.electron.ipcRenderer.send()` - 发送消息到主进程
- `window.electron.ipcRenderer.invoke()` - 调用主进程方法并等待响应
- `window.electron.ipcRenderer.on()` - 监听主进程发送的消息
- `window.electron.ipcRenderer.removeAllListeners()` - 移除所有监听器

### 2. 窗口管理
- `window.electron.ipcRenderer.send('open-win', { action: 'play' })` - 打开新窗口
- `window.electron.ipcRenderer.send('win:invoke', 'max')` - 窗口最大化
- `window.electron.ipcRenderer.send('manage-win', { win: 'play', action: 'focus' })` - 窗口焦点管理

### 3. 文件操作
- `window.electron.ipcRenderer.invoke('manage-file', { action: 'read', config: { path: filePath }})` - 读取文件
- `window.electron.ipcRenderer.invoke('manage-file', { action: 'write', config: { path: filePath, content: content }})` - 写入文件
- `window.electron.ipcRenderer.invoke('manage-dialog', { ... })` - 文件对话框
- `window.electron.ipcRenderer.invoke('get-app-path', 'userData')` - 获取应用路径

### 4. 系统功能
- `window.electron.ipcRenderer.send('quit-app')` - 退出应用
- `window.electron.ipcRenderer.send('reboot-app')` - 重启应用
- `window.electron.ipcRenderer.send('open-url', url)` - 打开 URL
- `window.electron.ipcRenderer.send('open-path', 'plugin')` - 打开路径

### 5. 媒体播放
- `window.electron.ipcRenderer.invoke('call-player', { path: playerMode.external, url })` - 调用外部播放器
- `window.electron.ipcRenderer.invoke('ffmpeg-thumbnail', url, id)` - 生成缩略图
- `window.electron.ipcRenderer.invoke('ffmpeg-check')` - 检查 ffmpeg

### 6. 更新和网络
- `window.electron.ipcRenderer.send('check-for-update')` - 检查更新
- `window.electron.ipcRenderer.send('update-dns', data)` - 更新 DNS
- `window.electron.ipcRenderer.send('toggle-selfBoot', formData.value.selfBoot)` - 开机自启

## 依赖关系优化

通过分析 package.json 文件，我们发现项目中包含了很多 Electron 特定的依赖，这些在 Web 环境下是不需要的。我们已经创建并使用了优化的 package.json 文件，其中只包含 Web 环境下真正需要的依赖。

### 移除的 Electron 特定依赖
- Electron 相关：electron, electron-builder, electron-vite, electron-log, electron-updater 等
- Electron 工具库：@electron-toolkit/*, @electron-uikit/*, electron-localshortcut, puppeteer-in-electron 等
- 桌面应用特定：@electron/notarize, fix-path, python-shell 等

### 保留的核心依赖
- Vue 生态：vue, vue-router, pinia, vue-i18n 等
- UI 组件库：tdesign-vue-next, tdesign-icons-vue-next 等
- 工具库：axios, lodash-es, moment, crypto-js 等
- 构建工具：vite, typescript, vue-tsc 等

## 内存管理机制

为了在资源有限的环境中（如M401A机顶盒）进行开发，我们实现了以下内存管理机制：

1. 创建了自动清理脚本 `/workspace/cleanup.sh`，用于终止不必要的 Node.js 进程
2. 创建了包装脚本 `/workspace/npm-clean`，在执行 npm 命令前自动清理内存
3. 在 package.json 的脚本中添加了内存限制：
   - 前端编译限制为 300M 内存
   - TypeScript 类型检查限制为 50M 内存
4. 创建了后端编译脚本 `/workspace/build-server`，限制后端编译内存使用不超过 50M

## 功能测试结果

我们已经完成了核心功能的测试，验证了以下组件的正常工作：

1. Vite 开发服务器能够正常启动
2. WebBridge API 端点能够正常响应请求
3. IPC 消息处理端点能够正确处理消息
4. 文件操作端点能够正确处理文件操作请求

## 下一步工作

### 1. 依赖安装
- [x] 成功安装了最小化依赖包
- [x] 成功启动了 Vite 开发服务器
- [x] 逐步添加了核心依赖（UI组件库、状态管理、工具库等）

### 2. 平台差异适配
- [x] 创建了完整的 Web 适配层
- [x] 为所有已识别的 Electron 特定功能提供了 Web 兼容的替代方案
- [x] 添加了本地存储工具类，用于在 Web 环境中模拟 Electron 的一些功能
- [x] 添加了 HTTP 客户端，用于在 Web 环境中与后端通信
- [x] 添加了 WebSocket 客户端，用于在 Web 环境中处理实时通信
- [x] 添加了平台工具类，用于处理 Electron 和 Web 之间的差异
- [x] 添加了文件系统工具类，用于处理 Electron 和 Web 之间的文件系统差异
- [x] 实现 IPC 通信的 HTTP API 替代方案
- [x] 实现文件操作的后端 API 替代方案

### 3. 后端 API 支持
- [x] 创建 Web 桥接 API 路由
- [x] 实现 IPC 消息处理端点
- [x] 实现文件管理 API 端点
- [x] 实现 FFmpeg 相关 API 端点
- [x] 实现媒体嗅探 API 端点
- [x] 实现会话管理 API 端点
- [x] 实现老板键管理 API 端点

### 4. 功能测试
- [x] 验证核心功能是否正常工作
- [x] 测试 WebBridge API 端点
- [x] 测试 IPC 消息处理端点
- [x] 测试文件操作端点

### 5. 构建优化
- [ ] 根据需要调整 Vite 配置
- [ ] 优化构建输出

## 当前状态
目前我们已经完成了项目框架的搭建、依赖优化和内存管理机制的实现。成功安装了核心依赖包，Vite 开发服务器能够正常启动。我们还创建了完整的 Web 适配层，为所有已识别的 Electron 特定功能提供了 Web 兼容的替代方案，并添加了本地存储工具类、HTTP 客户端、WebSocket 客户端、平台工具类和文件系统工具类。

我们已经实现了 IPC 通信和文件操作的 HTTP API 替代方案，创建了 Web 桥接 API 路由，包括 IPC 消息处理端点、文件管理 API 端点、FFmpeg 相关 API 端点、媒体嗅探 API 端点、会话管理 API 端点和老板键管理 API 端点。

通过功能测试，我们验证了所有核心功能都能正常工作，包括 WebBridge API 端点、IPC 消息处理端点和文件操作端点。下一步是进行更全面的功能测试，检查 UI 渲染是否正确，并根据需要调整 Vite 配置和优化构建输出。