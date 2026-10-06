import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { productVersion } from './site';
import { currentRoute, navigationEvent } from './routing';
import { useMobileLayout } from './useMobileLayout';

export interface Release {
  version: string;
  channel: 'test' | 'stable';
  url: string;
  size: number;
  sha256: string;
  notes: string;
  publishedAt: string;
}
const ReleaseContext = createContext<{ release: Release | null; loading: boolean }>({ release: null, loading: true });
const sessionId = Math.floor(Date.now() / 1000);

function valid(value: unknown): value is Release {
  const item = value as Partial<Release>;
  if (!item || typeof item.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(item.version)
    || typeof item.url !== 'string' || !Number.isSafeInteger(item.size) || (item.size ?? 0) <= 0
    || typeof item.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(item.sha256)
    || !['test', 'stable'].includes(item.channel ?? '')) return false;
  try {
    const url = new URL(item.url);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && url.hostname === 'sleepy-doll-download.restless-nh3.com'
      && url.pathname === `/releases/${item.version}/Sleepy-Doll-${item.version}-setup.exe`;
  } catch { return false; }
}

export function ReleaseProvider({ children }: { children: ReactNode }) {
  const mobile = useMobileLayout();
  const [state, setState] = useState<{ release: Release | null; loading: boolean }>({ release: null, loading: true });
  useEffect(() => {
    if (mobile) { setState({ release: null, loading: false }); return; }
    setState({ release: null, loading: true });
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    let active = true;
    void (async () => {
      for (const channel of ['stable', 'test']) {
        const response = await fetch(`/api/releases/${channel}`, { signal: controller.signal });
        if (response.status === 404) continue;
        if (!response.ok) throw Error('版本信息暂不可用');
        const value: unknown = await response.json();
        if (!valid(value) || value.channel !== channel) throw Error('版本信息格式不正确');
        if (value.version.localeCompare(productVersion, 'en', { numeric: true }) < 0) continue;
        if (active) setState({ release: value, loading: false });
        return;
      }
      if (active) setState({ release: null, loading: false });
    })().catch(() => { if (active) setState({ release: null, loading: false }); })
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
      body: JSON.stringify({ event, clientId, version: release?.version ?? productVersion, channel: release?.channel ?? 'test',
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
    {label ?? '下载 Windows 版'}
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
