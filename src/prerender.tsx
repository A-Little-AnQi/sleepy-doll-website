import { renderToString } from 'react-dom/server';
import { App } from './App';
export { seoHead, sitemap, siteOrigin } from './seo';
export { knownPaths } from './routing';
export function renderPage(path: string) { return renderToString(<App initialPath={path} />); }
