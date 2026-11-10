import { useEffect, useRef, useState, type AnchorHTMLAttributes } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { docPages, docByPath, resolveDocLink, type DocHeading } from '../content/docs';
import { docsGroups } from '../content/docs-meta';
import { BrandIcon } from './brand/BrandIcon';
import { Wordmark } from './brand/Wordmark';
import { SiteFooter } from './SiteFooter';
import { SearchDialog } from './docs/SearchDialog';
import { docsThemeLabel, useDocsTheme, useDocsCanvasSync, useSearchHotkeyLabel, type DocsTheme } from './docs/theme';
import { useScrollLock } from './docs/scroll-lock';
import {
  ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, CloseIcon, EditIcon, GithubIcon,
  MenuIcon, MoonIcon, SearchIcon, SunIcon, ThemeAutoIcon,
} from './docs/icons';
import '../styles/docs.css';

/**
 * 文档站页面：轻量页头（品牌 + 搜索 + GitHub + 独立深浅外观）+
 * 左侧分组导航 / 中间连续 Markdown 正文 / 右侧本页目录，复用 SiteFooter。
 * 整篇 .md 顺序渲染为一个 article；窄屏下导航收进抽屉、目录折叠。
 * 滚动恢复与锚点定位统一由 App 处理，这里只负责 scrollspy 高亮。
 */

const GITHUB_APP_URL = 'https://github.com/Pudding-Player/Pudding';
const EDIT_BASE = 'https://github.com/A-Little-AnQi/sleepy-doll-website/edit/main/src/content/docs/';

/** 与 docs.css 窄屏抽屉断点一致：窄屏布局或触屏宽屏都走抽屉导航。 */
const DRAWER_QUERY = '(max-width: 1080px), (max-width: 1280px) and (hover: none) and (pointer: coarse)';

const ThemeIcon = ({ theme }: { theme: DocsTheme }) =>
  theme === 'light' ? <SunIcon /> : theme === 'dark' ? <MoonIcon /> : <ThemeAutoIcon />;

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown };

