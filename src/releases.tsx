import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { productVersion } from './site';
import { currentRoute, navigationEvent } from './routing';
import { useMobileLayout } from './useMobileLayout';
import { channelReleases, type Release } from './releasePolicy';
export type { Release } from './releasePolicy';

type ReleaseState = { release: Release | null; testRelease: Release | null; loading: boolean };
const emptyRelease = { release: null, testRelease: null };
const ReleaseContext = createContext<ReleaseState>({ ...emptyRelease, loading: true });
const sessionId = Math.floor(Date.now() / 1000);

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const mobile = useMobileLayout();
  const [state, setState] = useState<ReleaseState>({ ...emptyRelease, loading: true });
  useEffect(() => {
    if (mobile) { setState({ ...emptyRelease, loading: false }); return; }
    setState({ ...emptyRelease, loading: true });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    let active = true;
    void (async () => {
      const results = await Promise.allSettled((['stable', 'test'] as const).map(async channel => {
        const response = await fetch(`/api/releases/${channel}`, { signal: controller.signal });
        if (response.status === 404) return null;
        if (!response.ok) throw Error('版本信息暂不可用');
        return response.json() as Promise<unknown>;
      }));
      const values = results.map(result => result.status === 'fulfilled' ? result.value : null);
      if (active) setState({ ...channelReleases(values[0], values[1]), loading: false });
    })().catch(() => { if (active) setState({ ...emptyRelease, loading: false }); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; controller.abort(); window.clearTimeout(timer); };
  }, [mobile]);
  return <ReleaseContext.Provider value={state}>{children}</ReleaseContext.Provider>;
}
export function useRelease() { return useContext(ReleaseContext); }

export function recordEvent(event: 'page_view' | 'download_click', release: Release | null) {
  try {
    const clientId = localStorage.getItem('sleepy-analytics-id') || crypto.randomUUID();
    localStorage.setItem('sleepy-analytics-id', clientId);
    const route = currentRoute().path;
    void fetch('/api/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ event, clientId, version: release?.version ?? productVersion, channel: release?.channel ?? 'stable',
        platform: 'web', sessionId, pagePath: route }),
    }).catch(() => {});
  } catch { /* 浏览器禁用存储时，不影响页面和下载。 */ }
}

export function DownloadButton({ className, label }: { className?: string; label?: string }) {
  const { release, loading } = useRelease();
  const mobile = useMobileLayout();
  if (mobile) return null;
  if (!release) return <button className={`${className ?? ''} desktop-download`} type="button" disabled
    title={loading ? undefined : '暂未获取到可用安装包信息'}>
    {loading ? '获取下载信息…' : '下载暂不可用'}
  </button>;
  return <a className={`${className ?? ''} desktop-download`} href={release.url} onClick={() => recordEvent('download_click', release)}>
    下载 Windows 正式版{label?.includes('↗') ? ' ↗' : ''}
  </a>;
}

/** 官网匿名访问统计，无页面设置入口。 */
export function WebsiteAnalytics() {
  const { release, loading } = useRelease();
  useEffect(() => {
    if (loading) return;
    let lastPath = '';
    const onRoute = () => {
      const path = currentRoute().path;
      if (path === lastPath) return;
      lastPath = path;
      recordEvent('page_view', release);
    };
    onRoute();
    window.addEventListener('hashchange', onRoute);
    window.addEventListener('popstate', onRoute);
    window.addEventListener(navigationEvent, onRoute);
    return () => {
      window.removeEventListener('hashchange', onRoute);
      window.removeEventListener('popstate', onRoute);
      window.removeEventListener(navigationEvent, onRoute);
    };
  }, [loading, release]);
  return null;
}
