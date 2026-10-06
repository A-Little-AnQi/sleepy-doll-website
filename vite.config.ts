import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 官网构建配置。
 *
 * 站点部署在域名根路径；资源使用绝对路径，文档的独立地址也能正确加载资源，
 * 不依赖服务器端路由回退之外的基础路径约定。
 */
export default defineConfig({
  base: '/',
  plugins: [react(), {
    name: 'development-sitemap',
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        const [path, query] = (request.url ?? '/').split('?');
        if (/^\/docs(?:\/(?:guide|faq|changelog|developer))?\/?$/.test(path)) {
          request.url = path.replace(/\/$/, '') + '/index.html' + (query ? `?${query}` : '');
        }
        next();
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
