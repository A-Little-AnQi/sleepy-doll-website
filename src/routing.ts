import { docsMeta } from './content/docs-meta';

export interface PageRoute { path: string; anchor: string }

/** 文档路径从 docs-meta 派生，路由/SEO/预渲染共用这一个事实源。 */
export const documentPaths = docsMeta.map(meta => meta.path);
export const knownPaths = ['/', ...documentPaths];
export const navigationEvent = 'sleepy:navigate';

/** 精确匹配 /docs 或 /docs/ 前缀；/docsanything 不是文档路由。 */
export const isDocsPath = (path: string) => path === '/docs' || path.startsWith('/docs/');

export function currentRoute(fallback = '/'): PageRoute {
  if (typeof window === 'undefined') return { path: fallback, anchor: '' };
  const legacy = location.hash.match(/^#(\/docs(?:\/[\w-]+)?)(?:#(.*))?$/);
  return { path: legacy?.[1] ?? (location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/'), anchor: legacy?.[2] ?? location.hash.slice(1) };
}

function decodeAnchor(anchor: string): string {
  try { return decodeURIComponent(anchor); } catch { return anchor; }
}

/** 旧地址 → 新地址：aliases 精确匹配；无锚点的 from 迁移时保留当前锚点。 */
function aliasFor(path: string, anchor: string): string | null {
  for (const { from, to } of docsMeta.flatMap(meta => meta.aliases ?? [])) {
    if (from === to) continue;
    const hashAt = from.indexOf('#');
    const fromPath = hashAt < 0 ? from : from.slice(0, hashAt);
    const fromAnchor = hashAt < 0 ? '' : from.slice(hashAt + 1);
    if (fromPath !== path) continue;
    if (fromAnchor && fromAnchor !== anchor) continue;
    if (fromAnchor || !anchor) return to;
    return `${to}#${anchor}`;
  }
  return null;
}

/**
 * 地址规范化（每次导航后运行）：先按 aliases 迁移旧深链，再展开旧 #/docs
 * 哈希地址、清理尾斜杠与 index.html。用 replaceState，不产生历史条目。
 */
export function normalizeLegacyRoute() {
  if (typeof window === 'undefined') return;
  const route = currentRoute();
  const anchor = decodeAnchor(route.anchor);
  const alias = aliasFor(route.path, anchor);
  if (alias) { history.replaceState(history.state, '', alias); return; }
  const canonical = route.path + location.search + (route.anchor ? `#${route.anchor}` : '');
  if (location.pathname + location.search + location.hash !== canonical) {
    history.replaceState(history.state, '', canonical);
  }
}

/**
 * 锚点目标解析：先按原文找 id（rehype-slug 生成的 GitHub slug 为小写），
 * 找不到时按小写再扫一遍，兼容旧地址里保留英文大写的锚点。
 */
export function resolveAnchorTarget(anchor: string): HTMLElement | null {
  if (typeof document === 'undefined' || !anchor) return null;
  const id = decodeAnchor(anchor);
  const direct = document.getElementById(id);
  if (direct) return direct;
  const lower = id.toLowerCase();
  if (lower === id) return null;
  for (const element of document.getElementsByTagName('*')) {
    if (element.id?.toLowerCase() === lower) return element as HTMLElement;
  }
  return null;
}

export function saveScrollPosition() {
  if (history.state?.sleepyMenu) return;
  history.replaceState({ ...history.state, sleepyScroll: { x: scrollX, y: scrollY } }, '', location.href);
}

export function navigateTo(href: string) {
  const destination = new URL(href, location.href);
  if (destination.origin !== location.origin) return;
  if (destination.href === location.href) {
    requestAnimationFrame(() => {
      const target = resolveAnchorTarget(destination.hash.slice(1));
      if (target) target.scrollIntoView();
      else window.scrollTo({ top: 0 });
    });
  } else {
    saveScrollPosition();
    history.pushState(null, '', destination.pathname + destination.search + destination.hash);
  }
  window.dispatchEvent(new Event(navigationEvent));
}
