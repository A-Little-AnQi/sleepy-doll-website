import { ending, pillars, releasesUrl } from '../site';
import { DownloadButton, useRelease } from '../releases';
import { BrandMark } from './BrandMark';
import mascotUrl from '../assets/mascot.webp';

/** 浅灰结尾区与三列特性，之后是页脚。吉祥物来自主程序 brand/mascot.webp。 */
export function Ending() {
  const { release } = useRelease();
  return (
    <>
      <section className="pillars">
        {pillars.map((p) => (
          <div key={p.id} id={p.id} className="pillars__col">
            <h3 className="pillars__title">{p.title}</h3>
            <p className="pillars__note">{p.note}</p>
          </div>
        ))}
      </section>
      <section id="download" className="ending">
        <div className="ending__inner">
          <img
            className="ending__mascot"
            src={mascotUrl}
            alt="Sleepy Doll 吉祥物"
            draggable={false}
          />
          <div className="ending__brand">
            <BrandMark className="ending__mark" />
            <span className="ending__name">Sleepy Doll</span>
          </div>
          <h2 className="ending__title">{ending.title}</h2>
          <p className="ending__sub">{ending.sub}</p>
          {release && <p className="ending__version">{release.version} · {release.channel === 'test' ? '公开测试版' : '正式版'} · Windows x64 · {(release.size / 1048576).toFixed(2)} MiB</p>}
          <DownloadButton className="btn btn--solid ending__cta" label={ending.cta} />
          <p className="download-links"><a href={releasesUrl} target="_blank" rel="noreferrer">GitHub 下载 ↗</a> · <a href="#/docs/guide">使用指南</a> · <a href="#/docs/developer">开发者的话</a></p>
        </div>
      </section>

    </>
  );
}
