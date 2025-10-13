# ZYWeb 构建脚本优化说明

## 概述

本项目参照zyplayer的构建风格，对zyweb的构建脚本进行了优化，主要改进包括：

1. **统一构建模板**：创建了统一的构建脚本模板，所有组件构建脚本都基于此模板
2. **优化内存管理**：改进了Node.js内存限制的计算方式，根据组件类型和系统可用内存动态调整
3. **增强错误处理**：在构建失败时也执行内存清理，确保系统资源得到释放
4. **标准化日志输出**：统一了日志格式，便于调试和问题排查

## 构建脚本结构

```
build/scripts/
├── build-template.sh                 # 统一构建脚本模板
├── simple-build-optimized.sh         # 智能构建脚本（主入口）
├── build-{component}-optimized.sh    # 各组件优化后的构建脚本
├── build-cleanup.sh                  # 资源清理脚本
├── assemble-ui.sh                    # UI组装脚本
└── integrate-app.sh                  # 应用集成脚本
```

## 使用方法

### 构建所有组件
```bash
npm run build
```

### 构建指定组件
```bash
# 构建film组件
build/scripts/simple-build-optimized.sh -c film

# 构建home组件
build/scripts/simple-build-optimized.sh -c home

# 支持的组件包括：
# shared-components, film, iptv, drive, lab, chase, 
# play, setting, analyze, home, main, test
```

### 启动后暂停
```bash
# 构建所有组件并在启动后暂停5秒
build/scripts/simple-build-optimized.sh -p
```

## 内存管理优化

优化后的构建脚本根据组件类型和系统可用内存动态调整Node.js内存限制：

- **复杂组件** (film, iptv, drive, chase)：分配可用内存的70%，至少400MB
- **主组件** (main)：分配可用内存的80%，至少500MB
- **简单组件** (其他)：分配可用内存的60%，至少300MB

内存限制上限为2000MB，确保在低内存环境也能正常构建。

## 组件构建脚本

每个组件都有独立的优化构建脚本，基于统一模板生成，确保一致性和可维护性：

- `build-film-optimized.sh`
- `build-home-optimized.sh`
- `build-iptv-optimized.sh`
- `build-drive-optimized.sh`
- `build-lab-optimized.sh`
- `build-chase-optimized.sh`
- `build-play-optimized.sh`
- `build-setting-optimized.sh`
- `build-analyze-optimized.sh`
- `build-main-optimized.sh`
- `build-test-optimized.sh`
- `build-shared-components-optimized.sh`

## 注意事项

1. 所有构建脚本都具有执行权限
2. 构建前会自动执行资源清理
3. 构建完成后会再次执行资源清理
4. 构建失败时也会执行资源清理
5. 支持组件构建跳过机制，已存在的组件会自动跳过构建