import { docsMeta } from './content/docs-meta';
import { productVersion } from './site';
import { knownPaths } from './routing';
import mascotUrl from './components/brand/avatar.png';

export const siteOrigin = 'https://sleepy-doll.restless-nh3.com';
const homeTitle = 'Pudding，面向工具软件的通用 AI 助手';
const homeDescription = 'Pudding 是一款面向工具软件的通用 AI 助手，曾用名 Sleepy Doll。用正常的话语提出需求，由助手查找资源、处理配置，再交给对应的软件执行。';
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

/** 各页标题与描述统一来自 docs-meta 元数据，不再单独维护副本。 */
export function seoHead(path: string, imageUrl: string) {
  const notFound = path === '/404';
  const valid = !notFound && knownPaths.includes(path);
  const canonicalPath = valid ? path : '/';
  const doc = docsMeta.find(entry => path === entry.path);
  const title = notFound ? '页面未找到，Pudding'
    : doc ? `${doc.title}，Pudding 帮助文档`
    : path === '/docs' ? 'Pudding 帮助文档'
    : homeTitle;
  const description = notFound ? '访问的页面不存在或已移动，可从首页或帮助文档继续查找。'
    : doc ? doc.description
    : path === '/docs' ? 'Pudding 帮助文档：安装配置、功能指南与故障排查。'
    : homeDescription;
  const url = siteOrigin + canonicalPath;
  const website = { '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: 'Pudding', alternateName: 'Sleepy Doll', url: `${siteOrigin}/`, inLanguage: 'zh-CN' };
  const webpage = { '@type': 'WebPage', '@id': `${url}#page`, url, name: title, description, inLanguage: 'zh-CN', isPartOf: { '@id': website['@id'] } };
  const graph: unknown[] = [website, webpage];
  if (canonicalPath === '/') graph.push({ '@type': 'SoftwareApplication', name: 'Pudding', alternateName: 'Sleepy Doll', url, description: homeDescription, operatingSystem: 'Windows', applicationCategory: 'UtilitiesApplication', softwareVersion: productVersion, image: imageUrl });
  if (valid && canonicalPath.startsWith('/docs')) {
    const items = [{ name: '首页', item: `${siteOrigin}/` }, { name: '帮助文档', item: `${siteOrigin}/docs` }];
    if (doc && doc.path !== '/docs') items.push({ name: doc.title, item: `${siteOrigin}${doc.path}` });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) });
  }
  const meta = (name: string, content: string, property = false) => `<meta data-site-seo ${property ? 'property' : 'name'}="${name}" content="${escape(content)}">`;
  return [
    `<title data-site-seo>${escape(title)}</title>`,
    meta('description', description),
    meta('robots', valid ? 'index,follow,max-image-preview:large' : 'noindex,follow'),
    `<link data-site-seo rel="canonical" href="${escape(url)}">`,
    meta('og:type', 'website', true), meta('og:site_name', 'Pudding', true), meta('og:locale', 'zh_CN', true),
    meta('og:title', title, true), meta('og:description', description, true), meta('og:url', url, true),
    meta('og:image', imageUrl, true), meta('og:image:alt', 'Pudding', true),
    meta('twitter:card', 'summary'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', imageUrl),
    `<script data-site-seo type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\u003c')}</script>`,
  ].join('\n');
}

export function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${knownPaths.map(path => `<url><loc>${siteOrigin}${path}</loc></url>`).join('')}</urlset>`;
}

export function updateSeo(path: string) {
  const template = document.createElement('template');
  template.innerHTML = seoHead(path, new URL(mascotUrl, siteOrigin).href);
  document.head.querySelectorAll('[data-site-seo]').forEach(node => node.remove());
  document.head.append(template.content);
}
