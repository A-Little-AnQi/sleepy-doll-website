# Sleepy Doll 官网

正式源码目录：`E:\BetterGIProject\sleepy-doll-website`。React + TypeScript + Vite，首页保留滚动舞台，文档使用 Markdown，发布地址为 `/docs` 和 `/docs/<key>`，旧的 `#/docs` 链接仍可使用。公开仓库：https://github.com/A-Little-AnQi/sleepy-doll-website。

## 开发与发布

需要 Node.js 22.13 或更新版本。`npm ci` 安装依赖，`npm run dev` 开发，`npm run build` 类型检查、构建资源并预渲染首页和文档到 `dist/`。

Vercel 连接本仓库的 main 分支，推送后自动构建发布。`vercel.json` 将 `/api/*` 转发到 Cloudflare Worker，发布信息和 GA4 服务端密钥都留在软件仓库的分发服务中。

## 替换首页图片

将四张图片放入 `src/assets/previews/`，文件名分别为：

- `chat.webp`：对话
- `tools.webp`：工具与插件
- `connection.webp`：通用工具连接
- `timeline.webp`：快捷任务

也支持相同名称的 `.png`、`.jpg`、`.jpeg`，优先级依次为 webp、png、jpg、jpeg、svg。现有 SVG 为带动效的概念插画，支持减少动态效果；加入自定义图片后无需改代码。建议比例 16:9，图片完整展示，不裁切。提交并推送即可更新网站。

## 内容与统计

首页及导航文案在 `src/site.ts`，文档在 `src/content/docs/`。开发者的话和更新安排在 `developer.md`。

主下载按钮只读取正式通道，测试通道在下载区提供独立且标明版本的入口，不静默回退。当前 `0.1.0` 是正式版；支持 SemVer 的 Alpha、Beta、RC 后缀，但这些包不能出现在正式通道。只接受 `src/site.ts` 中 `productVersion` 或更新的基础版本，不提供旧的 0.0.1 测试包。软件发布流程更新各自通道清单后，官网的下载链接与版本号自动跟进。官网匿名统计默认开启，记录页面访问与下载点击。不收集对话和模型密钥。
