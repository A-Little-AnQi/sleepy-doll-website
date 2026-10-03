import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { releasesUrl } from './site';

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
  const [state, setState] = useState<{ release: Release | null; loading: boolean }>({ release: null, loading: true });
  useEffect(() => {
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
        if (active) setState({ release: value, loading: false });
        return;
      }
      if (active) setState({ release: null, loading: false });
    })().catch(() => { if (active) setState({ release: null, loading: false }); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; controller.abort(); window.clearTimeout(timer); };
  }, []);
  return <ReleaseContext.Provider value={state}>{children}</ReleaseContext.Provider>;
}
export function useRelease() { return useContext(ReleaseContext); }

function consentEnabled() {
  try { return localStorage.getItem('sleepy-analytics-consent') === 'yes'; } catch { return false; }
}

export function recordEvent(event: 'page_view' | 'download_click', release: Release | null) {
  if (!consentEnabled() || !release) return;
  try {
    const clientId = localStorage.getItem('sleepy-analytics-id') || crypto.randomUUID();
    localStorage.setItem('sleepy-analytics-id', clientId);
    const route = location.hash.startsWith('#/docs') ? location.hash.slice(1).split('#')[0] : '/';
    void fetch('/api/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
      body: JSON.stringify({ event, clientId, version: release.version, channel: release.channel,
        platform: 'web', sessionId, pagePath: route }),
    }).catch(() => {});
  } catch { /* 浏览器禁用存储时，不影响页面和下载。 */ }
}

export function DownloadButton({ className, label }: { className?: string; label?: string }) {
  const { release, loading } = useRelease();
  return <a className={className} href={release?.url ?? releasesUrl} onClick={() => recordEvent('download_click', release)}>
    {loading ? '获取下载信息…' : release ? (label ?? `下载${release.channel === 'test' ? '测试版' : 'Windows 版'}`) : '前往 GitHub 下载 ↗'}
  </a>;
}

export function AnalyticsPreference() {
  const { release } = useRelease();
  const [enabled, setEnabled] = useState(consentEnabled);
  useEffect(() => {
    if (!enabled || !release) return;
    recordEvent('page_view', release);
    const onHash = () => recordEvent('page_view', release);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [enabled, release]);
  return <button className="footer-analytics" type="button" aria-pressed={enabled}
    title="开启后使用 Google Analytics 统计页面访问和下载点击，可随时关闭。"
    onClick={() => {
      try { const next = !enabled; localStorage.setItem('sleepy-analytics-consent', next ? 'yes' : 'no'); setEnabled(next); }
      catch { /* 保持统计关闭。 */ }
    }}>使用统计：{enabled ? '已开启' : '已关闭'}</button>;
}
