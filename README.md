<div align="center">

<img src="https://raw.githubusercontent.com/Pudding-Player/Pudding/main/assets/brand/avatar.png" width="72" alt="Pudding" />

# Pudding 官网

[Pudding](https://github.com/Pudding-Player/Pudding) 的官方网站：sleepy-doll.restless-nh3.com。

[![License: GPL v3](https://img.shields.io/badge/License-GPL--3.0--only-blue.svg)](LICENSE) ![Platform](https://img.shields.io/badge/Platform-Web-0078D6.svg) ![Language](https://img.shields.io/badge/TypeScript%20%2B%20Vite-orange.svg)

[访问官网](https://sleepy-doll.restless-nh3.com) · [主程序仓库](https://github.com/Pudding-Player/Pudding) · [使用指南](https://sleepy-doll.restless-nh3.com/docs/guide)

</div>

## 站点结构

React + TypeScript + Vite。首页是滚动舞台动画；文档页由 Markdown 生成，静态发布到 `/docs` 与 `/docs/<key>`，旧的 `#/docs` 链接仍可使用。

## 开发

需要 Node.js 22.13 或更新版本：

```powershell
npm ci
npm run dev
npm run build
```

`npm run build` 执行类型检查、构建资源并预渲染首页和文档到 `dist/`。

## 源码位置

| 内容 | 位置 |
| --- | --- |
| 首页与导航文案 | `src/site.ts` |
| 文档 Markdown（指南、FAQ、更新日志、开发者的话） | `src/content/docs/` |
| 顶部 4 张场景插画（SVG） | `src/assets/previews/scene-*.svg`，经 `src/stage/Headings.tsx` 引入 |
| 通用卡 4 张插画（SVG） | `src/assets/previews/`，由 `src/stage/cards.ts` 显式 import |
| 品牌图标与字标（PNG） | `src/components/brand/` |

首页插画由源码显式引入：调整插画时替换 `src/assets/previews/` 中同名文件并重新构建。现有 SVG 为带动效的概念插画，支持减少动态效果。

## 部署与数据

Vercel 连接本仓库 main 分支，推送后自动构建发布；`vercel.json` 将 `/api/*` 转发到 Cloudflare Worker。发布信息接口与统计服务端密钥维护在[主程序仓库](https://github.com/Pudding-Player/Pudding)的分发服务（`cloudflare/`）。

主下载按钮只读取正式发布通道；软件发布流程更新通道清单后，官网的下载链接与版本号自动跟进，测试通道在下载区提供独立且标明版本的入口，不静默回退。站点匿名统计默认开启，记录页面访问与下载点击，不收集对话和模型密钥。

## 许可

本仓库以 [GNU GPL v3.0（GPL-3.0-only）](LICENSE) 发布，Copyright © 2026 Pudding contributors。第三方依赖、商标和外部素材遵循各自许可与使用条件。
