export interface PageRoute { path: string; anchor: string }
export const documentPaths = ['/docs', '/docs/guide', '/docs/faq', '/docs/changelog', '/docs/developer'];
export const knownPaths = ['/', ...documentPaths];
export const navigationEvent = 'sleepy:navigate';

export function currentRoute(fallback = '/'): PageRoute {
  if (typeof window === 'undefined') return { path: fallback, anchor: '' };
  const legacy = location.hash.match(/^#(\/docs(?:\/[\w-]+)?)(?:#(.*))?$/);
  return { path: legacy?.[1] ?? (location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/'), anchor: legacy?.[2] ?? location.hash.slice(1) };
}

export function normalizeLegacyRoute() {
  if (!location.hash.startsWith('#/docs') && !location.pathname.endsWith('/index.html') && !(location.pathname.length > 1 && location.pathname.endsWith('/'))) return;
  const route = currentRoute();
  if (knownPaths.includes(route.path)) history.replaceState(history.state, '', route.path + location.search + (route.anchor ? `#${route.anchor}` : ''));
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
      let id = destination.hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* Preserve malformed anchors. */ }
      if (id) document.getElementById(id)?.scrollIntoView(); else window.scrollTo({ top: 0 });
    });
  } else {
    saveScrollPosition();
    history.pushState(null, '', destination.pathname + destination.search + destination.hash);
  }
  window.dispatchEvent(new Event(navigationEvent));
}
