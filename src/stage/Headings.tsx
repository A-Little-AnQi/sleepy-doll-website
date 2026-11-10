import { AnimatePresence, motion, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { SPIRAL_PHASES } from './spiralMotion';
import { hero, phases } from '../site';
import { DownloadButton } from '../releases';
import { Wordmark } from '../components/brand/Wordmark';
import { BrandIcon } from '../components/brand/BrandIcon';
const toolIcons = [
  { id: 'bettergi', name: 'BetterGI', icon: '/official-bettergi.png', preview: bettergiScene, alt: 'BetterGI 在原神大世界沿小地图路线自动跑图采集' },
  { id: 'march7', name: '三月七小助手', icon: '/official-march7.png', preview: march7Scene, alt: '三月七小助手在崩坏：星穹铁道自动清体力的回合制战斗' },
  { id: 'zzz', name: 'ZZZ 一条龙', icon: '/official-onedragon.png', preview: zzzScene, alt: 'ZZZ 一条龙在绝区零自动战斗与闪避反击' },
  { id: 'maaend', name: 'MaaEnd', icon: '/official-maaend.png', preview: maaendScene, alt: 'MaaEnd 在明日方舟：终末地四人同场协同作战' },
];
import { StageVignettes } from './StageVignettes';
import bettergiScene from '../assets/previews/scene-bettergi.svg';
import march7Scene from '../assets/previews/scene-march7th.svg';
import zzzScene from '../assets/previews/scene-zzz.svg';
import maaendScene from '../assets/previews/scene-maaend.svg';

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
  const heroVisibility = useTransform(progress, (v): 'hidden' | 'visible' =>
    v >= heroPhase.hiddenAt ? 'hidden' : 'visible',
  );


  return (
    <div className="stage-copy">
      {/* 首屏退出动画统一放在布局父层：文字与轮播同格移动，不再各自绝对定位后用 translateY 纠偏 */}
      <motion.div
        className="hero-layout"
        style={{ x: heroX, opacity: heroOpacity, pointerEvents: heroEvents, visibility: heroVisibility }}
      >
        <div className="hero-copy">
          <p className="hero-eyebrow">{hero.eyebrow}</p>
          <div className="hero-title">
            <h1 className="hero-title__text">
              <span className="hero-title__bottom">
                <Wordmark className="hero-title__wordmark" />
                <span className="sr-only">{hero.title}</span>
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
        </div>
        <HeroCarousel />
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


/* ── 工具场景轮播：左列大图定格展示，右列环绕缩略轨道（静态入口同样复用） ── */
import { useEffect, useRef, useState } from 'react';

const CAROUSEL_INTERVAL = 3200; // 每个工具停留 3.2 秒

export function HeroCarousel() {
  const [step, setStep] = useState(0); // 单调累加，避免环形回转绕大圈；轨道高亮跟随目标项
  const [current, setCurrent] = useState<number | null>(null); // 上层展示图（正在入场或已就位），软件名跟随
  const [previous, setPrevious] = useState<number | null>(null); // 底板：上一张完整展示的图，上层入场完成才移除
  const [transitioning, setTransitioning] = useState(false); // 上层入场进行中：不中途换图，只记最新 active
  const currentIdRef = useRef<string | null>(null); // 当前展示图 id，供入场完成回调做过期判断
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set()); // preview 加载完成集合（按 id 去重）
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const reduced = useReducedMotion();
  const active = ((step % toolIcons.length) + toolIcons.length) % toolIcons.length;

  // 挂载时预加载全部 preview：onload/complete 后再 decode，确保解码完成才标记 ready，
  // 首张 ready 前不挂载大图、全部 ready 前不自动轮转，避免入场动画空跑
  useEffect(() => {
    let disposed = false;
    const markReady = (id: string) => {
      if (disposed) return;
      setReady((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    };
    const images = toolIcons.map((t) => {
      const image = new Image();
      const loaded = () => {
        if (typeof image.decode === 'function') {
          // 已完整加载的图 decode 通常立即 resolve；个别实现会 reject，按已加载图同样放行
          image.decode().then(() => markReady(t.id), () => markReady(t.id));
        } else {
          markReady(t.id);
        }
      };
      image.onload = loaded;
      image.src = t.preview;
      if (image.complete && image.naturalWidth > 0) loaded(); // 命中缓存时不触发 onload
      return image;
    });
    return () => { disposed = true; for (const image of images) image.onload = null; };
  }, []);

  // 后台标签暂停自动轮转，回到前台继续
  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // 转换调度：入场进行中(transitioning)不打断当前图，active 由 step 自然保留最新目标；
  // 上层 onAnimationComplete 置回 false 后，这里才启动下一次转换——旧 current 落为 previous 底板，
  // 新目标入场，任何时刻至多两层，不会堆层也不会丢底板
  useEffect(() => {
    if (transitioning) return;
    if (current !== null && current === active) return;
    if (!ready.has(toolIcons[active].id)) return; // 目标未 ready：保持现状，不白屏
    setPrevious(current);
    setCurrent(active);
    setTransitioning(true);
  }, [transitioning, current, active, ready]);

  useEffect(() => { currentIdRef.current = current === null ? null : toolIcons[current].id; }, [current]);

  const allReady = toolIcons.every((t) => ready.has(t.id));
  // 单个 setTimeout 依赖 step：手动切换即重置停留计时；重复点击当前项不影响轮转
  useEffect(() => {
    if (reduced || !allReady || !pageVisible) return;
    const timer = setTimeout(() => setStep((s) => s + 1), CAROUSEL_INTERVAL);
    return () => clearTimeout(timer);
  }, [step, reduced, allReady, pageVisible]);

  /** 前进到目标项（最多走三步，不往回转）。 */
  const advanceTo = (index: number) => {
    if (index === active) return;
    setStep(s => s + (index - (((s % toolIcons.length) + toolIcons.length) % toolIcons.length) + toolIcons.length) % toolIcons.length);
  };
  const tool = current === null ? null : toolIcons[current];
  const base = previous === null ? null : toolIcons[previous];
  return (
    <div className="hero-carousel">
      {/* 定格大图：双层结构，白底永不中露——
          底层 previous 是上一张已完整展示的普通 img（全不透明、原位、zIndex 1），
          上层 current 是 motion.img（key 按显示项，0→1/x56→0/scale.94→1 入场，zIndex 2），
          仅当上层 onAnimationComplete且回调所属图仍是当前图时才移除底板（过期回调不清新底板） */}
      <figure className="hero-carousel__figure">
        <div className="hero-carousel__frame">
          {base && (
            <img
              className="hero-carousel__img"
              src={base.preview}
              alt=""
              aria-hidden="true"
              style={{ zIndex: 1 }}
            />
          )}
          {tool && (
            <motion.img
              key={tool.id}
              className="hero-carousel__img"
              src={tool.preview}
              alt={tool.alt}
              style={{ zIndex: 2 }}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 56, y: 8, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{ duration: reduced ? 0.12 : 0.65, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => {
                if (currentIdRef.current !== tool.id) return; // 过期回调：不动更新的底板与转场状态
                setTransitioning(false);
                setPrevious(null);
              }}
            />
          )}
        </div>
        <figcaption className="hero-carousel__name">
          {tool && (
            <AnimatePresence mode="wait">
              <motion.span
                key={tool.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
                transition={{ duration: 0.18, delay: 0.04, ease: 'easeOut' }}
              >
                {tool.name}
              </motion.span>
            </AnimatePresence>
          )}
        </figcaption>
      </figure>
      {/* 缩略轨道：环体逆时针步进，缩略项逐层反向补偿，保证图和文字始终正向 */}
      <div className="hero-carousel__orbit">
        <div className="hero-carousel__ring" style={{ transform: `rotate(${-step * 90}deg)` }}>
          {toolIcons.map((t, i) => {
            const angle = i * 90 + 180; // 初始展示项位于环的左侧
            return (
              <div key={t.id} className="hero-carousel__slot" style={{ '--angle': `${angle}deg` } as React.CSSProperties}>
                <div className="hero-carousel__orbit-position">
                  <button
                    type="button"
                    className={`hero-carousel__icon${i === active ? ' is-active' : ''}`}
                    aria-pressed={i === active}
                    aria-label={t.name}
                    onClick={() => advanceTo(i)}
                    style={{ '--counter': `${step * 90 - angle}deg` } as React.CSSProperties}
                  >
                    <img src={t.icon} alt="" />
                    <span>{t.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <BrandIcon className="hero-carousel__center" />
      </div>
      {/* 窄屏切换条：与轨道同一状态与节拍，仅以图片呈现，软件名由大图 caption 表达 */}
      <div className="hero-carousel__rail">
        {toolIcons.map((t, i) => (
          <button
            type="button"
            key={t.id}
            className={`hero-carousel__rail-btn${i === active ? ' is-active' : ''}`}
            aria-pressed={i === active}
            aria-label={t.name}
            onClick={() => advanceTo(i)}
          >
            <img src={t.icon} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
