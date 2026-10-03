import { useEffect, useState, type AnchorHTMLAttributes } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { docEntries } from '../content/docs';
import { repoUrl } from '../site';

/**
 * 站内文档页：hash 路由 #/docs 列表，#/docs/<key> 正文。
 * 与主仓库 docs/ 同步的 Markdown 渲染视图；文档内相对链接改写为
 * 站内文档路由或 GitHub 绝对地址。
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

  const doc = docEntries.find((d) => d.key === key);

  useEffect(() => {
    if (anchor) {
      requestAnimationFrame(() => document.getElementById(decodeURIComponent(anchor))?.scrollIntoView());
    } else window.scrollTo({ top: 0 });
  }, [key, anchor]);

  const proseLink = ({ node: _node, href, children, ...rest }: LinkProps) => {
    if (typeof href !== 'string') return <a {...rest}>{children}</a>;
    const target = rewriteLink(href, key ?? '');
    return (
      <a
        {...rest}
        href={target.href}
        {...(target.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {children}
      </a>
    );
  };

  return (
    <div className="docs-page">
      <aside className="docs-side">
        <div className="docs-side__title">文档</div>
        <nav className="docs-side__list">
          {docEntries.map((d) => (
            <a
              key={d.key}
              className={`docs-side__link ${d.key === key ? 'is-active' : ''}`}
              href={`#/docs/${d.key}`}
            >
              {d.title}
            </a>
          ))}
        </nav>
        <a className="docs-side__repo" href={repoUrl} target="_blank" rel="noreferrer">
          GitHub 仓库 ↗
        </a>
      </aside>
      <article className="docs-main">
        {doc ? (
          <>
            <a className="docs-back" href="#/docs">← 全部文档</a>
            <h1 className="docs-main__title">{doc.title}</h1>
            <div className="docs-prose">
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{ a: proseLink, h1: () => null, h2: headingOf('h2'), h3: headingOf('h3') }}
              >
                {doc.source}
              </Markdown>
            </div>
          </>
        ) : (
          <>
            <h1 className="docs-main__title">文档</h1>
            <p className="docs-main__lead">第一次使用，先看使用说明。遇到问题，可以直接查常见问题。</p>
            <div className="docs-index">
              {docEntries.map((d) => (
                <a key={d.key} className="docs-index__item" href={`#/docs/${d.key}`}>
                  <b>{d.title}</b>
                  <span>{d.description}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
