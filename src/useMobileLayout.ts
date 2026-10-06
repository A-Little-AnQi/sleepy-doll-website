import { useEffect, useState } from 'react';
export const mobileQuery = '(max-width: 1080px), (hover: none) and (pointer: coarse)';
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
