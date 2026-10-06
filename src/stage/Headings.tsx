import { motion, useTransform, type MotionValue } from 'motion/react';
import { SPIRAL_PHASES } from './spiralMotion';
import { hero, phases } from '../site';
import { DownloadButton } from '../releases';
import { BrandMark } from '../components/BrandMark';
import { StageVignettes } from './StageVignettes';

/**
 * 舞台文字层：首屏文案与脉冲柱（hero.exit 区间一起左移淡出）、
 * 三段阶段标题（各自 titleEnter/titleExit 区间，版式按阶段差异化：
 * 左中带编号 / 居中大字带黄带 / 左上带粗分隔线）。
 * 全部由阻尼后的进度 MotionValue 驱动，与螺旋逐帧同步。
 */

const { hero: heroPhase, chat, duo, timeline } = SPIRAL_PHASES;

type PhaseVariant = 'side' | 'center' | 'top';

function PhaseHeading({
  p,
  enter,
  exit,
  index,
  lines,
  note,
  variant,
}: {
  p: MotionValue<number>;
  enter: readonly [number, number];
  exit: readonly [number, number];
  index: string;
  lines: readonly [string, string];
  note: string;
  variant: PhaseVariant;
}) {
  const opacity = useTransform(p, [enter[0], enter[1], exit[0], exit[1]], [0, 1, 1, 0]);
  const y = useTransform(p, [enter[0], enter[1], exit[0], exit[1]], [26, 0, 0, -26]);
  return (
    <motion.div className={`phase-heading phase-heading--${variant}`} style={{ opacity, y }}>
      {variant === 'center' ? (
        <div className="phase-heading__body">
          <h2 className="phase-heading__title">
            {lines[0]}
            <span className="phase-heading__band-line">
              {lines[1]}
              <i className="phase-heading__band" aria-hidden="true" />
            </span>
          </h2>
          <p className="phase-heading__note">{note}</p>
        </div>
      ) : (
        <div className="phase-heading__row">
          <span className="phase-heading__index">{index}</span>
          <div className="phase-heading__body">
            <h2 className="phase-heading__title">
              {lines[0]}
              <br />
              {lines[1]}
            </h2>
            <div className="phase-heading__rule" aria-hidden="true" />
            <p className="phase-heading__note">{note}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function Headings({ progress }: { progress: MotionValue<number> }) {
  const heroX = useTransform(progress, [heroPhase.exitStart, heroPhase.exitEnd], [0, -90]);
  const heroOpacity = useTransform(progress, [heroPhase.exitStart, heroPhase.exitEnd], [1, 0]);
  const heroEvents = useTransform(progress, (v) =>
    v > heroPhase.hiddenAt - 0.01 ? 'none' : 'auto',
  );


  return (
    <div className="stage-copy">
      <motion.div
        className="hero-copy"
        style={{ x: heroX, opacity: heroOpacity, pointerEvents: heroEvents }}
      >
        <p className="hero-eyebrow">{hero.eyebrow}</p>
        <div className="hero-title">
          <div className="hero-title__brand">
            <BrandMark className="hero-title__mark" />
          </div>
          <h1 className="hero-title__text">
            <span className="hero-title__bottom">
              {hero.title}
              <i className="hero-title__band" aria-hidden="true" />
            </span>
          </h1>
        </div>
        <div className="hero-rule" />
        <p className="hero-sub">{hero.sub}</p>
        <div className="hero-actions">
          <DownloadButton className="btn btn--solid" label={hero.primary} />
          <a className="btn btn--ghost" href="/docs/guide">
            {hero.secondary}
          </a>
        </div>
      </motion.div>

      <div className="phase-headings">
        <PhaseHeading
          p={progress}
          enter={[chat.titleEnterStart, chat.titleEnterEnd]}
          exit={[chat.titleExitStart, chat.titleExitEnd]}
          index="01"
          lines={phases[0].lines}
          note={phases[0].note}
          variant="side"
        />
        <PhaseHeading
          p={progress}
          enter={[duo.titleEnterStart, duo.titleEnterEnd]}
          exit={[duo.titleExitStart, duo.titleExitEnd]}
          index="02"
          lines={phases[1].lines}
          note={phases[1].note}
          variant="center"
        />
        <PhaseHeading
          p={progress}
          enter={[timeline.titleEnterStart, timeline.titleEnterEnd]}
          exit={[timeline.titleExitStart, timeline.titleExitEnd]}
          index="03"
          lines={phases[2].lines}
          note={phases[2].note}
          variant="top"
        />
      </div>
      <StageVignettes progress={progress} />
    </div>
  );
}
