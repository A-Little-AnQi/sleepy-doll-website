/**
 * 文档内容装配：docs-meta 元数据 + Markdown 源 + 目录与搜索索引。
 *
 * Markdown 源由 Vite import.meta.glob 按目录批量引入，只按 docs-meta
 * 注册的 file 装配；目录里有文件但未注册、或注册的文件缺失都在构建期抛错，
 * 新增文章只需加 MD 文件并在 docs-meta.ts 登记一处。
 *
 * heading 的 id 与正文渲染共用同一套 GitHub slug 规则（github-slugger），
 * 这里按文档顺序对所有 heading（含 h1 占位）取 slug，保证与 rehype-slug
 * 渲染出的 id 完全一致，包括同名 heading 的 -1 去重后缀。
 * 分节与正文提取走 mdast（unified + remark-parse + remark-gfm），
 * 代码块里的 # 不会误判为标题。
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import GithubSlugger from 'github-slugger';
import { docsMeta, type DocMeta } from './docs-meta';

const parseMarkdown = unified().use(remarkParse).use(remarkGfm);

const sources = import.meta.glob('./docs/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export interface DocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** 搜索用的分节：h2/h3 各一段，页首导语 anchor 为页首。 */
export interface DocSection {
  anchor: string;
  title: string;
  text: string;
}

export interface DocPage extends DocMeta {
  source: string;
  headings: DocHeading[];
  sections: DocSection[];
}

type MdNode = { type: string; value?: string; depth?: number; children?: MdNode[] };

/** 拼接节点内的可见文本（含行内代码内容）。 */
function textOf(node: MdNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

/** 遍历根节点的直接子节点，按 heading 切分并累积分节文本。 */
function analyze(source: string): { headings: DocHeading[]; sections: DocSection[] } {
  const slugger = new GithubSlugger();
  const headings: DocHeading[] = [];
  const sections: DocSection[] = [];
  let current: DocSection = { anchor: '', title: '', text: '' };
  const push = () => { if (current.title || current.text.trim()) sections.push(current); };
  for (const node of (parseMarkdown.parse(source) as MdNode).children ?? []) {
    if (node.type === 'heading') {
      const text = textOf(node).replace(/\s+/g, ' ').trim();
      // h1 也参与 slug 序列，占位但不进目录，保证与 rehype-slug 的去重一致。
      const id = slugger.slug(text);
      if (node.depth === 2 || node.depth === 3) {
        headings.push({ id, text, depth: node.depth });
        push();
        // 章节标题只进 section.title（用于展示与评分），不重复拼进正文，
        // 否则片段会以「每月 每月 …」开头。
        current = { anchor: id, title: text, text: '' };
      } else {
        current.text += ` ${text} `;
      }
    } else {
      current.text += ` ${node.type === 'code' ? (node.value ?? '') : textOf(node)} `;
    }
  }
  push();
  return { headings, sections: sections.map(s => ({ ...s, text: s.text.replace(/\s+/g, ' ').trim() })) };
}

const sourcesByFile = new Map(Object.entries(sources).map(([path, source]) => [path.replace(/^.*\//, ''), source]));
const unregistered = [...sourcesByFile.keys()].filter(file => !docsMeta.some(meta => meta.file === file));
const missing = docsMeta.filter(meta => !sourcesByFile.has(meta.file)).map(meta => meta.file);
if (missing.length || unregistered.length) {
  throw Error(`Docs registry mismatch — missing: ${missing.join(', ') || 'none'}; unregistered: ${unregistered.join(', ') || 'none'}`);
}

export const docPages: DocPage[] = docsMeta.map(meta => {
  const source = sourcesByFile.get(meta.file)!;
  const { headings, sections } = analyze(source);
  return { ...meta, source, headings, sections };
});

export const docByPath = (path: string): DocPage | undefined =>
  docPages.find(page => page.path === path);

const docByFileKey = new Map(docPages.map(page => [page.file.replace(/\.md$/, ''), page]));

export interface ResolvedLink {
  href: string;
  external: boolean;
}

/** 把文档里的相对链接改写为站内 canonical 地址；外链原样返回。 */
export function resolveDocLink(href: string, currentPath: string): ResolvedLink {
  if (/^[a-z][\w+.-]*:/i.test(href) || href.startsWith('//')) return { href, external: /^https?:/i.test(href) };
  if (href.startsWith('#')) return { href: `${currentPath}${href}`, external: false };
  const match = href.match(/^(?:\.{0,2}\/)?([\w-]+)\.md(#[^#]*)?$/);
  if (match) {
    const page = docByFileKey.get(match[1]);
    if (page) return { href: page.path + (match[2] ?? ''), external: false };
  }
  return { href, external: false };
}

export interface DocSearchResult {
  pagePath: string;
  pageTitle: string;
  sectionTitle: string;
  anchor: string;
  snippet: string;
  terms: string[];
}

const SEARCH_LIMIT = 12;

/** 本地全文搜索：按词 AND 匹配页标题、节标题与正文，返回带片段的结果。 */
export function searchDocs(query: string): DocSearchResult[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const results: Array<DocSearchResult & { score: number }> = [];
  for (const page of docPages) {
    const title = page.title.toLowerCase();
    const titleHits = terms.filter(term => title.includes(term)).length;
    for (const section of page.sections) {
      const sectionTitle = section.title.toLowerCase();
      const body = section.text.toLowerCase();
      let score = 0;
      let firstAt = -1;
      let matchedAll = true;
      for (const term of terms) {
        const inTitle = sectionTitle.includes(term);
        const at = body.indexOf(term);
        if (!inTitle && at < 0 && !title.includes(term)) { matchedAll = false; break; }
        if (inTitle) score += 3;
        else if (at >= 0) score += 1;
        if (title.includes(term)) score += 2;
        if (at >= 0 && (firstAt < 0 || at < firstAt)) firstAt = at;
      }
      if (!matchedAll) continue;
      const text = section.text;
      let snippet: string;
      if (firstAt < 0) snippet = text.slice(0, 90);
      else {
        const start = Math.max(0, firstAt - 30);
        snippet = (start > 0 ? '…' : '') + text.slice(start, start + 100) + (start + 100 < text.length ? '…' : '');
      }
      results.push({
        pagePath: page.path, pageTitle: page.title, sectionTitle: section.title,
        anchor: section.anchor, snippet: snippet.trim(), terms,
        score: score + titleHits * 2,
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, SEARCH_LIMIT);
}