function TocList({ headings, active, basePath, onNavigate }: {
  headings: DocHeading[];
  active: string;
  basePath: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="docsite-toc__list">
      {headings.map(heading => (
        <li key={heading.id} className="docsite-toc__item">
          <a
            href={`${basePath}#${heading.id}`}
            className={`docsite-toc__link ${heading.depth === 3 ? 'docsite-toc__link--sub' : ''} ${active === heading.id ? 'is-active' : ''}`}
            aria-current={active === heading.id ? 'true' : undefined}
            onClick={onNavigate}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function DocsPage({ path }: { path: string }) {
  const doc = docByPath(path);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const [theme, cycleTheme] = useDocsTheme();
  useDocsCanvasSync(theme);
  const hotkey = useSearchHotkeyLabel();
  // 渲染期同步的实时值：抽屉 cleanup（passive 阶段）晚于搜索框的 layout 焦点，
  // 用它判断抽屉是不是被新开的搜索替换，被替换时不再把焦点抢回菜单按钮。
  const searchOpenRef = useRef(false);
  searchOpenRef.current = searchOpen;
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const index = doc ? docPages.findIndex(page => page.key === doc.key) : -1;
  const prev = index > 0 ? docPages[index - 1] : null;
  const next = index >= 0 && index < docPages.length - 1 ? docPages[index + 1] : null;

  // 打开搜索时收起抽屉与行内目录，避免两个浮层同时持锁或抢焦点。
  const openSearch = () => {
    setSearchOpen(true);
    setDrawerOpen(false);
    setTocOpen(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    searchBtnRef.current?.focus({ preventScroll: true });
  };

  // 窄屏抽屉：Escape/点外关闭、焦点进抽屉并圈定（含内部关闭按钮），
  // 共享滚动锁；关闭后焦点回菜单按钮。
  useEffect(() => {
    if (!drawerOpen) return;
    const firstLink = sidebarRef.current?.querySelector<HTMLElement>('a[href],button');
    firstLink?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setDrawerOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusables = [...(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [])];
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (!searchOpenRef.current) menuBtnRef.current?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);

  useScrollLock(drawerOpen);

  // 切回桌面宽度时自动收起抽屉（matchMedia 只随布局宽度/指针变化，
  // 虚拟键盘引起的高度变化不会触发）。
  useEffect(() => {
    const drawerLayout = window.matchMedia(DRAWER_QUERY);
    const onChange = (event: MediaQueryListEvent) => { if (!event.matches) setDrawerOpen(false); };
    drawerLayout.addEventListener('change', onChange);
    return () => drawerLayout.removeEventListener('change', onChange);
  }, []);

  // 切换文章、前进或后退时收起遗留的搜索/抽屉/行内目录。
  useEffect(() => {
    setSearchOpen(false);
    setDrawerOpen(false);
    setTocOpen(false);
  }, [path]);

  // 滚动高亮：取最后一个越过顶线的 h2/h3；页面贴底时选最后一个。只更新高亮，不写地址。
  useEffect(() => {
    if (!doc) return;
    const headings = [...(articleRef.current?.querySelectorAll<HTMLElement>('h2,h3') ?? [])];
    if (!headings.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = '';
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 110) current = heading.id;
        else break;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        current = headings[headings.length - 1].id;
      }
      setActiveHeading(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [doc?.key]);

  const proseLink = ({ node: _node, href, children, ...rest }: LinkProps) => {
    if (typeof href !== 'string' || !doc) return <a {...rest}>{children}</a>;
    const target = resolveDocLink(href, doc.path);
    return (
      <a {...rest} href={target.href} {...(target.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  };

  return (
    <div className="docsite" data-docs-theme={theme}>
      <header className="docsite-header">
        <div className="docsite-header__inner">
          <a className="docsite-header__brand" href="/" aria-label="返回 Pudding 首页">
            <BrandIcon className="docsite-header__mark" />
            <Wordmark className="docsite-header__name" />
          </a>
          <button
            ref={searchBtnRef}
            type="button"
            className="docsite-header__search"
            aria-label="搜索文档"
            onClick={openSearch}
          >
            <SearchIcon />
            <span className="docsite-header__search-label">搜索文档</span>
            <span className="docsite-header__search-kbd" aria-hidden="true">{hotkey}</span>
          </button>
          <div className="docsite-header__actions">
            <a
              className="docsite-icon-btn"
              href={GITHUB_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pudding 软件源码仓库（GitHub）"
              title="Pudding 软件源码仓库（GitHub）"
            >
              <GithubIcon />
            </a>
            <button
              type="button"
              className="docsite-icon-btn"
              onClick={cycleTheme}
              aria-label={`文档外观：${docsThemeLabel(theme)}，点击切换`}
              title={`文档外观：${docsThemeLabel(theme)}`}
            >
              <ThemeIcon theme={theme} />
            </button>
            <button
              ref={menuBtnRef}
              type="button"
              className="docsite-icon-btn docsite-menu-btn"
              aria-expanded={drawerOpen}
              aria-controls="docsite-nav"
              aria-label={drawerOpen ? '关闭文档菜单' : '打开文档菜单'}
              onClick={() => setDrawerOpen(open => !open)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      <div className="docsite-body">
        {drawerOpen && <div className="docsite-drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
        <aside
          ref={sidebarRef}
          id="docsite-nav"
          className={`docsite-sidebar ${drawerOpen ? 'is-open' : ''}`}
          aria-label={drawerOpen ? '文档菜单' : '文档导航'}
          {...(drawerOpen ? { role: 'dialog' as const, 'aria-modal': 'true' as const } : {})}
        >
          <div className="docsite-drawer-head">
            <span className="docsite-drawer-head__title">文档菜单</span>
            <button
              type="button"
              className="docsite-icon-btn docsite-drawer-head__close"
              aria-label="关闭文档菜单"
              onClick={() => setDrawerOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          {docsGroups.map(group => (
            <div className="docsite-nav__group" key={group.id}>
              <div className="docsite-nav__group-title">{group.label}</div>
              <ul className="docsite-nav__list">
                {docPages.filter(page => page.group === group.id).map(page => (
                  <li key={page.key}>
                    <a
                      className={`docsite-nav__link ${page.path === path ? 'is-active' : ''}`}
                      href={page.path}
                      aria-current={page.path === path ? 'page' : undefined}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {page.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="docsite-main" id="docsite-main">
          {doc ? (
            <>
              <nav className="docsite-breadcrumb" aria-label="面包屑">
                <a href="/">首页</a>
                <span aria-hidden="true">/</span>
                {doc.path === '/docs' ? (
                  <span aria-current="page">帮助文档</span>
                ) : (
                  <>
                    <a href="/docs">帮助文档</a>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{doc.title}</span>
                  </>
                )}
              </nav>

              {doc.headings.length > 0 && (
                <div className="docsite-toc-inline">
                  <button
                    type="button"
                    className="docsite-toc-inline__toggle"
                    aria-expanded={tocOpen}
                    aria-controls="docsite-toc-inline-list"
                    onClick={() => setTocOpen(open => !open)}
                  >
                    本页目录
                    <ChevronDownIcon />
                  </button>
                  {tocOpen && (
                    <div id="docsite-toc-inline-list">
                      <TocList headings={doc.headings} active={activeHeading} basePath={doc.path} onNavigate={() => setTocOpen(false)} />
                    </div>
                  )}
                </div>
              )}

              <article ref={articleRef} className="docsite-article" key={doc.key}>
                <h1 className="docsite-article__title">{doc.title}</h1>
                <div className="docsite-prose">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug]}
                    components={{ h1: () => null, a: proseLink }}
                  >
                    {doc.source}
                  </Markdown>
                </div>
                <div className="docsite-article__meta">
                  <a href={EDIT_BASE + doc.file} target="_blank" rel="noopener noreferrer">
                    <EditIcon />
                    在 GitHub 上编辑此页
                  </a>
                </div>
              </article>

              <nav className="docsite-pager" aria-label="前后篇">
                {prev ? (
                  <a className="docsite-pager__link" href={prev.path} rel="prev">
                    <span className="docsite-pager__hint">上一篇 · {docsGroups.find(group => group.id === prev.group)?.label}</span>
                    <span className="docsite-pager__title"><ArrowLeftIcon /> {prev.title}</span>
                  </a>
                ) : <span className="docsite-pager__placeholder" aria-hidden="true" />}
                {next ? (
                  <a className="docsite-pager__link docsite-pager__link--next" href={next.path} rel="next">
                    <span className="docsite-pager__hint">下一篇 · {docsGroups.find(group => group.id === next.group)?.label}</span>
                    <span className="docsite-pager__title">{next.title} <ArrowRightIcon /></span>
                  </a>
                ) : <span className="docsite-pager__placeholder" aria-hidden="true" />}
              </nav>
            </>
          ) : (
            <div className="docsite-notfound">
              <h1 className="docsite-notfound__title">文档未找到</h1>
              <p>
                这个地址没有对应的文档，可能已移动或从未存在。可以回到文档总览，
                从目录里找到需要的内容；软件里的帮助也可以从「关于」页进入。
              </p>
              <a href="/docs">返回文档中心</a>
            </div>
          )}
        </main>

        {doc && doc.headings.length > 0 && (
          <aside className="docsite-toc" aria-label="本页目录">
            <div className="docsite-toc__title">本页目录</div>
            <TocList headings={doc.headings} active={activeHeading} basePath={doc.path} />
          </aside>
        )}
      </div>

      <SiteFooter />
      {searchOpen && <SearchDialog onClose={closeSearch} />}
    </div>
  );
}
