import { useEffect, useState } from 'react';
/** 760px 断点只管导航折叠，不影响版本请求与下载入口。 */
export const mobileQuery = '(max-width: 760px)';
export function useMobileLayout() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(mobileQuery).matches);
  useEffect(() => {
    const query = window.matchMedia(mobileQuery);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return mobile;
}
