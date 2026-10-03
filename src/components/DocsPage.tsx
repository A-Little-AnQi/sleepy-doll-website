import { useEffect, useState, type AnchorHTMLAttributes } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { docEntries } from '../content/docs';
import { repoUrl } from '../site';

/**
 * 站内文档页：hash 路由 #/docs 列表，#/docs/<key> 正文。
 * 文档源在本项目 content/docs/，相对链接改写为站内路由。
 */

const DOC_KEYS = new Set(docEntries.map((d) => d.key));

/** 把文档源里的相对链接改写为站内 hash 或 GitHub 绝对地址。 */
function rewriteLink(href: string, currentKey: string): { href: string; external: boolean } {
  if (href.startsWith('#') && !href.startsWith('#/')) {
    return { href: `#/docs/${currentKey}${href}`, external: false };
  }
  const docMatch = href.match(/(?:\.\.\/|\.\/)?(?:bgi\/)?([\w-]+)\.md(?:#[^#]*)?$/);
  if (docMatch && DOC_KEYS.has(docMatch[1])) {
    return { href: `#/docs/${docMatch[1]}${href.includes('#') ? href.slice(href.indexOf('#')) : ''}`, external: false };
  }
  if (href.startsWith('./') || href.startsWith('../')) {
    // 相对链接基于当前文档在仓库 docs/（或 docs/bgi/）下的位置解析。
    const base = currentKey === 'host-contracts' ? 'docs/bgi/' : 'docs/';
    const resolved = new URL(href, `http://x/${base}`).pathname.replace(/^\//, '');
    return { href: `${repoUrl}/blob/main/${resolved}`, external: true };
  }
  return { href, external: /^https?:/.test(href) };
}

function currentDocKey(): string | null {
  const match = location.hash.match(/^#\/docs\/([\w-]+)(?:#.*)?$/);
  return match ? match[1] : null;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { node?: unknown };

/** 提取 hast 节点纯文本。 */
function textOf(node: unknown): string {
  const n = node as { type?: string; value?: string; children?: unknown[] } | undefined;
  if (!n) return '';
  if (n.type === 'text') return n.value ?? '';
  return (n.children ?? []).map(textOf).join('');
}

const slugify = (text: string) => text.trim().replace(/\s+/g, '-');

type HeadingProps = AnchorHTMLAttributes<HTMLHeadingElement> & { node?: unknown };

/** 标题注入目录锚点 id（空格转连字符，与文档内目录链接一致）。 */
function headingOf(tag: 'h2' | 'h3') {
  return function DocsHeading({ node, children, ...rest }: HeadingProps) {
    const H = tag;
    return (
      <H id={slugify(textOf(node))} {...rest}>
        {children}
      </H>
    );
  };
}

interface Section { title: string; body: string }
function sectionsOf(source: string, level: 2 | 3) {
  const pattern = new RegExp(`^${"#".repeat(level)} (.+)$`, "gm");
  const headings = [...source.matchAll(pattern)];
  return {
    intro: source.slice(0, headings[0]?.index ?? source.length),
    sections: headings.map((match, index): Section => ({
      title: match[1],
      body: source.slice(match.index! + match[0].length, headings[index + 1]?.index ?? source.length),
    })),
  };
}

export function DocsPage() {
  const [key, setKey] = useState<string | null>(currentDocKey());
  const [anchor, setAnchor] = useState(location.hash.split('#').slice(2).join('#'));
  useEffect(() => {
    const onHash = () => {
      setKey(currentDocKey());
      setAnchor(location.hash.split('#').slice(2).join('#'));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const doc = docEntries.find(d => d.key === key);
  const content = sectionsOf(doc?.source ?? '', 2);
  useEffect(() => {
    document.title = doc ? `${doc.title} · Sleepy Doll` : '文档 · Sleepy Doll';
    return () => { document.title = 'Sleepy Doll / 发条枢'; };
  }, [doc]);
  useEffect(() => {
    if (!anchor) { window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    const frame = requestAnimationFrame(() => {
      let id = anchor;
      try { id = decodeURIComponent(anchor); } catch { /* 无效编码保持原样。 */ }
      document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [key, anchor]);

  const proseLink = ({ node: _node, href, children, ...rest }: LinkProps) => {
    if (typeof href !== 'string') return <a {...rest}>{children}</a>;
    const target = rewriteLink(href, key ?? '');
    return <a {...rest} href={target.href} {...(target.external ? { target: '_blank', rel: 'noreferrer' } : {})}>{children}</a>;
  };
  const markdown = (source: string) => <Markdown remarkPlugins={[remarkGfm]}
    components={{ a: proseLink, h1: () => null, h2: headingOf('h2'), h3: headingOf('h3') }}>{source}</Markdown>;

  return (
    <div className={`docs-page ${doc ? '' : 'docs-page--index'}`}>
      <aside className="docs-side">
        <div className="docs-side__title">文档</div>
        <nav className="docs-side__list" aria-label="文档导航">
          {docEntries.map(d => <a key={d.key} className={`docs-side__link ${d.key === key ? 'is-active' : ''}`}
            aria-current={d.key === key ? 'page' : undefined} href={`#/docs/${d.key}`}>{d.title}</a>)}
        </nav>
        <a className="docs-side__repo" href={repoUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
      </aside>
      <article className={`docs-main docs-main--${key ?? 'index'}`}>
        {doc ? <>
          <a className="docs-back" href="#/docs">← 全部文档</a>
          <h1 className="docs-main__title">{doc.title}</h1>
          <div className="docs-prose">
            <div className="docs-intro">{markdown(content.intro)}</div>
            <div className={`doc-section-grid ${key === 'guide' || key === 'faq' ? '' : 'doc-section-grid--single'}`}>
              {content.sections.map((section, index) => {
                const steps = key === 'guide' && index === 0 ? sectionsOf(section.body, 3) : null;
                return <section className={`doc-section ${steps ? 'doc-section--steps' : ''}`} key={section.title}>
                  <h2 id={slugify(section.title)}>{section.title}</h2>
                  {steps ? <>
                    {markdown(steps.intro)}
                    <ol className="doc-steps">{steps.sections.map(step => <li key={step.title}>
                      <h3 id={slugify(step.title)}>{step.title}</h3>{markdown(step.body)}
                    </li>)}</ol>
                  </> : markdown(section.body)}
                </section>;
              })}
            </div>
          </div>
        </> : <>
          <h1 className="docs-main__title">文档</h1>
          <p className="docs-main__lead">上手、排错和版本记录。</p>
          <div className="docs-index">{docEntries.map(d => <a key={d.key} className="docs-index__item" href={`#/docs/${d.key}`}>
            <b>{d.title}</b><span>{d.description}</span>
          </a>)}</div>
        </>}
      </article>
      {doc && <aside className="docs-toc">
        <div className="docs-toc__title">本页内容</div>
        <nav aria-label="本页内容">{content.sections.map(section => <a key={section.title}
          href={`#/docs/${key}#${slugify(section.title)}`}>{section.title}</a>)}</nav>
      </aside>}
    </div>
  );
}
