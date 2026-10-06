import { ending, pillars, productVersion } from '../site';
import { DownloadButton, useRelease, recordEvent } from '../releases';
import { BrandMark } from './BrandMark';
import mascotUrl from '../assets/mascot.webp';

/** 浅灰结尾区与三列特性，之后是页脚。吉祥物来自主程序 brand/mascot.webp。 */
export function Ending() {
  const { release, testRelease } = useRelease();
  return (
    <>
      <section id="download" className="ending">
        <div className="ending__inner">
          <img
            className="ending__mascot"
            src={mascotUrl}
            alt="Sleepy Doll 吉祥物"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="ending__brand">
            <BrandMark className="ending__mark" />
            <span className="ending__name">Sleepy Doll</span>
          </div>
          <h2 className="ending__title">{ending.title}</h2>
          <p className="ending__sub">{ending.sub}</p>
          <p className="ending__version">{release?.version ?? productVersion} · 正式版 · Windows x64{release ? ` · ${(release.size / 1_000_000).toFixed(2)} MB` : ''}</p>
          <DownloadButton className="btn btn--solid ending__cta" label={ending.cta} />
          {testRelease && <p className="download-links"><a href={testRelease.url} onClick={() => recordEvent('download_click', testRelease)}>下载测试版 {testRelease.version} ↗</a></p>}
        </div>
      </section>
      <section className="pillars">
        {pillars.map((p) => (
          <div key={p.id} id={p.id} className="pillars__col">
            <h3 className="pillars__title">{p.title}</h3>
            <p className="pillars__note">{p.note}</p>
          </div>
        ))}
      </section>
    </>
  );
}
