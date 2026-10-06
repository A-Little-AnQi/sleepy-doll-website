import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { discordUrl, navEntries, qqUrl, type NavEntry } from '../site';
import { BrandMark } from './BrandMark';
import { navigationEvent, navigateTo, saveScrollPosition } from '../routing';
import { useMobileLayout } from '../useMobileLayout';

/**
 * 固定导航：74px→62px 滚动收缩（0.28s）；底部 1px 黄色全页滚动进度线。
 * 桌面端悬停/聚焦/点击带目录的项时，在导航下方呼出深色页面目录：
 * 顶部为变换原点 scaleY(.82)→1 折线裁切展开，背景同步淡入全屏模糊遮罩，
 * 链接逐项 y=18px 错落进入，悬停右移 16px；离开导航区域或 Escape 关闭。
 * 1080px 以下折叠为全屏深色菜单（opacity + clip-path 自上而下展开）。
 */

const EASE = [0.16, 1, 0.3, 1] as const;

export function SiteNav() {
  const [compact, setCompact] = useState(false);
  const [openDirectory, setOpenDirectory] = useState<NavEntry | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobile = useMobileLayout();
  const headerRef = useRef<HTMLElement>(null);
  const menuEntryRef = useRef(false);
  const menuClosingRef = useRef(false);
  const pendingNavigationRef = useRef<string | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 46, mass: 0.6 });
  const progressScale = useTransform(progress, (v) => v);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    if (menuEntryRef.current && history.state?.sleepyMenu) { if (!menuClosingRef.current) { menuClosingRef.current = true; history.back(); } }
    else menuEntryRef.current = false;
    menuBtnRef.current?.focus({ preventScroll: true });
  };
  const mobileNavigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string, external = false) => {
    if (!mobileOpen) return;
    if (external) { closeMobile(); return; }
    event.preventDefault();
    if (menuEntryRef.current && history.state?.sleepyMenu) {
      pendingNavigationRef.current = href;
      closeMobile();
    } else {
      setMobileOpen(false);
      navigateTo(href);
    }
  };
  useEffect(() => {
    const onPop = () => {
      if (history.state?.sleepyMenu) { menuEntryRef.current = true; setMobileOpen(true); return; }
      if (!menuEntryRef.current) return;
      menuEntryRef.current = false;
      menuClosingRef.current = false;
      setMobileOpen(false);
      menuBtnRef.current?.focus({ preventScroll: true });
      const destination = pendingNavigationRef.current;
      pendingNavigationRef.current = null;
      if (destination) navigateTo(destination);
    };
    const onNavigation = () => { setOpenDirectory(null); setMobileOpen(false); };
    onPop();
    window.addEventListener('popstate', onPop);
    window.addEventListener(navigationEvent, onNavigation);
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener(navigationEvent, onNavigation); };
  }, []);
  useEffect(() => {
    if (!mobile) closeMobile();
    else setOpenDirectory(null);
  }, [mobile]);
  useEffect(() => {
    if (!mobileOpen) return;
    const background = [...(headerRef.current?.parentElement?.querySelectorAll<HTMLElement>('main,footer') ?? [])];
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    firstMobileLinkRef.current?.focus({ preventScroll: true });
    return () => { document.documentElement.style.overflow = htmlOverflow; document.body.style.overflow = bodyOverflow; background.forEach((element, index) => { element.inert = previousInert[index]; }); };
  }, [mobileOpen]);
  useEffect(() => {
    if (!openDirectory && !mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpenDirectory(null); if (mobileOpen) closeMobile(); return; }
      if (!mobileOpen || event.key !== 'Tab') return;
      const links = [...(headerRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? [])]
        .filter(element => element.getClientRects().length && !element.closest('[inert]'));
      const first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openDirectory, mobileOpen]);

  const openFor = (entry: NavEntry) => {
    if (entry.directory) setOpenDirectory(entry);
    else setOpenDirectory(null);
  };

  return (
    <motion.header
      ref={headerRef}
      role={mobileOpen ? 'dialog' : undefined}
      aria-modal={mobileOpen || undefined}
      aria-label={mobileOpen ? '站点导航' : undefined}
      className={`nav ${compact ? 'nav--shrunk' : ''} ${mobileOpen ? 'nav--menu-open' : ''}`}
      animate={{ height: compact ? 62 : 74 }}
      transition={{ duration: 0.28, ease: EASE }}
      onPointerLeave={() => setOpenDirectory(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenDirectory(null);
      }}
    >
      <div className="nav__inner">
        <a className="nav__brand" href="/#top" aria-label="Sleepy Doll 首页" onClick={event => mobileNavigate(event, '/#top')}>
          <BrandMark className="nav__mark" />
          <span className="nav__name">Sleepy Doll</span>
        </a>

        <nav className="nav__links" aria-label="主导航">
          {navEntries.map((entry) => (
            <a
              key={entry.label}
              className={`nav__link ${entry.label === '下载' ? 'desktop-download' : ''} ${entry.directory && openDirectory === entry ? 'is-open' : ''}`}
              href={entry.href}
              aria-haspopup={entry.directory ? 'true' : undefined}
              aria-expanded={entry.directory ? (openDirectory === entry ? 'true' : 'false') : undefined}
              onMouseEnter={() => openFor(entry)}
              onFocus={() => openFor(entry)}
              onClick={() => openFor(entry)}
              {...(entry.external
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
            >
              {entry.label}
            </a>
          ))}
        </nav>

        <div className="nav__right">
          <a className="nav__cta" href={discordUrl} target="_blank" rel="noreferrer">
            Discord
          </a>
          <a className="nav__cta nav__cta--ghost" href={qqUrl} target="_blank" rel="noreferrer">
            QQ
          </a>
          <button
            ref={menuBtnRef}
            type="button"
            className="nav__menu-btn"
            aria-expanded={mobileOpen}
            aria-controls="nav-overlay"
            aria-label={mobileOpen ? '关闭导航菜单' : '打开导航菜单'}
            onClick={() => {
              if (mobileOpen) closeMobile();
              else { saveScrollPosition(); history.pushState({ ...history.state, sleepyMenu: true }, '', location.href); menuEntryRef.current = true; setMobileOpen(true); }
            }}
          >
            <span className="nav__menu-icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>
      <motion.div className="nav__progress" style={{ scaleX: progressScale }} />

      <AnimatePresence>
        {openDirectory?.directory && (
          <>
            <motion.div
              className="directory-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.34, ease: EASE }}
            />
            <motion.div
              className="page-directory"
              style={{ top: compact ? 62 : 74 }}
              initial={{ opacity: 0, scaleY: 0.82 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.82 }}
              transition={{ duration: 0.34, ease: EASE }}
            >
              <div className="page-directory__inner">
                <div className="page-directory__head">
                  <span className="page-directory__title">{openDirectory.directory.title}</span>
                  <span className="page-directory__note">{openDirectory.directory.note}</span>
                </div>
                <div className="directory-links" role="presentation">
                  {openDirectory.directory.items.map((item, index) => (
                    <motion.div
                      key={item.href + item.label}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.34, ease: EASE, delay: 0.08 + index * 0.05 }}
                    >
                      <a
                        href={item.href}
                        onClick={() => setOpenDirectory(null)}
                        {...(item.external
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                      >
                        <span className="directory-links__label">{item.label}</span>
                        {item.note ? <span className="directory-links__note">{item.note}</span> : null}
                        <i aria-hidden="true">{item.external ? '↗' : '→'}</i>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        id="nav-overlay"
        className={`nav-overlay ${mobileOpen ? 'nav-overlay--open' : ''}`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <nav className="nav-overlay__menu" aria-label="站点导航">
          {navEntries.filter(entry => entry.label !== '下载').map((entry, i) => (
            <a
              key={entry.label}
              ref={i === 0 ? firstMobileLinkRef : undefined}
              className="nav-overlay__link"
              href={entry.href}
              onClick={event => mobileNavigate(event, entry.href, entry.external)}
              {...(entry.external
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
            >
              {entry.label}
            </a>
          ))}
          <a
            className="nav-overlay__link nav-overlay__link--cta"
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => closeMobile()}
          >
            Discord 社区 ↗
          </a>
          <a
            className="nav-overlay__link"
            href={qqUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => closeMobile()}
          >
            QQ 交流群 ↗
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
