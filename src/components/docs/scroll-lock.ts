import { useEffect } from 'react';

/**
 * 文档站浮层（搜索 / 抽屉）共享的滚动锁。
 *
 * 只锁 html 的 overflow；body 保持 visible，避免 body 成为 sticky
 * 页头/侧栏的最近滚动祖先（html+body 同时 hidden 时 sticky 元素会
 * 随 body 顶部滚出视口）。html 加 scrollbar-gutter:stable 抵消滚动条
 * 消失的宽度跳动。引用计数支持两个浮层交叠开关，解锁精确还原
 * 加锁前的 inline 值；浮层内部自己 overflow:auto + overscroll-contain。
 */

let lockCount = 0;
let previous = { overflow: '', bodyOverflow: '', gutter: '' };

function acquire() {
  lockCount += 1;
  if (lockCount > 1) return;
  const html = document.documentElement;
  previous = { overflow: html.style.overflow, bodyOverflow: document.body.style.overflow, gutter: html.style.scrollbarGutter };
  html.style.overflow = 'hidden';
  html.style.scrollbarGutter = 'stable';
  // 显式写 visible 覆盖两轴：global.css 有 body{overflow-x:hidden}，
  // 置空 inline 会回落到它，body 仍会成为 sticky 的滚动祖先。
  document.body.style.overflow = 'visible';
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  const html = document.documentElement;
  html.style.overflow = previous.overflow;
  html.style.scrollbarGutter = previous.gutter;
  document.body.style.overflow = previous.bodyOverflow;
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active]);
}
