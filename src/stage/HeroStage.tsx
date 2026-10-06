import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useScroll } from 'motion/react';
import { ThreeHelixStage } from './ThreeHelixStage';
import { Headings } from './Headings';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { StaticStory } from './StaticStory';

/**
 * 主叙事舞台：滚动容器 + position:sticky 整屏舞台。
 * 进度由 motion 的 useScroll 归一化，ThreeHelixStage 阻尼后回写 damped，
 * 标题层与 3D 逐帧同步。手机约七屏，桌面六屏滚动，加上初始画面。
 */
export function HeroStage() {
  const reducedMotion = usePrefersReducedMotion();
  const [shortLandscape, setShortLandscape] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1080px) and (max-height: 600px) and (orientation: landscape)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1080px) and (max-height: 600px) and (orientation: landscape)');
    const onChange = () => setShortLandscape(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reducedMotion || shortLandscape ? <StaticStory /> : <AnimatedHeroStage />;
}

function AnimatedHeroStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const damped = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current!;
    // 部分嵌入式 WebView 会把数值超过 100 的视口单位压缩，高度由 JS 按像素显式设置。
    // 三个展示场景各保留阅读停顿，缩短过场。
    const applyHeight = () => {
      const sceneHeight = container.querySelector<HTMLElement>('.stage-sticky')?.clientHeight ?? window.innerHeight;
      container.style.height = `${Math.round(sceneHeight * 7)}px`;
    };
    applyHeight();
    window.addEventListener('resize', applyHeight);
    return () => window.removeEventListener('resize', applyHeight);
  }, []);

  return (
    <div ref={containerRef} id="story" className="stage-scroll">
      <div className="stage-sticky">
        <ThreeHelixStage progress={scrollYProgress} damped={damped} reducedMotion={false} />
        <Headings progress={damped} />
      </div>
    </div>
  );
}
