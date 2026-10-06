import { docEntries } from './content/docs';
import { productVersion } from './site';
import { knownPaths } from './routing';
import mascotUrl from './assets/mascot.webp';

export const siteOrigin = 'https://sleepy-doll.restless-nh3.com';
const homeTitle = 'Sleepy Doll 发条枢｜通用桌面 AI 助手';
const homeDescription = 'Sleepy Doll（发条枢）是一款通用桌面 AI 助手。通过对话调用工具、执行任务，支持插件扩展、操作审批和快捷任务。';
const descriptions: Record<string, string> = {
  guide: 'Sleepy Doll 使用指南：模型配置、工具连接、操作审批、执行记录与快捷任务。',
  faq: 'Sleepy Doll 常见问题：模型调用费用、对话与密钥处理、工具适配范围。',
  changelog: 'Sleepy Doll 更新日志，查看各版本的功能与改进。',
  developer: 'Sleepy Doll 的开发安排、源码开放计划与反馈渠道。',
};
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function seoHead(path: string, imageUrl: string) {
  const valid = knownPaths.includes(path);
  const canonicalPath = valid ? path : '/';
  const doc = docEntries.find(entry => path === `/docs/${entry.key}`);
  const title = doc ? `${doc.title}｜Sleepy Doll 发条枢` : path === '/docs' ? '帮助文档｜Sleepy Doll 发条枢' : homeTitle;
  const description = doc ? descriptions[doc.key] : path === '/docs' ? 'Sleepy Doll 帮助文档：使用指南、常见问题、更新日志与开发计划。' : homeDescription;
  const url = siteOrigin + canonicalPath;
  const website = { '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: 'Sleepy Doll', alternateName: '发条枢', url: `${siteOrigin}/`, inLanguage: 'zh-CN' };
  const webpage = { '@type': 'WebPage', '@id': `${url}#page`, url, name: title, description, inLanguage: 'zh-CN', isPartOf: { '@id': website['@id'] } };
  const graph: unknown[] = [website, webpage];
  if (canonicalPath === '/') graph.push({ '@type': 'SoftwareApplication', name: 'Sleepy Doll', alternateName: '发条枢', url, description: homeDescription, operatingSystem: 'Windows', applicationCategory: 'UtilitiesApplication', softwareVersion: productVersion, image: imageUrl });
  if (canonicalPath.startsWith('/docs')) {
    const items = [{ name: '首页', item: `${siteOrigin}/` }, { name: '帮助文档', item: `${siteOrigin}/docs` }];
    if (doc) items.push({ name: doc.title, item: url });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) });
  }
  const meta = (name: string, content: string, property = false) => `<meta data-site-seo ${property ? 'property' : 'name'}="${name}" content="${escape(content)}">`;
  return [
    `<title data-site-seo>${escape(title)}</title>`,
    meta('description', description),
    meta('robots', valid ? 'index,follow,max-image-preview:large' : 'noindex,follow'),
    `<link data-site-seo rel="canonical" href="${escape(url)}">`,
    meta('og:type', 'website', true), meta('og:site_name', 'Sleepy Doll', true), meta('og:locale', 'zh_CN', true),
    meta('og:title', title, true), meta('og:description', description, true), meta('og:url', url, true),
    meta('og:image', imageUrl, true), meta('og:image:alt', 'Sleepy Doll 发条枢', true),
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
