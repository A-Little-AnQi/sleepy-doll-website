import { createServer } from 'vite';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const cachePath = resolve(root, '.tmp/site-work/prerender');
let server;
try {
  server = await createServer({ root, cacheDir: cachePath, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
  const { renderPage, seoHead, sitemap, siteOrigin, knownPaths } = await server.ssrLoadModule('/src/prerender.tsx');
  const template = await readFile(join(root, 'dist/index.html'), 'utf8');
  if (!template.includes('<!-- site-seo:start -->') || !template.includes('<div id="root"></div>')) throw Error('Prerender template markers are missing');
  const images = (await readdir(join(root, 'dist/assets'))).filter(file => /^mascot-.+\.webp$/.test(file));
  if (images.length !== 1) throw Error('Expected one product mascot asset');
  const imagePath = `/assets/${images[0]}`;
  for (const path of knownPaths) {
    const html = template
      .replace(/<!-- site-seo:start -->[\s\S]*?<!-- site-seo:end -->/, seoHead(path, siteOrigin + imagePath))
      .replace('<div id="root"></div>', `<div id="root">${renderPage(path).replaceAll('/src/assets/mascot.webp', imagePath)}</div>`);
    if ((html.match(/rel="canonical"/g) ?? []).length !== 1 || !html.includes(`href="${siteOrigin}${path}"`)) throw Error(`Canonical mismatch on ${path}`);
    const output = path === '/' ? join(root, 'dist/index.html') : join(root, 'dist', path.slice(1), 'index.html');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
  }
  await writeFile(join(root, 'dist/sitemap.xml'), sitemap(), 'utf8');
  console.log(`Prerendered ${knownPaths.length} pages with metadata and existing page content.`);
} finally {
  await server?.close();
  if (process.platform === 'win32' && existsSync(cachePath)) {
    const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'E:/tools/Remove-Directory.ps1', '-Path', cachePath, '-Json'], { env: process.env, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0 || existsSync(cachePath)) throw Error(`Prerender cache cleanup failed: ${result.stdout} ${result.stderr}`);
  }
}
