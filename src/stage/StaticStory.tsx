import { useEffect, useRef, useState } from 'react';
import { hero, phases } from '../site';
import { DownloadButton } from '../releases';
import { BrandMark } from '../components/BrandMark';
import {
  APPROVE_CARD,
  CHAT_CARD,
  PLAN_CARD,
  TIMELINE_CARD,
  frontHTML,
  type CardKind,
} from './cards';

/** 960px 设计稿卡片等比缩放到容器宽。 */
function useDesignScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 960));
    ro.observe(el);
    setScale(el.clientWidth / 960);
    return () => ro.disconnect();
  }, []);
  return { ref, scale };
}

function StaticCard({ kind, idx }: { kind: CardKind; idx: number }) {
  const { ref, scale } = useDesignScale();
  return (
    <div ref={ref} className="static-card">
      <div
        className="static-card__inner three-card-face"
        style={{ transform: `scale(${scale})` }}
        dangerouslySetInnerHTML={{ __html: frontHTML(kind, idx) }}
      />
    </div>
  );
}

/**
 * 「减少动态效果」下的可顺序阅读章节：无 sticky、无螺旋、无持续动画，
 * 三段叙事纵向排列，卡片为静态 DOM。
 */
export function StaticStory() {
  const chapters: { kind: CardKind; idx: number; second?: { kind: CardKind; idx: number } }[] = [
    { kind: 'chat', idx: CHAT_CARD },
    { kind: 'plan', idx: PLAN_CARD, second: { kind: 'approve', idx: APPROVE_CARD } },
    { kind: 'timeline', idx: TIMELINE_CARD },
  ];
  return (
    <div id="story" className="static-story">
      <section className="static-hero">
        <p className="hero-eyebrow">{hero.eyebrow}</p>
        <BrandMark className="static-hero__mark" />
        <h1>{hero.title}</h1><p className="hero-sub">{hero.sub}</p>
        <div className="hero-actions"><DownloadButton className="btn btn--solid" label={hero.primary} /><a className="btn btn--ghost" href="#/docs/guide">{hero.secondary}</a></div>
      </section>
      {chapters.map((ch, i) => (
        <section key={i} className="static-story__chapter">
          <div className="static-story__text">
            <h2 className="phase-heading__title">{phases[i].lines.join('')}</h2>
            <p className="phase-heading__note">{phases[i].note}</p>
          </div>
          <div className="static-story__cards">
            <StaticCard kind={ch.kind} idx={ch.idx} />
            {ch.second && <StaticCard kind={ch.second.kind} idx={ch.second.idx} />}
          </div>
        </section>
      ))}
    </div>
  );
}
