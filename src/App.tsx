import { useEffect, useRef, useState } from 'react';
import { SiteNav } from './components/SiteNav';
import { HeroStage } from './stage/HeroStage';
import { Ending } from './components/Ending';
import { SiteFooter } from './components/SiteFooter';
import { DocsPage } from './components/DocsPage';
import { NotFoundPage } from './components/NotFoundPage';
import { ReleaseProvider } from './releases';
import { currentRoute, isDocsPath, knownPaths, navigationEvent, normalizeLegacyRoute, navigateTo, resolveAnchorTarget, saveScrollPosition } from './routing';
import { updateSeo } from './seo';

export function App({ initialPath = '/' }: { initialPath?: string }) {
  const [route, setRoute] = useState(() => currentRoute(initialPath));
  const scrollRestore = useRef<{ x: number; y: number } | null>(null);
  const docs = isDocsPath(route.path);
  useEffect(() => {
    const update = (event?: Event) => {
      normalizeLegacyRoute();
      const next = currentRoute();
      setRoute(previous => {
        if (previous.path === next.path && previous.anchor === next.anchor) return previous;
        if (event?.type === 'popstate') scrollRestore.current = history.state?.sleepyScroll ?? null;
        return next;
      });
    };
    let scrollTimer = 0;
    const onScroll = () => { window.clearTimeout(scrollTimer); scrollTimer = window.setTimeout(saveScrollPosition, 160); };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
      const target = new URL(anchor.href, location.href);
      const path = target.pathname.replace(/\/+$/, '') || '/';
      if (target.origin !== location.origin) return;
      // /docs 前缀全部走站内路由（未知文档页由 DocsPage 显示未找到），其余只拦已知页。
      if (!knownPaths.includes(path) && !isDocsPath(path)) return;
      event.preventDefault();
      navigateTo(path + target.search + target.hash);
    };
    update();
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    window.addEventListener(navigationEvent, update);
    document.addEventListener('click', onClick);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
      window.removeEventListener(navigationEvent, update);
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(scrollTimer);
    };
  }, []);
  useEffect(() => { updateSeo(route.path); }, [route.path]);
  // 滚动统一在这里处理（DocsPage 不再各自抢滚动）：优先恢复历史位置，
  // 其次跳锚点（小写兜底），否则回页顶。
  useEffect(() => {
    const restore = scrollRestore.current;
    scrollRestore.current = null;
    const frame = requestAnimationFrame(() => {
      if (restore) { window.scrollTo(restore.x, restore.y); return; }
      if (route.anchor) {
        resolveAnchorTarget(route.anchor)?.scrollIntoView();
      } else window.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [route]);
  return <ReleaseProvider>{docs ? (
    <DocsPage path={route.path} />
  ) : route.path === '/' ? (
    <div id="top">
      <SiteNav />
      <main><HeroStage /><Ending /></main>
      <SiteFooter />
    </div>
  ) : (
    <NotFoundPage />
  )}</ReleaseProvider>;
}
