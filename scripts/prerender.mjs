import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const cachePath = resolve(root, 'target/tmp/prerender');
let server;
try {
  server = await createServer({ root, cacheDir: cachePath, server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
  const { renderPage, seoHead, sitemap, siteOrigin, knownPaths } = await server.ssrLoadModule('/src/prerender.tsx');
  const template = await readFile(join(root, 'dist/index.html'), 'utf8');
  if (!template.includes('<!-- site-seo:start -->') || !template.includes('<div id="root"></div>')) throw Error('Prerender template markers are missing');
  const manifest = JSON.parse(await readFile(join(root, 'dist/.vite/manifest.json'), 'utf8'));
  const avatar = manifest['src/components/brand/avatar.png'];
  if (!avatar?.file) throw Error('Expected brand avatar asset in manifest');
  const imagePath = `/${avatar.file}`;
  // 按源路径 → 产物文件映射，把预渲染 HTML 里的 /src/ 开发 URL 换成 /assets/ 哈希产物；
  // 键长降序避免前缀误替换；被 inline 的资源没有 file，保持原样不动。
  const assetRewrites = Object.entries(manifest)
    .filter(([key, entry]) => entry.file && /\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)$/i.test(key))
    .sort((a, b) => b[0].length - a[0].length)
    .map(([key, entry]) => [`/${key}`, `/${entry.file}`]);
  const rewriteAssetUrls = (html) => assetRewrites.reduce((out, [from, to]) => out.replaceAll(from, to), html);
  // 错误页输出为 dist/404.html：Vercel 对未匹配的静态路径返回它作为 404，
  // 不进 sitemap（knownPaths 之外），无需再生成 docs 专属 not-found 目录。
  for (const path of [...knownPaths, '/404']) {
    const html = template
      .replace(/<!-- site-seo:start -->[\s\S]*?<!-- site-seo:end -->/, seoHead(path, siteOrigin + imagePath))
      .replace('<div id="root"></div>', `<div id="root">${rewriteAssetUrls(renderPage(path))}</div>`);
    if (path === '/404') {
      if (!html.includes('noindex')) throw Error('Expected noindex on the 404 page');
    } else if ((html.match(/rel="canonical"/g) ?? []).length !== 1 || !html.includes(`href="${siteOrigin}${path}"`)) {
      throw Error(`Canonical mismatch on ${path}`);
    }
    const output = path === '/' ? join(root, 'dist/index.html') : path === '/404' ? join(root, 'dist/404.html') : join(root, 'dist', path.slice(1), 'index.html');
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
  }
  await writeFile(join(root, 'dist/sitemap.xml'), sitemap(), 'utf8');
  console.log(`Prerendered ${knownPaths.length} pages plus dist/404.html with metadata and existing page content.`);
} finally {
  await server?.close();
  if (process.platform === 'win32' && existsSync(cachePath)) {
    const result = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'E:/tools/Remove-Directory.ps1', '-Path', cachePath, '-Json'], { env: process.env, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0 || existsSync(cachePath)) throw Error(`Prerender cache cleanup failed: ${result.stdout} ${result.stderr}`);
  }
}
