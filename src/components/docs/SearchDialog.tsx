import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { searchDocs, type DocSearchResult } from '../../content/docs';
import { navigateTo } from '../../routing';
import { SearchIcon, CloseIcon } from './icons';
import { useScrollLock } from './scroll-lock';

/**
 * 文档站本地搜索（Ctrl/Cmd+K）：标题、分节与正文全文匹配，
 * 结果展示文章与相关段落，回车跳转到对应 heading。
 * Tab 圈定在对话框内，Esc/点外/关闭按钮关闭并还焦点给触发按钮。
 */

interface SearchDialogProps {
  onClose: () => void;
}

/** 在片段上高亮所有命中词（大小写不敏感，区间合并）。 */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const lower = text.toLowerCase();
  const ranges: Array<[number, number]> = [];
  for (const term of terms) {
    let at = lower.indexOf(term);
    while (at >= 0) {
      ranges.push([at, at + term.length]);
      at = lower.indexOf(term, at + term.length);
    }
  }
  if (!ranges.length) return <>{text}</>;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([...range]);
  }
  const parts: Array<string | { hit: string }> = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push({ hit: text.slice(start, end) });
    cursor = end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts.map((part, index) => typeof part === 'string' ? part : <mark key={index}>{part.hit}</mark>)}</>;
}

export function SearchDialog({ onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const results = searchDocs(query);

  useLayoutEffect(() => { inputRef.current?.focus(); }, []);
  useScrollLock(true);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    listRef.current?.querySelectorAll('.docsite-search__option')[selected]
      ?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const open = (result: DocSearchResult) => {
    onClose();
    navigateTo(result.pagePath + (result.anchor ? `#${result.anchor}` : ''));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (event.key === 'Tab') {
      // 焦点圈定：Tab/Shift+Tab 在输入框、关闭按钮与结果之间循环，不落到背景。
      const candidates: Array<HTMLElement | null> = [
        inputRef.current,
        closeRef.current,
        ...[...(dialogRef.current?.querySelectorAll<HTMLElement>('.docsite-search__option:not([disabled])') ?? [])],
      ];
      const focusables = candidates.filter((element): element is HTMLElement => element !== null);
      if (!focusables.length) return;
      const first: HTMLElement = focusables[0], last: HTMLElement = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    // Enter/箭头只在焦点位于输入框时接管：焦点在关闭或结果按钮上时保留
    // 原生 button 行为（Enter=click 该按钮），也不改 selected，避免与焦点冲突。
    if (event.target !== inputRef.current) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (results.length) setSelected(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length) setSelected(index => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = results[selected];
      if (result) open(result);
    }
  };

  return (
    <>
      <div className="docsite-search-backdrop" onClick={onClose} />
      <div
        ref={dialogRef}
        className="docsite-search"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文档"
        onKeyDown={onKeyDown}
      >
        <div className="docsite-search__bar">
          <SearchIcon />
          <input
            ref={inputRef}
            className="docsite-search__input"
            type="text"
            value={query}
            placeholder="搜索文档标题与内容…"
            aria-label="搜索关键词"
            spellCheck={false}
            autoComplete="off"
            onChange={event => setQuery(event.target.value)}
          />
          <span className="docsite-search__hint" aria-hidden="true">Esc 关闭</span>
          <button
            ref={closeRef}
            type="button"
            className="docsite-search__close"
            aria-label="关闭搜索"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="docsite-search__results" ref={listRef} role="listbox" aria-label="搜索结果">
          {query.trim() ? (
            results.length ? results.map((result, index) => (
              <button
                key={`${result.pagePath}#${result.anchor}#${index}`}
                type="button"
                role="option"
                aria-selected={index === selected}
                className={`docsite-search__option ${index === selected ? 'is-selected' : ''}`}
                onMouseEnter={() => setSelected(index)}
                onClick={() => open(result)}
              >
                <span className="docsite-search__option-page">
                  <span className="docsite-search__option-title">{result.pageTitle}</span>
                  {result.sectionTitle ? <span className="docsite-search__option-section">{result.sectionTitle}</span> : null}
                </span>
                <span className="docsite-search__option-snippet">
                  <Highlight text={result.snippet} terms={result.terms} />
                </span>
              </button>
            )) : (
              <p className="docsite-search__empty">没有找到与「{query.trim()}」相关的内容。</p>
            )
          ) : (
            <p className="docsite-search__info">输入关键词搜索全部文档，<kbd>↑</kbd><kbd>↓</kbd> 选择，<kbd>Enter</kbd> 打开。</p>
          )}
        </div>
      </div>
    </>
  );
}
