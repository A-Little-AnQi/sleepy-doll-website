import { useEffect, useState } from 'react';
import { SiteNav } from './components/SiteNav';
import { HeroStage } from './stage/HeroStage';
import { Ending } from './components/Ending';
import { SiteFooter } from './components/SiteFooter';
import { DocsPage } from './components/DocsPage';
import { ReleaseProvider } from './releases';

/** hash 路由：#/docs* 为站内文档页，其余为主页面。 */
function isDocsRoute(): boolean {
  return location.hash.startsWith('#/docs');
}

export function App() {
  const [docs, setDocs] = useState(isDocsRoute);

  useEffect(() => {
    const onHash = () => setDocs(isDocsRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (docs) return;
    const scroll = () => requestAnimationFrame(() => {
      const id = location.hash.slice(1);
      if (id && !id.startsWith('/')) document.getElementById(id)?.scrollIntoView();
      else window.scrollTo({top:0});
    });
    scroll();
    window.addEventListener('hashchange',scroll);
    return () => window.removeEventListener('hashchange',scroll);
  },[docs]);

  return (
    <ReleaseProvider><div id="top">
      <SiteNav />
      {docs ? (
        <main>
          <DocsPage />
        </main>
      ) : (
        <main>
          <HeroStage />
          <Ending />
        </main>
      )}
      <SiteFooter />
    </div></ReleaseProvider>
  );
}
