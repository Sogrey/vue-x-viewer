# vue-x-viewer

基于 x-viewer 的 Vue 3 CAD 查看器项目。

## 功能特性

- 📦 支持多种 CAD 文件格式查看
- 📁 支持文件 URL、文件选择和拖拽上传
- 🎨 深色主题，科技风设计
- 📱 响应式布局，适配移动端

## 技术栈

- Vue 3 + TypeScript
- Vite
- x-viewer (CAD 查看器 SDK)
- Three.js

## 项目设置

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

### 生产构建

```sh
npm run build
```

### 代码检查

```sh
npm run lint
```

## 使用说明

1. 启动开发服务器后，打开浏览器访问
2. 在左侧面板输入文件 URL 或选择本地文件
3. 支持拖拽文件到查看器区域上传

## 注意事项

本项目包含着色器宏冲突修复脚本，用于解决 x-viewer 与 Three.js 的 saturate 宏定义冲突。修复会在 `postinstall` 时自动执行。
