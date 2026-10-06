import { useEffect, useRef, useState } from 'react';
import { SiteNav } from './components/SiteNav';
import { HeroStage } from './stage/HeroStage';
import { Ending } from './components/Ending';
import { SiteFooter } from './components/SiteFooter';
import { DocsPage } from './components/DocsPage';
import { ReleaseProvider } from './releases';
import { currentRoute, knownPaths, navigationEvent, normalizeLegacyRoute, navigateTo, saveScrollPosition } from './routing';
import { updateSeo } from './seo';

export function App({ initialPath = '/' }: { initialPath?: string }) {
  const [route, setRoute] = useState(() => currentRoute(initialPath));
  const scrollRestore = useRef<{ x: number; y: number } | null>(null);
  const docs = route.path.startsWith('/docs');
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
    let scrollTimer: number;
    const onScroll = () => { window.clearTimeout(scrollTimer); scrollTimer = window.setTimeout(saveScrollPosition, 160); };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
      const target = new URL(anchor.href, location.href);
      const path = target.pathname.replace(/\/+$/, '') || '/';
      if (target.origin !== location.origin || !knownPaths.includes(path)) return;
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
  useEffect(() => {
    const restore = scrollRestore.current;
    scrollRestore.current = null;
    if (docs && !restore) return;
    const frame = requestAnimationFrame(() => {
      if (restore) { window.scrollTo(restore.x, restore.y); return; }
      if (route.anchor) {
        let id = route.anchor;
        try { id = decodeURIComponent(id); } catch { /* Preserve malformed anchors. */ }
        document.getElementById(id)?.scrollIntoView();
      } else window.scrollTo({ top: 0 });
    });
    return () => cancelAnimationFrame(frame);
  }, [docs, route]);
  return <ReleaseProvider><div id="top">
    <SiteNav />
    <main>{docs ? <DocsPage path={route.path} anchor={route.anchor} /> : <><HeroStage /><Ending /></>}</main>
    <SiteFooter />
  </div></ReleaseProvider>;
}
