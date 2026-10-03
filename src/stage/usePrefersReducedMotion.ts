import { useState } from 'react';

/**
 * 「减少动态效果」判定：载入时读取一次。
 * 不监听 change——会话中途翻转会导致整个舞台卸载重挂、
 * useScroll 绑定失效；系统设置变更后刷新页面即可生效。
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  return reduced;
}
