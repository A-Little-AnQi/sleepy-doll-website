import { ending, pillars, productVersion } from '../site';
import { DownloadButton, useRelease, recordEvent, downloadHref } from '../releases';
import { Wordmark } from './brand/Wordmark';
import avatarUrl from './brand/avatar.png';

/** 结尾区：大号头像吉祥物 + 插画风字标（导航 lockup 之外不再出现小图标，避免重复）。 */
export function Ending() {
  const { release, testRelease } = useRelease();
  return (
    <>
      <section id="download" className="ending">
        <div className="ending__inner">
          <img
            className="ending__mascot"
            src={avatarUrl}
            alt="Pudding 吉祥物"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="ending__brand">
            <Wordmark className="ending__name" />
          </div>
          <h2 className="ending__title">{ending.title}</h2>
          <p className="ending__sub">{ending.sub}</p>
          <p className="ending__version">{release?.version ?? productVersion}，Windows x64{release ? `，${(release.size / 1_000_000).toFixed(2)} MB` : ''}</p>
          <DownloadButton className="btn btn--solid ending__cta" label={ending.cta} />
          {testRelease && <p className="download-links"><a href={downloadHref(testRelease)} onClick={() => recordEvent('download_click', testRelease)}>下载测试版 {testRelease.version} ↗</a></p>}
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
