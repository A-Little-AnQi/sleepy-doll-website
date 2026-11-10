import { useEffect, useState } from 'react';

/**
 * 文档站独立的深浅外观：system（默认，跟随系统）→ light → dark 循环。
 * 只写入 .docsite 容器的 data-docs-theme 与 localStorage，不改用户
 * 浏览器/系统偏好，不影响首页。
 *
 * 另外在文档挂载期间把 html/body 的 inline 画布背景同步为 .docsite
 * 实际渲染的 --page（跟随主题与系统变化），避免深色下滚动到边界时
 * 露出 body 的浅色边；卸载时精确还原之前的 inline 值。
 */

export type DocsTheme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'sleepy-docs-theme';
const CYCLE: DocsTheme[] = ['system', 'light', 'dark'];

export const docsThemeLabel = (theme: DocsTheme) =>
  theme === 'system' ? '跟随系统' : theme === 'light' ? '浅色' : '深色';

/** storage 可能被禁用/写满（隐私模式等），读写失败时退回默认行为。 */
function readStoredTheme(): DocsTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  } catch {
    return 'system';
  }
}

function writeStoredTheme(theme: DocsTheme) {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch { /* 忽略：外观偏好无法持久化时仅本次会话生效 */ }
}

export function useDocsTheme(): [DocsTheme, () => void] {
  const [theme, setTheme] = useState<DocsTheme>(readStoredTheme);
  useEffect(() => { writeStoredTheme(theme); }, [theme]);
  const cycle = () => setTheme(current => CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]);
  return [theme, cycle];
}

/** html/body 画布背景随 docsite 实际 --page 同步；system 模式监听系统深浅切换。 */
export function useDocsCanvasSync(theme: DocsTheme) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const apply = () => {
      const site = document.querySelector('.docsite');
      if (!site) return;
      const background = getComputedStyle(site).backgroundColor;
      html.style.background = background;
      body.style.background = background;
    };
    apply();
    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const onSchemeChange = () => apply();
    if (theme === 'system') scheme.addEventListener('change', onSchemeChange);
    return () => {
      scheme.removeEventListener('change', onSchemeChange);
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
    };
  }, [theme]);
}

/** 搜索快捷键提示：Mac 显示 ⌘K，其他平台 Ctrl K（服务端渲染统一输出 Ctrl）。 */
export function useSearchHotkeyLabel(): string {
  const [label, setLabel] = useState('Ctrl K');
  useEffect(() => {
    if (/mac|iphone|ipad/i.test(navigator.userAgent)) setLabel('⌘ K');
  }, []);
  return label;
}
