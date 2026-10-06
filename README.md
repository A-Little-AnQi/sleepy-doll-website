# Sleepy Doll 官网

正式源码目录：`E:\BetterGIProject\sleepy-doll-website`。React + TypeScript + Vite，首页保留滚动舞台，文档使用 Markdown。公开仓库：https://github.com/A-Little-AnQi/sleepy-doll-website。

## 开发与发布

需要 Node.js 22.13 或更新版本。`npm ci` 安装依赖，`npm run dev` 开发，`npm run build` 类型检查并生成 `dist/`。

Vercel 连接本仓库的 main 分支，推送后自动构建发布。`vercel.json` 将 `/api/*` 转发到 Cloudflare Worker，发布信息和 GA4 服务端密钥都留在软件仓库的分发服务中。

## 替换首页图片

将四张截图放入 `src/assets/previews/`，文件名分别为：

- `chat.webp`：对话
- `tools.webp`：工具与插件
- `connection.webp`：BetterGI 连接
- `timeline.webp`：快捷任务

也支持相同名称的 `.png`、`.jpg`、`.jpeg`，优先级依次为 webp、png、jpg、jpeg、svg。现有 SVG 是占位图；加入截图后无需改代码。建议比例 16:9，图片完整展示，不裁切。提交并推送即可更新网站。

## 内容与统计

首页及导航文案在 `src/site.ts`，文档在 `src/content/docs/`。开发者的话和更新安排在 `developer.md`。

下载按钮读取正式通道，尚未发布时使用测试通道；接口故障时提供 GitHub Releases 入口。匿名统计默认关闭，在页脚主动开启后记录页面访问与下载点击，可以随时关闭。不收集对话和模型密钥。
