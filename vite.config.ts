import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { docsMeta } from './src/content/docs-meta.ts';

/**
 * 官网构建配置。
 *
 * 站点部署在域名根路径；资源使用绝对路径，文档的独立地址也能正确加载资源，
 * 不依赖服务器端路由回退之外的基础路径约定。
 *
 * 文档路由从 src/content/docs-meta.ts 派生（纯数据模块，可被配置安全引用）；
 * 正常文档路径由预渲染目录的 index.html 直接提供（本地 preview 中间件做
 * 尾斜杠与 /index.html 的正规化），未知 /docs 地址以 404 状态返回 dist/404.html，
 * 与 Vercel 对未匹配静态路径的 SSG 404 行为一致。
 */

const docPaths = docsMeta.map(meta => meta.path);
const notFoundPage = fileURLToPath(new URL('./dist/404.html', import.meta.url));

export default defineConfig({
  base: '/',
  build: {
    // 生成 dist/.vite/manifest.json，供预渲染脚本把 /src/ 开发资源 URL 映射为带哈希的产物路径。
    manifest: true,
  },
  plugins: [react(), {
    name: 'development-sitemap',
    configurePreviewServer(server) {
      let notFoundHtml: string | null = null;
      server.middlewares.use((request, response, next) => {
        const [path, query] = (request.url ?? '/').split('?');
        // 尾斜杠与直接 /index.html 请求都正规化到元数据里的路径再匹配。
        const clean = path.replace(/\/index\.html$/, '').replace(/\/+$/, '');
        // 精确 /docs 或 /docs/ 前缀；/docsanything 不是文档路由，不在此处理。
        if (clean !== '/docs' && !clean.startsWith('/docs/')) return next();
        if (docPaths.includes(clean)) {
          request.url = clean + '/index.html' + (query ? `?${query}` : '');
          return next();
        }
        // 未知文档地址：直接以 404 结束响应，不再交给 sirv（它会改成 200 回首页）。
        try { notFoundHtml ??= readFileSync(notFoundPage, 'utf8'); } catch { notFoundHtml = null; }
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(notFoundHtml ?? '<!doctype html><title>404</title><p>页面未找到</p>');
      });
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split('?')[0] !== '/sitemap.xml') return next();
        try {
          const { sitemap } = await server.ssrLoadModule('/src/seo.ts');
          response.setHeader('Content-Type', 'application/xml; charset=utf-8');
          response.end(sitemap());
        } catch (error) { next(error as Error); }
      });
    },
  }],
  server: {
    proxy: {
      '/api': { target: 'https://sleepy-doll-api.restless-nh3.com', changeOrigin: true },
    },
  },
});
